import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaBienvenidaComponent } from './pagina-bienvenida.component';

describe('PaginaBienvenidaComponent', () => {
  let component: PaginaBienvenidaComponent;
  let fixture: ComponentFixture<PaginaBienvenidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaBienvenidaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaginaBienvenidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
