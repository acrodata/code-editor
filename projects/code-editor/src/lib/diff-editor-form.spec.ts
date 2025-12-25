import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Component,
  effect,
  provideCheckNoChangesConfig,
  provideZonelessChangeDetection,
  signal,
  viewChild,
  input,
} from '@angular/core';
import {
  DiffEditor,
  DiffEditorModel,
  External,
  Orientation,
  RevertControls,
  Setup,
} from '@acrodata/code-editor';
import { Field, form } from '@angular/forms/signals';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  template: `
    <diff-editor
      [setup]="setup"
      [field]="form"
      [orientation]="orientation"
      [highlightChanges]="highlightChanges"
      [gutter]="gutter"
    />
  `,
  imports: [DiffEditor, Field],
  standalone: true,
})
class TestHostComponent {
  editor = viewChild.required(DiffEditor);

  setup: Setup = 'minimal';
  orientation: Orientation = 'a-b';
  revertControls: RevertControls = 'a-to-b';
  highlightChanges = input(true);
  gutter = true;
  disabled = false;

  readonly input = signal<DiffEditorModel>({
    original: 'abc',
    modified: 'def',
  });

  readonly form = form(this.input);

  originalValue = input<string>('abc');
  modifiedValue = input<string>('def');

  constructor() {
    effect(() => {
      const value = this.input();

      if (value.original !== 'abc') {
        this.originalValueChange();
      }
    });

    effect(() => {
      const value = this.input();

      if (value.modified !== 'def') {
        this.modifiedValueChange();
      }
    });
  }

  originalValueChange() {}
  modifiedValueChange() {}
}

describe('Diff Editor Advanced', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideCheckNoChangesConfig({ exhaustive: true, interval: 50 }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.autoDetectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should output originalValueChange', async () => {
    const testValue = 'console.log("Hello, World!");';
    const changeSpy = vi.spyOn(component, 'originalValueChange');

    component.editor().mergeView!.a.dispatch({
      changes: { from: 0, insert: testValue },
      annotations: External.of(false),
    });

    TestBed.tick();

    await fixture.whenStable();

    expect(changeSpy).toHaveBeenCalled();
  });

  it('should output modifiedValueChange', async () => {
    const testValue = 'console.log("Hello, World!");';
    const changeSpy = vi.spyOn(component, 'modifiedValueChange');

    component.editor().mergeView!.b.dispatch({
      changes: { from: 0, insert: testValue },
    });

    TestBed.tick();

    await fixture.whenStable();

    expect(changeSpy).toHaveBeenCalled();
  });
});
