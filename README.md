# Code Editor

[![npm](https://img.shields.io/npm/v/@acrodata/code-editor.svg)](https://www.npmjs.com/package/@acrodata/code-editor)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/acrodata/code-editor/blob/main/LICENSE)

CodeMirror6 wrapper for Angular

## Installation

```bash
npm install @acrodata/code-editor --save
```

## Usage

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeEditor } from '@acrodata/code-editor';

@Component({
  selector: 'your-app',
  template: `<code-editor [(ngModel)]="value" />`,
  standalone: true,
  imports: [FormsModule, CodeEditor],
})
export class YourAppComponent {
  value = 'console.log("Hello world")';
}
```

## License

MIT
