import { CodeEditor, Theme } from '@acrodata/code-editor';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CodeEditor, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  theme: Theme = 'light';
  disabled = false;
  readonly = false;
  placeholder = 'Type your code here...';

  code = 'console.log("Hello world")';

  editorControl = new FormControl({ value: 'hello', disabled: true });

  log(e: any) {
    console.log(e);
  }
}
