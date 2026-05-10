import { CodeEditor, DiffEditor, Orientation, RevertControls, Setup } from '@acrodata/code-editor';
import { Component, linkedSignal, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { unifiedMergeView } from '@codemirror/merge';

@Component({
  selector: 'app-diff',
  imports: [DiffEditor, CodeEditor, FormsModule, ReactiveFormsModule],
  templateUrl: './diff.html',
  styleUrl: './diff.scss',
})
export class Diff {
  doc = signal(`one
two
three
four
five`);

  doc2 = signal(this.doc().replace(/t/g, 'T') + '\nSix');

  value = linkedSignal(() => ({
    original: this.doc(),
    modified: this.doc2(),
  }));

  control = new FormControl({ value: this.value, disabled: true });

  unifiedExts = [
    unifiedMergeView({
      original: this.doc(),
      gutter: true,
    }),
  ];

  setup: Setup = 'minimal';
  orientation = signal<Orientation>('a-b');
  revertControls = signal<RevertControls>('a-to-b');
  highlightChanges = signal(true);
  gutter = signal(true);
  disabled = signal(false);

  log(e: any) {
    console.log(e);
  }

  setOriginalValue() {
    this.doc.set('123');
  }

  setModifiedValue() {
    this.doc2.set('13\n456');
  }

  setOrientation() {
    if (this.orientation() === 'a-b') {
      this.orientation.set('b-a');
    } else {
      this.orientation.set('a-b');
    }
  }

  setRevertControls() {
    if (this.revertControls() === 'a-to-b') {
      this.revertControls.set('b-to-a');
    } else {
      this.revertControls.set('a-to-b');
    }
  }

  setHighlightChanges() {
    this.highlightChanges.update(v => !v);
  }

  setGutter() {
    this.gutter.update(v => !v);
  }

  setDisabled() {
    this.disabled.update(v => !v);
  }
}
