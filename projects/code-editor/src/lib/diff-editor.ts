// noinspection CssUnusedSymbol

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  model,
  effect,
  DestroyRef,
  output,
  linkedSignal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DiffConfig, MergeView } from '@codemirror/merge';
import { Compartment, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup, minimalSetup } from 'codemirror';

import { External, Setup } from './code-editor';

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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DiffEditor),
      multi: true,
    },
  ],
})
export class DiffEditor implements ControlValueAccessor {
  private _elementRef = inject<ElementRef<Element>>(ElementRef);

  /**
   * The editor's built-in setup. The value can be set to
   * [`basic`](https://codemirror.net/docs/ref/#codemirror.basicSetup),
   * [`minimal`](https://codemirror.net/docs/ref/#codemirror.minimalSetup) or `null`.
   *
   * Don't support change dynamically!
   */
  readonly setup = input<Setup>('basic');

  /** The diff-editor's original value. */
  readonly originalValue = model('');

  /**
   * The MergeView original config's
   * [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   *
   * Doesn't support changing dynamically!
   */
  readonly originalExtensions = input<Extension[]>([]);

  /** The diff-editor's modified value. */
  readonly modifiedValue = model('');

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
  private readonly disabledInternal = linkedSignal(this.disabled);

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

  private _onChange: (value: DiffEditorModel) => void = () => {};
  private _onTouched: () => void = () => {};

  /** The merge view instance. */
  mergeView?: MergeView;

  private _updateListener = (editor: 'a' | 'b') => {
    return EditorView.updateListener.of(vu => {
      if (vu.docChanged && !vu.transactions.some(tr => tr.annotation(External))) {
        const value = vu.state.doc.toString();
        if (editor == 'a') {
          this._onChange({ original: value, modified: this.modifiedValue() });
          this.originalValue.set(value);
        } else if (editor == 'b') {
          this._onChange({ original: this.originalValue(), modified: value });
          this.modifiedValue.set(value);
        }
      }
    });
  };

  private _editableConf = new Compartment();

  constructor() {
    this.mergeView = new MergeView({
      parent: this._elementRef.nativeElement,
      a: {
        doc: this.originalValue(),
        extensions: [
          this._updateListener('a'),
          this._editableConf.of([]),
          this.setup() === 'basic' ? basicSetup : this.setup() === 'minimal' ? minimalSetup : [],
          ...this.originalExtensions(),
        ],
      },
      b: {
        doc: this.modifiedValue(),
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
      this._onTouched();
      this.originalFocus.emit();
    });

    this.mergeView?.a.contentDOM.addEventListener('blur', () => {
      this._onTouched();
      this.originalBlur.emit();
    });

    this.mergeView?.b.contentDOM.addEventListener('focus', () => {
      this._onTouched();
      this.modifiedFocus.emit();
    });

    this.mergeView?.b.contentDOM.addEventListener('blur', () => {
      this._onTouched();
      this.modifiedBlur.emit();
    });

    effect(() => {
      this.setEditable('a', !this.disabledInternal());
      this.setEditable('b', !this.disabledInternal());
    });

    let initial = true;

    effect(() => {
      const value = this.originalValue();

      if (!initial) {
        this.setValue('a', value);
      }
    });

    effect(() => {
      const value = this.modifiedValue();

      if (!initial) {
        this.setValue('b', value);
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

  writeValue(value: DiffEditorModel): void {
    if (this.mergeView && value != null && typeof value === 'object') {
      this.originalValue.set(value.original);
      this.modifiedValue.set(value.modified);
      // this.setValue('a', value.original);
      // this.setValue('b', value.modified);
    }
  }

  registerOnChange(fn: (value: DiffEditorModel) => void) {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabledInternal.set(isDisabled);
  }

  /** Sets diff-editor's value. */
  setValue(editor: 'a' | 'b', value: string) {
    this.mergeView?.[editor].dispatch({
      changes: { from: 0, to: this.mergeView[editor].state.doc.length, insert: value },
    });
  }

  /** Sets diff-editor's editable state. */
  setEditable(editor: 'a' | 'b', value: boolean) {
    this.mergeView?.[editor].dispatch({
      effects: this._editableConf.reconfigure(EditorView.editable.of(value)),
    });
  }
}
