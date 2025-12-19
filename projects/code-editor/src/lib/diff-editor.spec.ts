import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiffEditor } from './diff-editor';

describe('DiffEditor', () => {
  let component: DiffEditor;
  let fixture: ComponentFixture<DiffEditor>;

  beforeEach(
    async () =>
      await TestBed.configureTestingModule({
        imports: [DiffEditor],
      }).compileComponents()
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update originalValue', async () => {
    const setOriginalValueSpy = vi.spyOn(component, 'setValue');

    const testValue = 'console.log("Hello, World!");';
    fixture.componentRef.setInput('originalValue', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setOriginalValueSpy).toHaveBeenCalledWith('a', testValue);
  });

  it('should update modifiedValue', async () => {
    const setModifiedValueSpy = vi.spyOn(component, 'setValue');

    const testValue = 'console.log("Hello, World!");';
    fixture.componentRef.setInput('modifiedValue', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setModifiedValueSpy).toHaveBeenCalledWith('b', testValue);
  });

  it('should update orientation', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = 'a-b';
    fixture.componentRef.setInput('orientation', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ orientation: testValue });
  });

  it('should update revertControls', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = 'a-to-b';
    fixture.componentRef.setInput('revertControls', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ revertControls: testValue });
  });

  it('should update renderRevertControl', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = () => document.body;
    fixture.componentRef.setInput('renderRevertControl', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ renderRevertControl: testValue });
  });

  it('should update highlightChanges', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = false;
    fixture.componentRef.setInput('highlightChanges', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ highlightChanges: testValue });
  });

  it('should update gutter', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = false;
    fixture.componentRef.setInput('gutter', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ gutter: testValue });
  });

  it('should update collapseUnchanged', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = {};
    fixture.componentRef.setInput('collapseUnchanged', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ collapseUnchanged: testValue });
  });

  it('should update diffConfig', async () => {
    const setValueSpy = vi.spyOn(component.mergeView!, 'reconfigure');

    const testValue = undefined;
    fixture.componentRef.setInput('diffConfig', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith({ diffConfig: testValue });
  });

  it('should update disabled', async () => {
    const setValueSpy = vi.spyOn(component, 'setEditable');

    const testValue = false;
    fixture.componentRef.setInput('disabled', testValue);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith('a', true);
    expect(setValueSpy).toHaveBeenCalledWith('b', true);
  });
});
