import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { Especialidad } from '../../../clases/especialidad';
import { Especialista } from '../../../clases/especialista';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { CustomCaptchaDirective } from '../../../customCaptchaDirective';
import { CaptchaDirectivaComponent } from '../../captcha-directiva/captcha-directiva.component';

@Component({
  selector: 'app-registroespecialista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomCaptchaDirective, CaptchaDirectivaComponent],
  templateUrl: './registroespecialista.component.html',
  styleUrl: './registroespecialista.component.css',
})
export default class RegistroespecialistaComponent {
  imagenSeleccionada: any = null;
  imagenURL: string = '';
  formulario: FormGroup;
  existenciaErrores: boolean = false;
  mensaje: string = '';
  usuario: any;
  especialidadesSeleccionadas: Especialidad[] = [];
  nuevaEspecialidad: string = '';
  especialidades: Especialidad[] = [];
  captchaResuelto: boolean = false; // Variable para controlar el captcha
  captchaHabilitado: boolean = true; // Variable para habilitar o deshabilitar el captcha

  especialidadesClinica: string[] = [
   "Especialidades Médicas",
   "Clínica Médica",
   "Pediatría",
   "Ginecología y Obstetricia",
   "Cardiología",
   "Neurología",
   "Dermatología",
   "Traumatología y Ortopedia",
   "Gastroenterología",
   "Nefrología",
   "Endocrinología",
   "Reumatología",
   "Hematología",
   "Neumonología",
   "Alergología e Inmunología Clínica",
   "Infectología",
   "Oncología",
   "Oftalmología",
   "Otorrinolaringología",
   "Psiquiatría",
   "Urología",
 
   // Especialidades Quirúrgicas
   "Cirugía General",
   "Cirugía Plástica y Reparadora",
   "Cirugía Cardiovascular",
   "Neurocirugía",
   "Cirugía Pediátrica",
   "Cirugía Vascular",
   "Traumatología y Cirugía Ortopédica",
 
   // Diagnóstico y Tratamiento
   "Imágenes y Radiología",
   "Medicina Nuclear",
   "Laboratorio Clínico",
   "Endoscopía Digestiva",
   "Terapia Intensiva",
   "Terapia Intermedia",
   "Medicina de Rehabilitación y Fisiatría",
 
   // Especialidades Odontológicas
   "Odontología General",
   "Ortodoncia",
   "Endodoncia",
   "Periodoncia",
   "Implantología",
   "Cirugía Maxilofacial",
 
   // Salud Mental y Psicológica
   "Psicología Clínica",
   "Psicopedagogía",
   "Terapia Ocupacional",
 
   // Medicina Preventiva
   "Nutrición y Dietética",
   "Medicina del Deporte",
   "Medicina Familiar y General",
   "Medicina Laboral",
   "Inmunizaciones y Vacunación",
 
   // Especialidades Complementarias
   "Fonoaudiología",
   "Kinesiología y Fisioterapia",
   "Podología",
 
   // Especialidades en Desarrollo
   "Medicina Genómica",
   "Telemedicina",
   "Cuidados Paliativos",
   "Sexología Clínica"
 ];

  constructor(private autenticacion: AuthService, private ruta: Router) {}

  ngOnInit(): void {
    this.formulario = new FormGroup({
      especialistaNombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
      especialistaApellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
      especialistaEdad: new FormControl('', [
        Validators.required,
        Validators.min(18),
        Validators.max(80),
      ]),
      especialistaDni: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000000),
      ]),
      OtraEspecialidad: new FormControl('', this.validateSpecialist(this.especialidadesClinica)),
      agregarOtraEspecialidad: new FormControl(''),
      especialistaEmail: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      especialistaClave: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      fotoespecialista: new FormControl('', [Validators.required]),
    });

    this.cargarEspecialidades();
  }

  validateSpecialist(especialidadesClinica: string[]) {
    return (control: AbstractControl): object | null => {
      if (especialidadesClinica.includes(control.value) || control.value == '') return null;
  
      return {
        hasSpecialist: true
      };
    };
  }  

  enImagenSeleccionada(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      const lector = new FileReader();

      lector.onload = (e: any) => {
        this.imagenSeleccionada = e.target.result;

        this.imagenURL = lector.result as string;
      };

      lector.readAsDataURL(archivo);
    }
  }

  restablecerInputImagen() {
    const elementoDeEntrada = document.getElementById(
      'fotoespecialista'
    ) as HTMLInputElement;
    elementoDeEntrada.value = '';
  }

  async cargarEspecialidades() {
    const especialidadesData = await this.autenticacion.obtenerEspecialidades();
    this.especialidades = especialidadesData.map((especialidadData: any) => {
      const especialidad = new Especialidad(
        especialidadData.id,
        especialidadData.nombre,
        especialidadData.foto
      );
      this.formulario.addControl(
        `especialidad_${especialidad.uid}`,
        new FormControl(false)
      );
      return especialidad;
    });
  }

  async agregarEspecialidad() {
    const especialidadNombre =
      this.formulario.controls['OtraEspecialidad'].value.trim();
    if (especialidadNombre !== '') {
      await this.autenticacion.guardarEspecialidad(especialidadNombre, this.especialidadesClinica);
      this.formulario.controls['OtraEspecialidad'].setValue('');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: 'Por favor agregue una especialidad válida.',
        timer: 4000,
      });
    }
    this.cargarEspecialidades();
  }

  onSubmit() {
    const especialidadesSeleccionadas = this.especialidades.filter(
      (especialidad) =>
        this.formulario.get(`especialidad_${especialidad.uid}`)?.value
    );
    console.log(especialidadesSeleccionadas);
    console.log("===== FORMULARIO REGISTRO =====");
    console.log(this.formulario);
    console.log(this.formulario.valid);
    console.log("===============================");
    if (this.formulario.valid) {
      this.cargarUsuario();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Ha ocurrido un error, debe completar los datos requeridos.',
        timer: 2500,
      });
    }
  }

  async cargarUsuario() {
    try {
      const especialidadesSeleccionadas = this.especialidades.filter(
        (especialidad) =>
          this.formulario.get(`especialidad_${especialidad.uid}`)?.value
      );
      let data = {
        email: this.formulario.controls['especialistaEmail'].value,
        password: this.formulario.controls['especialistaClave'].value,
        nick: this.formulario.controls['especialistaNombre'].value,
      };
      this.usuario = await this.autenticacion.registrar(data);

      let usuario = new Especialista(
        this.usuario.uid,
        this.formulario.controls['especialistaNombre'].value,
        this.formulario.controls['especialistaApellido'].value,
        this.formulario.controls['especialistaEdad'].value,
        this.formulario.controls['especialistaDni'].value,
        especialidadesSeleccionadas.map((especialidad) => especialidad.uid),
        this.imagenURL,
        'false'
      );
      await this.autenticacion.guardarEspecialistaBD(usuario);
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: '¡Bienvenido!',
        showConfirmButton: false,
        timer: 3000,
      });
      this.ruta.navigate(['/login']);
    } catch (error: any) {
      this.existenciaErrores = true;
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.mensaje = 'Ya se encuentra un usuario registrado con ese email';
          break;
        default:
          this.mensaje = 'Hubo un problema al registrar.';
          break;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: this.mensaje,
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
