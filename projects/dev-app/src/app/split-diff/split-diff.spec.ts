import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitDiff } from './split-diff';

describe('SplitDiff', () => {
  let component: SplitDiff;
  let fixture: ComponentFixture<SplitDiff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitDiff],
    }).compileComponents();

    fixture = TestBed.createComponent(SplitDiff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
