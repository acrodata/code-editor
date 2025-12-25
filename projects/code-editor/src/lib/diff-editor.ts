// noinspection CssUnusedSymbol

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  model,
  effect,
  DestroyRef,
  output,
  linkedSignal,
} from '@angular/core';
import { DiffConfig, MergeView } from '@codemirror/merge';
import { Compartment, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup, minimalSetup } from 'codemirror';
import { External, Setup } from './code-editor';
import { FormValueControl } from '@angular/forms/signals';

export type Orientation = 'a-b' | 'b-a';
export type RevertControls = 'a-to-b' | 'b-to-a';
export type RenderRevertControl = () => HTMLElement;

export interface DiffEditorModel {
  original: string;
  modified: string;
}

@Component({
  selector: 'diff-editor',
  template: ``,
  styles: `
    .diff-editor {
      display: block;

      .cm-mergeView,
      .cm-mergeViewEditors {
        height: 100%;
      }

      .cm-mergeView .cm-editor,
      .cm-mergeView .cm-scroller {
        height: 100% !important;
      }
    }
  `,
  host: {
    class: 'diff-editor',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiffEditor implements FormValueControl<DiffEditorModel> {
  private _elementRef = inject<ElementRef<Element>>(ElementRef);

  /**
   * The editor's built-in setup. The value can be set to
   * [`basic`](https://codemirror.net/docs/ref/#codemirror.basicSetup),
   * [`minimal`](https://codemirror.net/docs/ref/#codemirror.minimalSetup) or `null`.
   *
   * Don't support change dynamically!
   */
  readonly setup = input<Setup>('basic');

  readonly value = model<DiffEditorModel>({
    original: '',
    modified: '',
  });

  /**
   * The MergeView original config's
   * [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   *
   * Doesn't support changing dynamically!
   */
  readonly originalExtensions = input<Extension[]>([]);

  /**
   * The MergeView modified config's
   * [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   *
   * Doesn't support changing dynamically!
   */
  readonly modifiedExtensions = input<Extension[]>([]);

  /** Controls whether editor A or editor B is shown first. Defaults to `"a-b"`. */
  readonly orientation = input<Orientation>();

  /** Controls whether revert controls are shown between changed chunks. */
  readonly revertControls = input<RevertControls>();

  /** When given, this function is called to render the button to revert a chunk. */
  readonly renderRevertControl = input<RenderRevertControl>();

  /**
   * By default, the merge view marks inserted and deleted text in changed chunks.
   * Set this to `false` to turn that off.
   */
  readonly highlightChanges = input(true, { transform: booleanAttribute });

  /** Controls whether a gutter marker is shown next to changed lines. */
  readonly gutter = input(true, { transform: booleanAttribute });

  /** Whether the diff-editor is disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * When given, long stretches of unchanged text are collapsed.
   * `margin` gives the number of lines to leave visible after/before
   * a change (default is 3), and `minSize` gives the minimum amount
   * of collapsible lines that need to be present (defaults to 4).
   */
  readonly collapseUnchanged = input<{ margin?: number; minSize?: number }>();

  /** Pass options to the diff algorithm. */
  readonly diffConfig = input<DiffConfig>();

  /** Event emitted when focus on the original editor. */
  readonly originalFocus = output<void>();

  /** Event emitted when blur on the original editor. */
  readonly originalBlur = output<void>();

  /** Event emitted when focus on the modified editor. */
  readonly modifiedFocus = output<void>();

  /** Event emitted when blur on the modified editor. */
  readonly modifiedBlur = output<void>();

  /** The merge view instance. */
  mergeView?: MergeView;

  private _lastInternalChange: DiffEditorModel | null = null;

  private _updateListener = (editor: 'a' | 'b') => {
    return EditorView.updateListener.of(vu => {
      if (vu.docChanged && !vu.transactions.some(tr => tr.annotation(External))) {
        const value = vu.state.doc.toString();
        this.value.update(model => {
          const newModel = { ...model, [editor === 'a' ? 'original' : 'modified']: value };
          this._lastInternalChange = newModel;
          return newModel;
        });
      }
    });
  };

  private _editableConf = new Compartment();

  constructor() {
    this.mergeView = new MergeView({
      parent: this._elementRef.nativeElement,
      a: {
        doc: this.value().original,
        extensions: [
          this._updateListener('a'),
          this._editableConf.of([]),
          this.setup() === 'basic' ? basicSetup : this.setup() === 'minimal' ? minimalSetup : [],
          ...this.originalExtensions(),
        ],
      },
      b: {
        doc: this.value().modified,
        extensions: [
          this._updateListener('b'),
          this._editableConf.of([]),
          this.setup() === 'basic' ? basicSetup : this.setup() === 'minimal' ? minimalSetup : [],
          ...this.modifiedExtensions(),
        ],
      },
      orientation: this.orientation(),
      revertControls: this.revertControls(),
      renderRevertControl: this.renderRevertControl(),
      highlightChanges: this.highlightChanges(),
      gutter: this.gutter(),
      collapseUnchanged: this.collapseUnchanged(),
      diffConfig: this.diffConfig(),
    });

    this.mergeView?.a.contentDOM.addEventListener('focus', () => {
      this.originalFocus.emit();
    });

    this.mergeView?.a.contentDOM.addEventListener('blur', () => {
      this.originalBlur.emit();
    });

    this.mergeView?.b.contentDOM.addEventListener('focus', () => {
      this.modifiedFocus.emit();
    });

    this.mergeView?.b.contentDOM.addEventListener('blur', () => {
      this.modifiedBlur.emit();
    });

    effect(() => {
      this.setEditable('a', !this.disabled());
      this.setEditable('b', !this.disabled());
    });

    let initial = true;

    effect(() => {
      const value = this.value();

      if (value === this._lastInternalChange) return;

      if (!initial) {
        this.setValue('a', value.original);
        this.setValue('b', value.modified);
      }
    });

    effect(() => {
      const orientation = this.orientation();

      if (!initial) {
        this.mergeView?.reconfigure({ orientation });
      }
    });

    effect(() => {
      const revertControls = this.revertControls();

      if (!initial) {
        this.mergeView?.reconfigure({ revertControls });
      }
    });

    effect(() => {
      const renderRevertControl = this.renderRevertControl();

      if (!initial) {
        this.mergeView?.reconfigure({ renderRevertControl });
      }
    });

    effect(() => {
      const highlightChanges = this.highlightChanges();

      if (!initial) {
        this.mergeView?.reconfigure({ highlightChanges });
      }
    });

    effect(() => {
      const gutter = this.gutter();

      if (!initial) {
        this.mergeView?.reconfigure({ gutter });
      }
    });

    effect(() => {
      const collapseUnchanged = this.collapseUnchanged();

      if (!initial) {
        this.mergeView?.reconfigure({ collapseUnchanged });
      }
    });

    effect(() => {
      const diffConfig = this.diffConfig();

      if (!initial) {
        this.mergeView?.reconfigure({ diffConfig });
      }
    });

    initial = false;

    inject(DestroyRef).onDestroy(() => this.mergeView?.destroy());
  }

  /** Sets diff-editor's value. */
  private setValue(editor: 'a' | 'b', value: string) {
    const view = this.mergeView?.[editor];
    if (!view || view.state.doc.toString() === value) return;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      annotations: External.of(true),
    });
  }

  /** Sets diff-editor's editable state. */
  setEditable(editor: 'a' | 'b', value: boolean) {
    this.mergeView?.[editor].dispatch({
      effects: this._editableConf.reconfigure(EditorView.editable.of(value)),
    });
  }
}
