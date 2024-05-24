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
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Annotation, EditorState, Extension, StateEffect } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { placeholder } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';

const External = Annotation.define<boolean>();

export type Theme = 'light' | 'dark' | Extension;

@Component({
  selector: 'code-editor',
  standalone: true,
  imports: [],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeEditor),
      multi: true,
    },
  ],
})
export class CodeEditor implements OnChanges, OnInit, OnDestroy, ControlValueAccessor {
  @Input() root?: Document | ShadowRoot;

  /** Editor's value. */
  @Input()
  get value() {
    return this._value;
  }
  set value(newValue: string) {
    this._value = newValue;
    this.setValue(newValue);
  }
  _value = '';

  /** Editor's theme. */
  @Input() theme: Theme = 'light';

  /** Editor's placecholder. */
  @Input() placeholder = '';

  /** Whether the editor is disabled.  */
  @Input() disabled = false;

  /** Whether the editor is readonly. */
  @Input() readonly = false;

  /** Whether focus on the editor when init. */
  @Input() autoFocus = false;

  /**
   * EditorState's [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   */
  @Input() extensions: Extension[] = [basicSetup];

  /** Event emitted when the editor's value changes. */
  @Output() change = new EventEmitter<string>();

  /** Event emitted when focus on the editor. */
  @Output() focus = new EventEmitter<void>();

  /** Event emitted when the editor has lost focus. */
  @Output() blur = new EventEmitter<void>();

  view?: EditorView | null;

  private _onChange: (value: string) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(private _elementRef: ElementRef<Element>) {}

  /** Register a function to be called every time the view updates. */
  private _updateListener = EditorView.updateListener.of(vu => {
    if (vu.docChanged && !vu.transactions.some(tr => tr.annotation(External))) {
      const doc = vu.state.doc;
      const value = doc.toString();
      this._onChange(value);
      this.change.emit(value);
    }
  });

  /** Get the extensions of the editor. */
  getExtensions(): Extension[] {
    const basicExtensions = [
      this._updateListener,
      EditorView.editable.of(!this.disabled),
      EditorState.readOnly.of(this.readonly),
      placeholder(this.placeholder),
    ];

    if (this.theme == 'light') {
      // nothing to do
    } else if (this.theme == 'dark') {
      basicExtensions.push(oneDark);
    } else {
      basicExtensions.push(this.theme);
    }

    return basicExtensions.concat(this.extensions);
  }

  /** Reconfigure the root extensions of the editor. */
  reconfigure() {
    this.view?.dispatch({
      effects: StateEffect.reconfigure.of(this.getExtensions()),
    });
  }

  /** Sets the editor's value. */
  setValue(value: string) {
    this.view?.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: value },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.view) {
      this.reconfigure();
    }
  }

  ngOnInit(): void {
    this.view = new EditorView({
      root: this.root,
      parent: this._elementRef.nativeElement,
      state: EditorState.create({ doc: this.value, extensions: this.getExtensions() }),
    });

    if (this.autoFocus) {
      this.view?.focus();
    }

    this.view?.contentDOM.addEventListener('focus', () => {
      this._onTouched();
      this.focus.emit();
    });

    this.view?.contentDOM.addEventListener('blur', () => {
      this._onTouched();
      this.blur.emit();
    });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
    this.view = null;
  }

  writeValue(value: string): void {
    if (this.view) {
      this.setValue(value);
    }
  }

  registerOnChange(fn: (value: string) => void) {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.reconfigure();
  }
}
