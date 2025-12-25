import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiffEditor } from './diff-editor';
import { provideCheckNoChangesConfig, provideZonelessChangeDetection } from '@angular/core';
import { DiffConfig } from '@codemirror/merge';
import { External } from '@acrodata/code-editor';

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

  it('should call setValue', async () => {
    const setValueSpy = vi.spyOn(component as any, 'setValue');

    console.log(1);
    const originalValue = 'console.log("Hello, World!");';
    const compareValue = 'log.console';

    console.log(2);
    fixture.componentRef.setInput('value', { original: originalValue, modified: compareValue });

    console.log(3);
    await fixture.whenStable();

    console.log(4);
    expect(setValueSpy).toHaveBeenCalledTimes(2);
    expect(setValueSpy).toHaveBeenCalledWith('a', originalValue);
    expect(setValueSpy).toHaveBeenCalledWith('b', compareValue);
  });

  it('should not call setValue because it is an internal change', async () => {
    const setValueSpy = vi.spyOn(component as any, 'setValue');

    const editor = 'a';

    const view = component.mergeView?.[editor];

    expect(view).not.toBeNull();

    view?.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: 'abcwefwfg' },
      annotations: External.of(false),
    });

    expect(setValueSpy).toHaveBeenCalledTimes(0);
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
