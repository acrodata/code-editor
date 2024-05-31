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
} from '@angular/core';

import { External, Setup } from '@acrodata/code-editor';
import { DiffConfig, MergeView } from '@codemirror/merge';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup, minimalSetup } from 'codemirror';

export type Orientation = 'a-b' | 'b-a';
export type RevertControls = 'a-to-b' | 'b-to-a';
export type RenderRevertControl = () => HTMLElement;

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
})
export class DiffEditor implements OnChanges, OnInit, OnDestroy {
  /**
   * The editor's built-in setup. The value can be set to
   * [`basic`](https://codemirror.net/docs/ref/#codemirror.basicSetup),
   * [`minimal`](https://codemirror.net/docs/ref/#codemirror.minimalSetup) or `null`.
   *
   * Don't support change dynamically!
   */
  @Input() setup: Setup = 'basic';

  /** The diff-editor's original value. */
  @Input() originalValue = '';

  /**
   * The MergeView original config's
   * [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   *
   * Don't support change dynamically!
   */
  @Input() originalExtensions: Extension[] = [];

  /** The diff-editor's modified value. */
  @Input() modifiedValue = '';

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

  constructor(private _elementRef: ElementRef<Element>) {}

  /** The merge view instance. */
  mergeView?: MergeView;

  private _updateListener = (valueChange: EventEmitter<string>) => {
    return EditorView.updateListener.of(vu => {
      if (vu.docChanged && !vu.transactions.some(tr => tr.annotation(External))) {
        const value = vu.state.doc.toString();
        valueChange.emit(value);
      }
    });
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['originalValue']) {
      this.setOriginalValue(this.originalValue);
    }
    if (changes['modifiedValue']) {
      this.setModifiedValue(this.modifiedValue);
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
  }

  ngOnInit(): void {
    this.mergeView = new MergeView({
      parent: this._elementRef.nativeElement,
      a: {
        doc: this.originalValue,
        extensions: [
          this._updateListener(this.originalValueChange),
          this.setup === 'basic' ? basicSetup : this.setup === 'minimal' ? minimalSetup : [],
          ...this.originalExtensions,
        ],
      },
      b: {
        doc: this.modifiedValue,
        extensions: [
          this._updateListener(this.modifiedValueChange),
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
  }

  ngOnDestroy(): void {
    this.mergeView?.destroy();
  }

  /** Sets diff-editor's original value. */
  setOriginalValue(value: string) {
    this.mergeView?.a.dispatch({
      changes: { from: 0, to: this.mergeView.a.state.doc.length, insert: value },
    });
  }

  /** Sets diff-editor's modified value. */
  setModifiedValue(value: string) {
    this.mergeView?.b.dispatch({
      changes: { from: 0, to: this.mergeView.b.state.doc.length, insert: value },
    });
  }
}
