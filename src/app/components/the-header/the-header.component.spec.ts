import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TheHeaderComponent } from './the-header.component';

describe('TheHeaderComponent', () => {
  let component: TheHeaderComponent;
  let fixture: ComponentFixture<TheHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TheHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TheHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
