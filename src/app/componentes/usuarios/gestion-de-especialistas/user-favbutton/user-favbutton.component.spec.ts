import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFavbuttonComponent } from './user-favbutton.component';

describe('UserFavbuttonComponent', () => {
  let component: UserFavbuttonComponent;
  let fixture: ComponentFixture<UserFavbuttonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFavbuttonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserFavbuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
