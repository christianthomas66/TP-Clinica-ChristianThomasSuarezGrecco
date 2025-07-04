import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Paciente } from '../../../clases/paciente';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomCaptchaDirective } from '../../../customCaptchaDirective';
import { CaptchaDirectivaComponent } from '../../captcha-directiva/captcha-directiva.component';
import {TranslatePipe, TranslateDirective, TranslateService, TranslateModule} from "@ngx-translate/core";


@Component({
  selector: 'app-registropaciente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomCaptchaDirective,
    RouterOutlet,
    CaptchaDirectivaComponent,
    TranslateModule
  ],
  templateUrl: './registropaciente.component.html',
  styleUrl: './registropaciente.component.css',
})

export default class RegistropacienteComponent {
  imagenSeleccionadaUno: any = null;
  imagenURL: string = '';
  imagenSeleccionadaDos: any = null;
  imagenURL2: string = '';
  formulario: FormGroup;
  errorCheck: boolean = false;
  Message: string = '';
  user: any;
  estaRegistrado: boolean = false;
  captchaResuelto: boolean = false; // Variable para controlar el captcha
  captchaHabilitado: boolean = true; // Variable para habilitar o deshabilitar el captcha

  constructor(private autenticacion: AuthService, private router: Router, translate: TranslateService) {

    translate.setDefaultLang('es');
    translate.use('en');
  }

  ngOnInit(): void {
    this.formulario = new FormGroup({
      pacienteNombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
      pacienteApellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
      pacienteEdad: new FormControl('', [
        Validators.required,
        Validators.min(5),
        Validators.max(100),
      ]),
      pacienteDni: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000000),
      ]),
      pacienteObraSocial: new FormControl('', [Validators.required]),
      pacienteEmail: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      pacienteClave: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      fotoPaciente: new FormControl(''),
      fotoPaciente2: new FormControl(''),
    });
  }

  onImageSelected(event: any, foto: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (foto == 1) {
          this.imagenSeleccionadaUno = e.target.result;

          this.imagenURL = reader.result as string;
        } else {
          this.imagenSeleccionadaDos = e.target.result;

          this.imagenURL2 = reader.result as string;
        }
      };

      reader.readAsDataURL(file);
    }
  }
  resetImageInput(foto: number) {
    if (foto == 1) {
      const inputElement = document.getElementById(
        'fotoPaciente'
      ) as HTMLInputElement;
      inputElement.value = '';
    } else {
      const inputElement = document.getElementById(
        'fotoPaciente2'
      ) as HTMLInputElement;
      inputElement.value = '';
    }
  }

  onSubmit() {
    if (this.formulario.valid) {
      this.cargarUsuario();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error, complete los datos correctamente',
        timer: 2500,
      });
    }
  }

  async cargarUsuario() {
    try {
      let data = {
        email: this.formulario.controls['pacienteEmail'].value,
        password: this.formulario.controls['pacienteClave'].value,
        nick: this.formulario.controls['pacienteNombre'].value,
      };
      console.log("Componente Registro Paciente");
      console.log(data);
      this.user = await this.autenticacion.registrar(data);

      let usuario = new Paciente(
        this.user.uid,
        this.formulario.controls['pacienteNombre'].value,
        this.formulario.controls['pacienteApellido'].value,
        this.formulario.controls['pacienteEdad'].value,
        this.formulario.controls['pacienteDni'].value,
        this.formulario.controls['pacienteObraSocial'].value,
        this.imagenURL,
        this.imagenURL2
      );
      await this.autenticacion.guardarPacienteBD(usuario);
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: '¡Bienvenido!',
        showConfirmButton: false,
        timer: 1500,
      });
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorCheck = true;
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.Message = 'Ya se encuentra un usuario registrado con ese email';
          break;
        default:
          this.Message = 'Hubo un problema al registrar.';
          break;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: this.Message,
        timer: 4000,
      });
    }
  }

  onCaptchaResolved(resolved: boolean) {
    this.captchaResuelto = resolved;

    if (resolved) {
      Swal.fire({
        icon: 'success',
        title: 'Captcha Correcto',
        text: 'El captcha fue solucionado correctamente',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }

  toggleCaptcha() {
    this.captchaHabilitado = !this.captchaHabilitado;
  }
}
