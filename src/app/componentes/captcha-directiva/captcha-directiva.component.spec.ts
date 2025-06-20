import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptchaDirectivaComponent } from './captcha-directiva.component';

describe('CaptchaDirectivaComponent', () => {
  let component: CaptchaDirectivaComponent;
  let fixture: ComponentFixture<CaptchaDirectivaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptchaDirectivaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaptchaDirectivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
