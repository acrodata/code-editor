import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiffEditor, Orientation, RevertControls } from './diff-editor';
import {
  Component,
  input,
  provideCheckNoChangesConfig,
  provideZonelessChangeDetection,
  viewChild,
} from '@angular/core';
import { Setup } from '@acrodata/code-editor';
import { DiffConfig } from '@codemirror/merge';

describe('DiffEditor', () => {
  let component: DiffEditor;
  let fixture: ComponentFixture<DiffEditor>;

  beforeEach(
    async () =>
      await TestBed.configureTestingModule({
        imports: [DiffEditor],
        providers: [
          provideZonelessChangeDetection(),
          provideCheckNoChangesConfig({ exhaustive: true, interval: 50 }),
        ],
      }).compileComponents()
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(DiffEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update originalValue', async () => {
    const setOriginalValueSpy = vi.spyOn(component, 'setValue');

    const testValue = 'console.log("Hello, World!");';
    fixture.componentRef.setInput('originalValue', testValue);

    await fixture.whenStable();

    expect(setOriginalValueSpy).toHaveBeenCalledWith('a', testValue);
  });

  it('should update modifiedValue', async () => {
    const setModifiedValueSpy = vi.spyOn(component, 'setValue');

    const testValue = 'console.log("Hello, World!");';
    fixture.componentRef.setInput('modifiedValue', testValue);

    await fixture.whenStable();

    expect(setModifiedValueSpy).toHaveBeenCalledWith('b', testValue);
  });

  it('should update orientation', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = 'a-b';
    fixture.componentRef.setInput('orientation', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ orientation: testValue });
  });

  it('should update revertControls', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = 'a-to-b';
    fixture.componentRef.setInput('revertControls', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ revertControls: testValue });
  });

  it('should update renderRevertControl', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = () => document.body;
    fixture.componentRef.setInput('renderRevertControl', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ renderRevertControl: testValue });
  });

  it('should update highlightChanges', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = false;
    fixture.componentRef.setInput('highlightChanges', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ highlightChanges: testValue });
  });

  it('should update gutter', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = false;
    fixture.componentRef.setInput('gutter', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ gutter: testValue });
  });

  it('should update collapseUnchanged', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = {};
    fixture.componentRef.setInput('collapseUnchanged', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ collapseUnchanged: testValue });
  });

  it('should update diffConfig', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue: DiffConfig = {
      scanLimit: 4,
      timeout: 2,
    };
    fixture.componentRef.setInput('diffConfig', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ diffConfig: testValue });
  });

  it('should update disabled', async () => {
    const setValueSpy = vi.spyOn(component, 'setEditable');

    const testValue = true;
    fixture.componentRef.setInput('disabled', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith('a', false);
    expect(setValueSpy).toHaveBeenCalledWith('b', false);
  });
});

@Component({
  template: `
    <diff-editor
      [setup]="setup"
      [originalValue]="originalValue()"
      [modifiedValue]="modifiedValue()"
      [orientation]="orientation"
      [highlightChanges]="highlightChanges"
      [gutter]="gutter"
      [disabled]="disabled"
      (originalValueChange)="originalValueChange()"
      (modifiedValueChange)="modifiedValueChange()"
    />
  `,
  imports: [DiffEditor],
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

  originalValue = input<string>('abc');
  modifiedValue = input<string>('def');

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
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should output originalValueChange', async () => {
    const testValue = 'console.log("Hello, World!");';
    const changeSpy = vi.spyOn(component, 'originalValueChange');

    component.editor().mergeView!.a.dispatch({
      changes: { from: 0, insert: testValue },
    });

    await fixture.whenStable();

    expect(changeSpy).toHaveBeenCalled();
  });

  it('should output modifiedValueChange', async () => {
    const testValue = 'console.log("Hello, World!");';
    const changeSpy = vi.spyOn(component, 'modifiedValueChange');

    component.editor().mergeView!.b.dispatch({
      changes: { from: 0, insert: testValue },
    });

    await fixture.whenStable();

    expect(changeSpy).toHaveBeenCalled();
  });
});
