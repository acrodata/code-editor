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

import { LanguageDescription } from '@codemirror/language';
import { Annotation, Compartment, EditorState, Extension, StateEffect } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { placeholder } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';

const External = Annotation.define<boolean>();

export type Theme = 'light' | 'dark' | Extension;

@Component({
  selector: 'code-editor',
  standalone: true,
  template: ``,
  encapsulation: ViewEncapsulation.None,
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
  /**
   * The document or shadow root that the view lives in.
   *
   * https://codemirror.net/docs/ref/#view.EditorView.root
   */
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
  private _value = '';

  /** Editor's theme. */
  @Input() theme: Theme = 'light';

  /** Editor's placecholder. */
  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.reconfigure();
  }
  private _placeholder = '';

  /** Whether the editor is disabled.  */
  @Input({ transform: booleanAttribute })
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    // run `reconfigure()` in the setDisabledState
  }
  private _disabled = false;

  /** Whether the editor is readonly. */
  @Input({ transform: booleanAttribute })
  get readonly() {
    return this._readonly;
  }
  set readonly(value: boolean) {
    this._readonly = value;
    this.reconfigure();
  }
  private _readonly = false;

  /** Whether focus on the editor when init. */
  @Input({ transform: booleanAttribute }) autoFocus = false;

  /**
   * An array of language descriptions for known language packages.
   *
   * https://github.com/codemirror/language-data/blob/main/src/language-data.ts
   */
  @Input()
  get languages() {
    return this._languages;
  }
  set languages(value: LanguageDescription[]) {
    this._languages = value;
    this.setLanguage(this.language);
  }
  private _languages: LanguageDescription[] = [];

  /** Editor's language. You should set the `languages` option at first. */
  @Input()
  get language() {
    return this._language;
  }
  set language(lang: string) {
    this._language = lang;
    if (this.languages.length > 0) {
      this.setLanguage(lang);
    }
  }
  private _language = '';

  /**
   * EditorState's [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   * It includes the [basicSetup](https://codemirror.net/docs/ref/#codemirror.basicSetup) by default.
   */
  @Input() extensions: Extension[] = [basicSetup];

  /** Event emitted when the editor's value changes. */
  @Output() change = new EventEmitter<string>();

  /** Event emitted when focus on the editor. */
  @Output() focus = new EventEmitter<void>();

  /** Event emitted when the editor has lost focus. */
  @Output() blur = new EventEmitter<void>();

  view?: EditorView | null;

  langCompartment = new Compartment();

  private _onChange: (value: string) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(private _elementRef: ElementRef<Element>) {}

  /** Register a function to be called every time the view updates. */
  private _updateListener = EditorView.updateListener.of(vu => {
    if (vu.docChanged && !vu.transactions.some(tr => tr.annotation(External))) {
      const value = vu.state.doc.toString();
      this._onChange(value);
      this.change.emit(value);
    }
  });

  /** Get the extensions of the editor. */
  getExtensions(): Extension[] {
    const basicExtensions = [
      this._updateListener,
      this.langCompartment.of([]),
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

  /** Find the language's extension by its name. Case insensitive. */
  findLanguage(name: string) {
    for (const lang of this.languages) {
      for (const alias of [lang.name, ...lang.alias]) {
        if (name.toLowerCase() === alias.toLowerCase()) {
          return lang;
        }
      }
    }

    console.error(`Language not found: ${this.language}`);

    if (this.languages.length === 0) {
      console.error('The languages is empty.');
    } else {
      console.info('Supported language names:');
      console.info(this.languages.map(lang => lang.name).join(', '));
    }

    return null;
  }

  /** Sets the language's extension for the editor. */
  setLanguage(lang: string) {
    if (!lang) {
      this.view?.dispatch({
        effects: this.langCompartment.reconfigure([]),
      });
      return;
    }

    const langDesc = this.findLanguage(lang);
    langDesc?.load().then(lang => {
      this.view?.dispatch({
        effects: this.langCompartment.reconfigure([lang]),
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    this.view = new EditorView({
      root: this.root,
      parent: this._elementRef.nativeElement,
      state: EditorState.create({
        doc: this.value,
        extensions: this.getExtensions(),
      }),
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
