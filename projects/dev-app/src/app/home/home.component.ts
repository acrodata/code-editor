import { AfterViewInit, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { CodeEditor, DiffEditor } from '@acrodata/code-editor';
import { GuiFields, GuiForm } from '@acrodata/gui';
import { languages } from '@codemirror/language-data';
import { unifiedMergeView } from '@codemirror/merge';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CodeEditor, DiffEditor, GuiForm, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  languages = languages;

  form = new FormGroup({});

  config: GuiFields = {
    language: {
      type: 'combobox',
      name: 'Language',
      options: languages
        .map(lang => ({ label: lang.name, value: lang.name.toLowerCase() }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
    theme: {
      type: 'buttonToggle',
      name: 'Theme',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    setup: {
      type: 'buttonToggle',
      name: 'Setup',
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'None', value: '' },
      ],
    },
    disabled: {
      type: 'switch',
      name: 'Disabled',
    },
    readonly: {
      type: 'switch',
      name: 'Readonly',
    },
    placeholder: {
      type: 'text',
      name: 'Placeholder',
    },
    indentWithTab: {
      type: 'switch',
      name: 'Indent with tab',
    },
    indentUnit: {
      type: 'text',
      name: 'Indent unit',
    },
    lineWrapping: {
      type: 'switch',
      name: 'Line wrapping',
    },
    highlightWhitespace: {
      type: 'switch',
      name: 'Highlight whitespace',
    },
  };

  options: any = {
    language: 'javascript',
    theme: 'light',
    setup: 'basic',
    disabled: false,
    readonly: false,
    placeholder: 'Type your code here...',
    indentWithTab: false,
    indentUnit: '',
    lineWrapping: false,
    highlightWhitespace: false,
  };

  code = '';

  showOutput = false;

  ngOnInit(): void {
    this.getLangSample('javascript');
  }

  ngAfterViewInit(): void {
    this.form
      .get('language')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang: string) => {
        console.log(lang);
        this.getLangSample(lang.replace(' ', '_').replace('#', 'sharp'));
      });
  }

  getLangSample(lang: string) {
    fetch(`assets/lang_samples/${lang}.txt`).then(async response => {
      if (response.ok) {
        this.code = await response.text();
      } else {
        this.code = '';
      }
    });
  }

  log(e: any) {
    console.log(e);
  }

  originalCode = `one
two
three
four
five`;
  modifiedCode = this.originalCode.replace(/t/g, 'T') + '\nSix';

  unifiedExts = [
    unifiedMergeView({
      original: this.originalCode,
    }),
  ];

  config2: GuiFields = {
    orientation: {
      type: 'buttonToggle',
      name: 'Orientation',
      options: [
        { label: 'a-b', value: 'a-b' },
        { label: 'b-a', value: 'b-a' },
      ],
    },
    revertControls: {
      type: 'buttonToggle',
      name: 'Revert controls',
      options: [
        { label: 'a-to-b', value: 'a-to-b' },
        { label: 'b-to-a', value: 'b-to-a' },
        { label: 'none', value: '' },
      ],
    },
    highlightChanges: {
      type: 'switch',
      name: 'Highlight changes',
    },
    gutter: {
      type: 'switch',
      name: 'Gutter',
    },
  };

  options2: any = {
    orientation: 'a-b',
    revertControls: '',
    highlightChanges: true,
    gutter: true,
  };
}
