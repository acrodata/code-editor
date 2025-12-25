import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatTabNav, MatTabNavPanel, MatTabLink, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly links = [
    { link: 'home', label: 'Original' },
    { link: 'code-editor', label: 'Code Editor' },
    { link: 'split-diff', label: 'Split Diff' },
    { link: 'unified-diff', label: 'Unified Diff' },
  ];

  readonly activeLink = signal(this.links[0].link);
}
