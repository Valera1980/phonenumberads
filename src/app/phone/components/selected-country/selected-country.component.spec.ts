import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCountryComponent } from './selected-country.component';

describe('SelectedCountryComponent', () => {
  let component: SelectedCountryComponent;
  let fixture: ComponentFixture<SelectedCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedCountryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
