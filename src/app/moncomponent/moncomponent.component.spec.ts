import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoncomponentComponent } from './moncomponent.component';

describe('MoncomponentComponent', () => {
  let component: MoncomponentComponent;
  let fixture: ComponentFixture<MoncomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoncomponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoncomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
