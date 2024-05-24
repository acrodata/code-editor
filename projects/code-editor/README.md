# Code Editor

CodeMirror 6 wrapper for Angular

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
  value = '';
}
```

## License

MIT
