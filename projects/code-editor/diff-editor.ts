import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
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
  standalone: true,
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
export class DiffEditor implements OnChanges, OnInit, OnDestroy, ControlValueAccessor {
  /**
   * The editor's built-in setup. The value can be set to
   * [`basic`](https://codemirror.net/docs/ref/#codemirror.basicSetup),
   * [`minimal`](https://codemirror.net/docs/ref/#codemirror.minimalSetup) or `null`.
   *
   * Don't support change dynamically!
   */
  @Input() setup: Setup = 'basic';

  /** The diff-editor's original value. */
  @Input() originalValue: string = '';

  /**
   * The MergeView original config's
   * [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   *
   * Don't support change dynamically!
   */
  @Input() originalExtensions: Extension[] = [];

  /** The diff-editor's modified value. */
  @Input() modifiedValue: string = '';

  /**
   * The MergeView modified config's
   * [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   *
   * Don't support change dynamically!
   */
  @Input() modifiedExtensions: Extension[] = [];

  /** Controls whether editor A or editor B is shown first. Defaults to `"a-b"`. */
  @Input() orientation?: Orientation;

  /** Controls whether revert controls are shown between changed chunks. */
  @Input() revertControls?: RevertControls;

  /** When given, this function is called to render the button to revert a chunk. */
  @Input() renderRevertControl?: RenderRevertControl;

  /**
   * By default, the merge view will mark inserted and deleted text
   * in changed chunks. Set this to false to turn that off.
   */
  @Input({ transform: booleanAttribute }) highlightChanges = true;

  /** Controls whether a gutter marker is shown next to changed lines. */
  @Input({ transform: booleanAttribute }) gutter = true;

  /** Whether the diff-editor is disabled. */
  @Input({ transform: booleanAttribute }) disabled = false;

  /**
   * When given, long stretches of unchanged text are collapsed.
   * `margin` gives the number of lines to leave visible after/before
   * a change (default is 3), and `minSize` gives the minimum amount
   * of collapsible lines that need to be present (defaults to 4).
   */
  @Input() collapseUnchanged?: { margin?: number; minSize?: number };

  /** Pass options to the diff algorithm. */
  @Input() diffConfig?: DiffConfig;

  /** Event emitted when the editor's original value changes. */
  @Output() originalValueChange = new EventEmitter<string>();

  /** Event emitted when the editor's modified value changes. */
  @Output() modifiedValueChange = new EventEmitter<string>();

  private _onChange: (value: DiffEditorModel) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(private _elementRef: ElementRef<Element>) {}

  /** The merge view instance. */
  mergeView?: MergeView;

  private _updateListener = (editor: 'a' | 'b') => {
    return EditorView.updateListener.of(vu => {
      if (vu.docChanged && !vu.transactions.some(tr => tr.annotation(External))) {
        const value = vu.state.doc.toString();
        if (editor == 'a') {
          this._onChange({ original: value, modified: this.modifiedValue });
          this.originalValue = value;
          this.originalValueChange.emit(value);
        } else if (editor == 'b') {
          this._onChange({ original: this.originalValue, modified: value });
          this.modifiedValue = value;
          this.modifiedValueChange.emit(value);
        }
      }
    });
  };

  private _editableConf = new Compartment();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['originalValue']) {
      this.setValue('a', this.originalValue);
    }
    if (changes['modifiedValue']) {
      this.setValue('b', this.modifiedValue);
    }
    if (changes['orientation']) {
      this.mergeView?.reconfigure({ orientation: this.orientation });
    }
    if (changes['revertControls']) {
      this.mergeView?.reconfigure({ revertControls: this.revertControls });
    }
    if (changes['renderRevertControl']) {
      this.mergeView?.reconfigure({ renderRevertControl: this.renderRevertControl });
    }
    if (changes['highlightChanges']) {
      this.mergeView?.reconfigure({ highlightChanges: this.highlightChanges });
    }
    if (changes['gutter']) {
      this.mergeView?.reconfigure({ gutter: this.gutter });
    }
    if (changes['collapseUnchanged']) {
      this.mergeView?.reconfigure({ collapseUnchanged: this.collapseUnchanged });
    }
    if (changes['diffConfig']) {
      this.mergeView?.reconfigure({ diffConfig: this.diffConfig });
    }
    if (changes['disabled']) {
      this.setEditable('a', !this.disabled);
      this.setEditable('b', !this.disabled);
    }
  }

  ngOnInit(): void {
    this.mergeView = new MergeView({
      parent: this._elementRef.nativeElement,
      a: {
        doc: this.originalValue,
        extensions: [
          this._updateListener('a'),
          this._editableConf.of([]),
          this.setup === 'basic' ? basicSetup : this.setup === 'minimal' ? minimalSetup : [],
          ...this.originalExtensions,
        ],
      },
      b: {
        doc: this.modifiedValue,
        extensions: [
          this._updateListener('b'),
          this._editableConf.of([]),
          this.setup === 'basic' ? basicSetup : this.setup === 'minimal' ? minimalSetup : [],
          ...this.modifiedExtensions,
        ],
      },
      orientation: this.orientation,
      revertControls: this.revertControls,
      renderRevertControl: this.renderRevertControl,
      highlightChanges: this.highlightChanges,
      gutter: this.gutter,
      collapseUnchanged: this.collapseUnchanged,
      diffConfig: this.diffConfig,
    });

    this.setEditable('a', !this.disabled);
    this.setEditable('b', !this.disabled);
  }

  ngOnDestroy(): void {
    this.mergeView?.destroy();
  }

  writeValue(value: DiffEditorModel): void {
    if (this.mergeView && value != null && typeof value === 'object') {
      this.originalValue = value.original;
      this.modifiedValue = value.modified;
      this.setValue('a', value.original);
      this.setValue('b', value.modified);
    }
  }

  registerOnChange(fn: (value: DiffEditorModel) => void) {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.setEditable('a', !isDisabled);
    this.setEditable('b', !isDisabled);
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
