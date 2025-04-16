import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmCardComponent } from './atm-card.component';

describe('AtmCardComponent', () => {
  let component: AtmCardComponent;
  let fixture: ComponentFixture<AtmCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtmCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtmCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
