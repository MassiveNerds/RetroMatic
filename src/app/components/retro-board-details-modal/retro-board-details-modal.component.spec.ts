import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetroBoardDetailsModalComponent } from './retro-board-details-modal.component';

describe('RetroBoardDetailsModalComponent', () => {
  let component: RetroBoardDetailsModalComponent;
  let fixture: ComponentFixture<RetroBoardDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetroBoardDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetroBoardDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
