import { CodeEditor, Setup, Theme } from '@acrodata/code-editor';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { Extension } from '@codemirror/state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CodeEditor, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  theme: Theme = 'light';
  setup: Setup = 'basic';
  disabled = false;
  readonly = false;
  placeholder = 'Type your code here...';
  indentWithTab = false;
  indentUnit = '';
  lineWrapping = false;
  highlightWhitespace = false;
  language = 'js';
  languages = [];

  extensions: Extension[] = [];

  code = 'console.log("Hello world")';

  editorControl = new FormControl({ value: 'hello', disabled: true });

  setLanguage() {
    if (this.language === 'html') {
      this.extensions = [html()];
    } else if (this.language === 'css') {
      this.extensions = [css()];
    } else if (this.language === 'js') {
      this.extensions = [javascript()];
    }
  }

  log(e: any) {
    console.log(e);
  }
}
