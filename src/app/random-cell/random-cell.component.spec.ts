import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomCellComponent } from './random-cell.component';

describe('RandomCellComponent', () => {
  let component: RandomCellComponent;
  let fixture: ComponentFixture<RandomCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RandomCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
