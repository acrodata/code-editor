# Code Editor

[![npm](https://img.shields.io/npm/v/@acrodata/code-editor.svg)](https://www.npmjs.com/package/@acrodata/code-editor)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/acrodata/code-editor/blob/main/LICENSE)

<img src="https://github.com/acrodata/code-editor/assets/20625845/2a511ccf-bf6a-414b-9f0d-4aafe4a8079b" width="400" alt="codemirror+angular">

CodeMirror 6 wrapper for Angular

#### Quick links

[Documentation](https://github.com/acrodata/code-editor?tab=readme-ov-file#code-editor) |
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
  template: `<code-editor [(ngModel)]="value" />`,
  standalone: true,
  imports: [FormsModule, CodeEditor],
})
export class YourAppComponent {
  value = `console.log("Hello world")`;
}
```

### Diff Editor

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiffEditor } from '@acrodata/code-editor';

@Component({
  selector: 'your-app',
  template: `<diff-editor [(ngModel)]="value" />`,
  standalone: true,
  imports: [FormsModule, DiffEditor],
})
export class YourAppComponent {
  value = {
    original: `bar`;
    modified: `foo`;
  }
}
```

## API

### Code Editor

| Name                  | Type                   | Default     | Description                                                                                                        |
| --------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| [value]               | string                 | `''`        | The editor's value.                                                                                                |
| [root]                | Document \| ShadowRoot | `undefined` | EditorView's [root][_root].                                                                                        |
| [autoFocus]           | boolean                | `false`     | Whether focus on the editor after init.                                                                            |
| [disabled]            | boolean                | `false`     | Whether the editor is disabled.                                                                                    |
| [readonly]            | boolean                | `false`     | Whether the editor is readonly.                                                                                    |
| [theme]               | Theme                  | `light`     | The editor's theme.                                                                                                |
| [placeholder]         | string                 | `''`        | The editor's placecholder.                                                                                         |
| [indentWithTab]       | boolean                | `false`     | Whether indent with Tab key.                                                                                       |
| [indentUnit]          | string                 | `''`        | Should be a string consisting either entirely of the same whitespace character.                                    |
| [lineWrapping]        | boolean                | `false`     | Whether the editor wraps lines.                                                                                    |
| [highlightWhitespace] | boolean                | `false`     | Whether highlight the whitespace.                                                                                  |
| [languages]           | LanguageDescription[]  | `[]`        | An array of language descriptions for known [language-data][_language-data].                                       |
| [language]            | string                 | `''`        | The editor's language. You should set the `languages` prop at first.                                               |
| [setup]               | Setup                  | `'basic'`   | The editor's built-in setup. The value can be set to [`basic`][_basicSetup], [`minimal`][_minimalSetup] or `null`. |
| [extensions]          | Extension[]            | `[]`        | It will be appended to the root [extensions][_extensions].                                                         |
| (change)              | EventEmitter<string>   | `-`         | Event emitted when the editor's value changes.                                                                     |
| (focus)               | EventEmitter<void>     | `-`         | Event emitted when focus on the editor.                                                                            |
| (blur)                | EventEmitter<void>     | `-`         | Event emitted when the editor has lost focus.                                                                      |

### Diff Editor

| Name                  | Type                                  | Default     | Description                                                                                                        |
| --------------------- | ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| [setup]               | Setup                                 | `'basic'`   | The editor's built-in setup. The value can be set to [`basic`][_basicSetup], [`minimal`][_minimalSetup] or `null`. |
| [originalValue]       | string                                | `''`        | The diff-editor's original value.                                                                                  |
| [originalExtensions]  | Extension[]                           | `[]`        | The MergeView original config's [extensions][_extensions].                                                         |
| [modifiedValue]       | string                                | `''`        | The diff-editor's modified value.                                                                                  |
| [modifiedExtensions]  | Extension[]                           | `[]`        | The MergeView modified config's [extensions][_extensions].                                                         |
| [orientation]         | Orientation                           | `undefined` | Controls whether editor A or editor B is shown first. Defaults to `"a-b"`.                                         |
| [revertControls]      | RevertControls                        | `undefined` | Controls whether revert controls are shown between changed chunks.                                                 |
| [renderRevertControl] | RenderRevertControl                   | `undefined` | When given, this function is called to render the button to revert a chunk.                                        |
| [highlightChanges]    | boolean                               | `true`      | By default, the merge view will mark inserted and deleted text in changed chunks.                                  |
| [gutter]              | boolean                               | `true`      | Controls whether a gutter marker is shown next to changed lines.                                                   |
| [disabled]            | boolean                               | `false`     | Whether the diff-editor is disabled.                                                                               |
| [collapseUnchanged]   | { margin?: number; minSize?: number } | `undefined` | When given, long stretches of unchanged text are collapsed.                                                        |
| [diffConfig]          | DiffConfig                            | `undefined` | Pass options to the diff algorithm.                                                                                |
| (originalValueChange) | EventEmitter<string>                  | `-`         | Event emitted when the editor's original value changes.                                                            |
| (originalFocus)       | EventEmitter<void>                    | `-`         | Event emitted when focus on the original editor.                                                                   |
| (originalBlur)        | EventEmitter<void>                    | `-`         | Event emitted when blur on the original editor.                                                                    |
| (modifiedValueChange) | EventEmitter<string>                  | `-`         | Event emitted when the editor's modified value changes.                                                            |
| (modifiedFocus)       | EventEmitter<void>                    | `-`         | Event emitted when focus on the modified editor.                                                                   |
| (modifiedBlur)        | EventEmitter<void>                    | `-`         | Event emitted when blur on the modified editor.                                                                    |

## License

MIT

[_root]: https://codemirror.net/docs/ref/#view.EditorView.root
[_language-data]: https://github.com/codemirror/language-data/blob/main/src/language-data.ts
[_basicSetup]: https://codemirror.net/docs/ref/#codemirror.basicSetup
[_minimalSetup]: https://codemirror.net/docs/ref/#codemirror.minimalSetup
[_extensions]: https://codemirror.net/docs/ref/#state.EditorStateConfig.extensions
