import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { LanguageService } from '../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-especialista-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './especialista-navbar.component.html',
  styleUrl: './especialista-navbar.component.css'
})
export class EspecialistaNavbarComponent implements OnInit {
  loggedUser = this.authService.obtenerUsuarioConectado();

  constructor(private authService: AuthService, private router: Router, private _languageService: LanguageService, private translate: TranslateService) {}

  onChangeLanguage(language: string) {
    this._languageService.changeLanguage(language);
  }

  ngOnInit(): void {}

  logOut() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.cerrarSesion();
        localStorage.removeItem('logueado');
        this.router.navigate(['/login']);
      }
    });
  }
}
