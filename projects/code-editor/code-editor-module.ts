import { NgModule } from '@angular/core';
import { CodeEditor } from './code-editor';
import { DiffEditor } from './diff-editor';

@NgModule({
  imports: [CodeEditor, DiffEditor],
  exports: [CodeEditor, DiffEditor],
})
export class CodeEditorModule {}
