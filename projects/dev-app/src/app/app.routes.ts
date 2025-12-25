import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { DiffComponent } from './diff/diff.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'code-editor' },
  { path: 'home', component: HomeComponent },
  // { path: 'diff', component: DiffComponent },
  {
    path: 'code-editor',
    loadComponent: () => import('./code-editor').then(m => m.CodeEditorComponent),
  },
  {
    path: 'split-diff',
    loadComponent: () => import('./split-diff').then(m => m.SplitDiffComponent),
  },
  {
    path: 'unified-diff',
    loadComponent: () => import('./unified-diff').then(m => m.UnifiedDiffComponent),
  },
];
