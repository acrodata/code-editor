import { ChangeDetectorRef, Component, computed, effect, inject, signal } from '@angular/core';
import { languages } from '@codemirror/language-data';
import { disabled, Field, form, readonly, validate, ValidationError } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { CodeEditor, Setup, Theme } from '@acrodata/code-editor';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput } from '@angular/material/input';
import { httpResource } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ErrorStateMatcher } from '@angular/material/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Change } from '@codemirror/merge';

interface LabelValue<T = string> {
  label: string;
  value: T;
}

interface Model {
  code: string;
  language: string;
  theme: Theme;
  setup: Setup;
  disabled: boolean;
  readonly: boolean;
  placeholder: string;
  indentWithTab: boolean;
  indentUnit: string;
  lineWrapping: boolean;
  highlightWhitespace: boolean;
}

// this doesn't seem to work right yet
export class ShowErrorsImmediately implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-code-editor',
  imports: [
    MatSelect,
    Field,
    MatOption,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatCheckbox,
    MatInput,
    MatFormField,
    CodeEditor,
    MatIcon,
    MatTooltip,
    MatError,
  ],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.scss',
})
export class CodeEditorComponent {
  protected readonly availableLanguages = languages;
  matcher = new ShowErrorsImmediately();

  protected readonly languages: LabelValue[] = languages
    .map(lang => ({ label: lang.name, value: lang.name.toLowerCase() }))
    .sort((a, b) => a.label.localeCompare(b.label));

  protected readonly themes: LabelValue<Theme>[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  protected readonly setups: LabelValue<Setup>[] = [
    { label: 'Basic', value: 'basic' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'None', value: null },
  ];

  model = signal<Model>({
    code: '',
    language: this.languages[0].value,
    theme: this.themes[0].value,
    setup: this.setups[0].value,
    disabled: false,
    readonly: false,
    placeholder: 'Type your code here',
    indentWithTab: false,
    indentUnit: '',
    lineWrapping: false,
    highlightWhitespace: false,
  });

  language = computed(() => this.model().language);

  languageSample = httpResource.text(() => `assets/lang_samples/${this.language()}.txt`);

  form = form(this.model, path => {
    readonly(path.code, ({ valueOf }) => valueOf(path.readonly));
    disabled(path.code, ({ valueOf }) => valueOf(path.disabled));
    validate(path.language, () => {
      if (this.languageSample.hasValue()) {
        return null;
      }

      return { kind: 'notfound', message: 'Unable to read file' };
    });
    validate(path.indentUnit, ctx => {
      if (ctx.value().trim().length !== 0) {
        console.log('validation fail');
        return { kind: 'moreThanWhitespace', message: 'Must contain only whitespace' };
      } else return null;
    });
  });

  hasNotFound = (s: ValidationError.WithField) => s.kind === 'notfound';
  moreThanWhitespace = (s: ValidationError.WithField) => s.kind === 'moreThanWhitespace';

  constructor() {
    effect(() => {
      if (this.languageSample.error()) {
        console.log(`has error!`, this.languageSample.error());
      }
      if (this.languageSample.hasValue()) {
        this.model.update(model => ({ ...model, code: this.languageSample.value()! }));
      }
    });
  }
}
