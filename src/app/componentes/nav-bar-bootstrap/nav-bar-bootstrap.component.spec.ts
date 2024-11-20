import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarBootstrapComponent } from './nav-bar-bootstrap.component';

describe('NavBarBootstrapComponent', () => {
  let component: NavBarBootstrapComponent;
  let fixture: ComponentFixture<NavBarBootstrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarBootstrapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavBarBootstrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
