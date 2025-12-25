import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnifiedDiffComponent } from './unified-diff';

describe('UnifiedDiff', () => {
  let component: UnifiedDiffComponent;
  let fixture: ComponentFixture<UnifiedDiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnifiedDiffComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UnifiedDiffComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
