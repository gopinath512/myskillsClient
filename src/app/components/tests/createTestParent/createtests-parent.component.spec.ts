import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatetestsParentComponent } from './createtests-parent.component';

describe('CreatetestsParentComponent', () => {
  let component: CreatetestsParentComponent;
  let fixture: ComponentFixture<CreatetestsParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatetestsParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatetestsParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
