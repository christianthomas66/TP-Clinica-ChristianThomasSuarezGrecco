import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadosFavButtonComponent } from './estados-fav-button.component';

describe('EstadosFavButtonComponent', () => {
  let component: EstadosFavButtonComponent;
  let fixture: ComponentFixture<EstadosFavButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadosFavButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadosFavButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
