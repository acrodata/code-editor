import { CodeEditor, DiffEditor, Orientation, RevertControls, Setup } from '@acrodata/code-editor';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { unifiedMergeView } from '@codemirror/merge';

@Component({
  selector: 'app-diff',
  standalone: true,
  imports: [DiffEditor, CodeEditor, FormsModule, ReactiveFormsModule],
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

  value = {
    original: this.doc,
    modified: this.doc2,
  };

  control = new FormControl({ value: this.value, disabled: true });

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
  disabled = false;

  log(e: any) {
    console.log(e);
  }
}
