import { CodeEditor, DiffEditor, Orientation, RevertControls, Setup } from '@acrodata/code-editor';
import { Component } from '@angular/core';
import { unifiedMergeView } from '@codemirror/merge';

@Component({
  selector: 'app-diff',
  standalone: true,
  imports: [DiffEditor, CodeEditor],
  templateUrl: './diff.component.html',
  styleUrl: './diff.component.scss',
})
export class DiffComponent {
  doc = `one
two
three
four
five`;

  doc2 = this.doc.replace(/t/g, 'T') + '\nSix';

  unifiedExts = [
    unifiedMergeView({
      original: this.doc,
      gutter: true,
    }),
  ];

  setup: Setup = 'minimal';
  orientation: Orientation = 'a-b';
  revertControls: RevertControls = 'a-to-b';
  highlightChanges = true;
  gutter = true;

  log(e: any) {
    console.log(e);
  }
}
