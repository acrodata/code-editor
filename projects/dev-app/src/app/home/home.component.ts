import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MtxSplitModule } from '@ng-matero/extensions/split';

import { CodeEditor } from '@acrodata/code-editor';
import { GuiFields, GuiForm } from '@acrodata/gui';
import { languages } from '@codemirror/language-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MtxSplitModule,
    CodeEditor,
    GuiForm,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  languages = languages;

  config: GuiFields = {
    language: {
      type: 'select',
      name: 'Language',
      options: languages.map(lang => ({ label: lang.name, value: lang.name.toLowerCase() })),
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
    height: {
      type: 'inline',
      name: 'Height',
      children: {
        value: {
          type: 'number',
          name: '',
          col: 70,
        },
        unit: {
          type: 'select',
          name: '',
          options: [
            { label: 'px', value: 'px' },
            { label: '%', value: '%' },
          ],
          col: 30,
        },
      },
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
    height: { value: 200, unit: 'px' },
  };

  code = 'console.log("Hello world")';

  log(e: any) {
    console.log(e);
  }

  ngOnInit(): void {}
}
