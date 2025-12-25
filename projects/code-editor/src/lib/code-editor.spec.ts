import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodeEditor } from './code-editor';
import { EditorView } from '@codemirror/view';
import { indentMore } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { provideCheckNoChangesConfig, provideZonelessChangeDetection } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

describe('CodeEditor', () => {
  let component: CodeEditor;
  let fixture: ComponentFixture<CodeEditor>;

  beforeEach(
    async () =>
      await TestBed.configureTestingModule({
        imports: [CodeEditor],
        providers: [
          provideZonelessChangeDetection(),
          provideCheckNoChangesConfig({ exhaustive: true, interval: 50 }),
        ],
      }).compileComponents()
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(CodeEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the value', async () => {
    const setValueSpy = vi.spyOn(component, 'setValue');

    const testValue = 'console.log("Hello, World!");';
    fixture.componentRef.setInput('value', testValue);

    await fixture.whenStable();

    expect(setValueSpy).toHaveBeenCalledWith(testValue);
  });

  it('should disable the editor', async () => {
    const setDisabledSpy = vi.spyOn(component, 'setEditable');

    fixture.componentRef.setInput('disabled', true);

    await fixture.whenStable();

    expect(setDisabledSpy).toHaveBeenCalledWith(false);
  });

  it('should set the editor to readonly', async () => {
    const setReadonlySpy = vi.spyOn(component, 'setReadonly');

    fixture.componentRef.setInput('readonly', true);

    await fixture.whenStable();

    expect(setReadonlySpy).toHaveBeenCalledWith(true);
  });

  it('should set the theme', async () => {
    const setThemeSpy = vi.spyOn(component, 'setTheme');

    fixture.componentRef.setInput('theme', 'dark');

    await fixture.whenStable();

    expect(setThemeSpy).toHaveBeenCalledWith('dark');
  });

  it('should set the placeholder', async () => {
    const setPlaceHolderSpy = vi.spyOn(component, 'setPlaceholder');

    const placeholderText = 'Enter your code here';
    fixture.componentRef.setInput('placeholder', placeholderText);

    await fixture.whenStable();

    expect(setPlaceHolderSpy).toHaveBeenCalledWith(placeholderText);
  });

  it('should use the specified indentUnit for indentation', async () => {
    const indent = '    '; // 4 spaces
    fixture.componentRef.setInput('indentUnit', indent);

    await fixture.whenStable();

    // Set content and cursor position
    component.view.dispatch({
      changes: { from: 0, insert: 'line' },
      selection: { anchor: 0 },
    });

    // Execute an indentation command
    const commandResult = indentMore(component.view);

    await fixture.whenStable();

    // Assert that the command was successful and the correct indent unit was used
    expect(commandResult).toBe(true);
    expect(component.view.state.doc.toString()).toBe(indent + 'line');
  });

  it('should set indentWithTab', async () => {
    const setIndentWithTabSpy = vi.spyOn(component, 'setIndentWithTab');

    fixture.componentRef.setInput('indentWithTab', true);

    await fixture.whenStable();

    expect(setIndentWithTabSpy).toHaveBeenCalledWith(true);
  });

  it('should set language', async () => {
    const setLanguageSpy = vi.spyOn(component, 'setLanguage');

    fixture.componentRef.setInput('language', 'whatever');

    await fixture.whenStable();

    expect(setLanguageSpy).toHaveBeenCalledWith('whatever');
  });

  it('should set extensions', async () => {
    const setExtensionsSpy = vi.spyOn(component, 'setExtensions');
    // private, but captures behaviour
    const getAllExtensionsSpy = vi.spyOn(component as any, '_getAllExtensions');

    const empty: Extension[] = [];

    fixture.componentRef.setInput('extensions', empty);

    await fixture.whenStable();

    expect(setExtensionsSpy).toHaveBeenCalled();
    expect(getAllExtensionsSpy).toHaveBeenCalled();
  });

  it('should set extensions with setup', async () => {
    const setExtensionsSpy = vi.spyOn(component, 'setExtensions');
    // private, but captures behaviour
    const getAllExtensionsSpy = vi.spyOn(component as any, '_getAllExtensions');

    fixture.componentRef.setInput('setup', 'minimal');

    await fixture.whenStable();

    expect(setExtensionsSpy).toHaveBeenCalled();
    expect(getAllExtensionsSpy).toHaveBeenCalled();
  });

  it('should set lineWrapping', async () => {
    const setLineWrappingSpy = vi.spyOn(component, 'setLineWrapping');

    fixture.componentRef.setInput('lineWrapping', true);

    await fixture.whenStable();

    expect(setLineWrappingSpy).toHaveBeenCalledWith(true);
  });

  it('should set highlightWhitespace', async () => {
    const setHighlightWhitespaceSpy = vi.spyOn(component, 'setHighlightWhitespace');

    fixture.componentRef.setInput('highlightWhitespace', true);

    await fixture.whenStable();

    expect(setHighlightWhitespaceSpy).toHaveBeenCalledWith(true);
  });

  it('should emit change event', () => {
    vi.spyOn(component.change, 'emit');
    const newValue = 'new value';
    component.view.dispatch({
      changes: { from: 0, to: component.view.state.doc.length, insert: newValue },
    });
    expect(component.change.emit).toHaveBeenCalledWith(newValue);
  });

  it('should emit focus and blur events', () => {
    vi.spyOn(component.focus, 'emit');
    vi.spyOn(component.blur, 'emit');

    component.view.contentDOM.dispatchEvent(new FocusEvent('focus'));
    component.view.contentDOM.dispatchEvent(new FocusEvent('blur'));

    expect(component.focus.emit).toHaveBeenCalled();
    expect(component.blur.emit).toHaveBeenCalled();
  });

  it('should write value using FormValueControl', async () => {
    const testValue = 'accessor test';
    fixture.componentRef.setInput('value', testValue);

    await fixture.whenStable();

    expect(component.view.state.doc.toString()).toBe(testValue);
  });

  it('should set disabled state using FormValueControl', async () => {
    const setEditableSpy = vi.spyOn(component, 'setEditable');
    fixture.componentRef.setInput('disabled', true);

    await fixture.whenStable();

    expect(component.view.state.facet(EditorView.editable)).toBe(false);
    expect(setEditableSpy).toHaveBeenCalledWith(false);
  });
});
