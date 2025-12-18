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
  DestroyRef,
  effect,
  linkedSignal,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { indentWithTab } from '@codemirror/commands';
import { LanguageDescription, indentUnit } from '@codemirror/language';
import {
  Annotation,
  Compartment,
  EditorState,
  Extension,
  StateEffect,
  Transaction,
} from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, highlightWhitespace, keymap, placeholder } from '@codemirror/view';
import { basicSetup, minimalSetup } from 'codemirror';

export type Theme = 'light' | 'dark' | Extension;
export type Setup = 'basic' | 'minimal' | null;

export const External = Annotation.define<boolean>();

@Component({
  selector: 'code-editor',
  template: ``,
  styles: `
    .code-editor {
      display: block;

      .cm-editor {
        height: 100%;
      }
    }
  `,
  host: {
    class: 'code-editor',
  },
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
export class CodeEditor implements ControlValueAccessor {
  private readonly _elementRef = inject<ElementRef<Element>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * EditorView's [root](https://codemirror.net/docs/ref/#view.EditorView.root).
   *
   * Don't support change dynamically!
   */
  readonly root = input<Document | ShadowRoot>();

  /**
   * Whether focus on the editor after init.
   *
   * Don't support change dynamically!
   */
  readonly autoFocus = input(false, { transform: booleanAttribute });

  /** The editor's value. */
  readonly value = input('');

  /** Whether the editor is disabled.  */
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly innerDisabled = linkedSignal(this.disabled);

  /** Whether the editor is readonly. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** The editor's theme. */
  readonly theme = input<Theme>('light');

  /** The editor's placeholder. */
  readonly placeholder = input('');

  /** Whether indent with Tab key. */
  readonly indentWithTab = input(false, { transform: booleanAttribute });

  /** Should be a string consisting either entirely of the same whitespace character. */
  readonly indentUnit = input('');

  /** Whether the editor wraps lines. */
  readonly lineWrapping = input(false, { transform: booleanAttribute });

  /** Whether highlight the whitespace. */
  readonly highlightWhitespace = input(false, { transform: booleanAttribute });

  /**
   * An array of language descriptions for known
   * [language-data](https://github.com/codemirror/language-data/blob/main/src/language-data.ts).
   *
   * Don't support change dynamically!
   */
  readonly languages = input<LanguageDescription[]>([]);

  /** The editor's language. You should set the `languages` prop at first. */
  readonly language = input('');

  /**
   * The editor's built-in setup. The value can be set to
   * [`basic`](https://codemirror.net/docs/ref/#codemirror.basicSetup),
   * [`minimal`](https://codemirror.net/docs/ref/#codemirror.minimalSetup) or `null`.
   */
  readonly setup = input<Setup>('basic');

  /**
   * It will be appended to the root
   * [extensions](https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions).
   */
  readonly extensions = input<Extension[]>([]);

  /** Event emitted when the editor's value changes. */
  readonly change = output<string>();

  /** Event emitted when focus on the editor. */
  readonly focus = output<void>();

  /** Event emitted when the editor has lost focus. */
  readonly blur = output<void>();

  private _onChange: (value: string) => void = () => {};
  private _onTouched: () => void = () => {};

  /**
   * The instance of [EditorView](https://codemirror.net/docs/ref/#view.EditorView).
   */
  view!: EditorView;

  /**
   * The new state created by [EditorState](https://codemirror.net/docs/ref/#state.EditorState)
   */
  state!: EditorState;

  private _updateListener = EditorView.updateListener.of(vu => {
    if (vu.docChanged && !vu.transactions.some(tr => tr.annotation(External))) {
      const value = vu.state.doc.toString();
      this._onChange(value);
      this.change.emit(value);
    }
  });

  // Extension compartments can be used to make a configuration dynamic.
  // https://codemirror.net/docs/ref/#state.Compartment
  private _editableConf = new Compartment();
  private _readonlyConf = new Compartment();
  private _themeConf = new Compartment();
  private _placeholderConf = new Compartment();
  private _indentWithTabConf = new Compartment();
  private _indentUnitConf = new Compartment();
  private _lineWrappingConf = new Compartment();
  private _highlightWhitespaceConf = new Compartment();
  private _languageConf = new Compartment();

  private _getAllExtensions() {
    return [
      this._updateListener,

      this._editableConf.of([]),
      this._readonlyConf.of([]),
      this._themeConf.of([]),
      this._placeholderConf.of([]),
      this._indentWithTabConf.of([]),
      this._indentUnitConf.of([]),
      this._lineWrappingConf.of([]),
      this._highlightWhitespaceConf.of([]),
      this._languageConf.of([]),

      this.setup() === 'basic' ? basicSetup : this.setup() === 'minimal' ? minimalSetup : [],

      ...this.extensions(),
    ];
  }

  constructor() {
    this.state = EditorState.create({
      doc: this.value(),
      extensions: this._getAllExtensions(),
    });
    this.view = new EditorView({
      root: this.root(),
      parent: this._elementRef.nativeElement,
      state: this.state,
    });

    if (this.autoFocus()) {
      this.view.focus();
    }

    this.view.contentDOM.addEventListener('focus', () => {
      this._onTouched();
      this.focus.emit();
    });

    this.view.contentDOM.addEventListener('blur', () => {
      this._onTouched();
      this.blur.emit();
    });

    this.setEditable(!this.disabled);

    effect(() => {
      const readonly = this.readonly();

      if (this.view) {
        this.setReadonly(readonly);
      }
    });

    effect(() => {
      const theme = this.theme();

      if (this.view) {
        this.setTheme(theme);
      }
    });

    effect(() => {
      const placeholder = this.placeholder();

      if (this.view) {
        this.setPlaceholder(placeholder);
      }
    });

    effect(() => {
      const value = this.indentWithTab();

      if (this.view) {
        this.setIndentWithTab(value);
      }
    });

    effect(() => {
      const value = this.indentUnit();

      if (this.view) {
        this.setIndentUnit(value);
      }
    });

    effect(() => {
      const value = this.lineWrapping();

      if (this.view) {
        this.setLineWrapping(value);
      }
    });

    effect(() => {
      const value = this.highlightWhitespace();

      if (this.view) {
        this.setHighlightWhitespace(value);
      }
    });

    effect(() => {
      const value = this.language();

      if (this.view) {
        this.setLanguage(value);
      }
    });

    effect(() => {
      this.setup();
      this.extensions();

      this.setExtensions(this._getAllExtensions());
    });

    let initial = true;

    effect(() => {
      const value = this.value();

      if (!initial && this.view) {
        this.setValue(value);
      }
    });

    effect(() => {
      // this is linked to the disabled input
      const disabled = this.innerDisabled();

      if (!initial && this.view) {
        this.setEditable(!disabled);
      }
    });

    initial = false;

    this.destroyRef.onDestroy(() => this.view.destroy());
  }

  writeValue(value: any): void {
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
    this.innerDisabled.set(isDisabled);
    // triggered with effect
  }

  /** Sets editor's value. */
  setValue(value: string) {
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: value },
      annotations: Transaction.addToHistory.of(false),
    });
  }

  private _dispatchEffects(effects: StateEffect<any> | readonly StateEffect<any>[]) {
    return this.view.dispatch({ effects });
  }

  /** Sets the root extensions of the editor. */
  setExtensions(value: Extension[]) {
    this._dispatchEffects(StateEffect.reconfigure.of(value));
  }

  /** Sets editor's editable state. */
  setEditable(value: boolean) {
    this._dispatchEffects(this._editableConf.reconfigure(EditorView.editable.of(value)));
  }

  /** Sets editor's readonly state. */
  setReadonly(value: boolean) {
    this._dispatchEffects(this._readonlyConf.reconfigure(EditorState.readOnly.of(value)));
  }

  /** Sets editor's theme. */
  setTheme(value: Theme) {
    this._dispatchEffects(
      this._themeConf.reconfigure(value === 'light' ? [] : value === 'dark' ? oneDark : value)
    );
  }

  /** Sets editor's placeholder. */
  setPlaceholder(value: string) {
    this._dispatchEffects(this._placeholderConf.reconfigure(value ? placeholder(value) : []));
  }

  /** Sets editor' indentWithTab. */
  setIndentWithTab(value: boolean) {
    this._dispatchEffects(
      this._indentWithTabConf.reconfigure(value ? keymap.of([indentWithTab]) : [])
    );
  }

  /** Sets editor's indentUnit. */
  setIndentUnit(value: string) {
    this._dispatchEffects(this._indentUnitConf.reconfigure(value ? indentUnit.of(value) : []));
  }

  /** Sets editor's lineWrapping. */
  setLineWrapping(value: boolean) {
    this._dispatchEffects(this._lineWrappingConf.reconfigure(value ? EditorView.lineWrapping : []));
  }

  /** Sets editor's highlightWhitespace. */
  setHighlightWhitespace(value: boolean) {
    this._dispatchEffects(
      this._highlightWhitespaceConf.reconfigure(value ? highlightWhitespace() : [])
    );
  }

  /** Sets editor's language dynamically. */
  setLanguage(lang: string) {
    if (!lang || lang == 'plaintext') {
      this._dispatchEffects(this._languageConf.reconfigure([]));
      return;
    }
    if (this.languages().length === 0) {
      if (this.view) {
        console.error('No supported languages. Please set the `languages` prop at first.');
      }
      return;
    }
    const langDesc = this._findLanguage(lang);
    langDesc?.load().then(lang => {
      this._dispatchEffects(this._languageConf.reconfigure([lang]));
    });
  }

  /** Find the language's extension by its name. Case-insensitive. */
  private _findLanguage(name: string) {
    for (const lang of this.languages()) {
      for (const alias of [lang.name, ...lang.alias]) {
        if (name.toLowerCase() === alias.toLowerCase()) {
          return lang;
        }
      }
    }
    console.error('Language not found:', name);
    console.info(
      'Supported language names:',
      this.languages()
        .map(lang => lang.name)
        .join(', ')
    );
    return null;
  }
}
