# Code Editor

[![npm](https://img.shields.io/npm/v/@acrodata/code-editor.svg)](https://www.npmjs.com/package/@acrodata/code-editor)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/acrodata/code-editor/blob/main/LICENSE)

<img src="https://github.com/acrodata/code-editor/assets/20625845/2a511ccf-bf6a-414b-9f0d-4aafe4a8079b" width="400" alt="codemirror+angular">

CodeMirror 6 wrapper for Angular

#### Quick links

[Documentation](https://acrodata.github.io/code-editor/) |
[Playground](https://acrodata.github.io/code-editor/)

## Installation

```bash
npm install @acrodata/code-editor --save
```

## Usage

### Code Editor

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeEditor } from '@acrodata/code-editor';

@Component({
  selector: 'your-app',
  template: `<code-editor [(ngModel)]="code" />`,
  standalone: true,
  imports: [FormsModule, CodeEditor],
})
export class YourAppComponent {
  code = `console.log("Hello world")`;
}
```

### Diff Editor

```ts
import { Component } from '@angular/core';
import { DiffEditor } from '@acrodata/code-editor';

@Component({
  selector: 'your-app',
  template: `<diff-editor [(originalValue)]="originalCode" [(modifiedValue)]="modifiedCode" />`,
  standalone: true,
  imports: [DiffEditor],
})
export class YourAppComponent {
  originalCode = `bar`;
  modifiedCode = `foo`;
}
```

## License

MIT
