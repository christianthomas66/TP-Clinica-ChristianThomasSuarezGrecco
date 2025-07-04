import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Especialidad } from '../../clases/especialidad';
import { Especialista } from '../../clases/especialista';
import { Paciente } from '../../clases/paciente';
import { AuthService } from '../../services/auth.service';
import { Turno } from '../../clases/turno';
import Swal from 'sweetalert2';
import { ListaturnosdisponiblesComponent } from '../listaturnosdisponibles/listaturnosdisponibles.component';
import { BarranavComponent } from '../barranav/barranav.component';
import { AdminNavbarComponent } from '../usuarios/admin-navbar/admin-navbar.component';
import { fadeScaleAnimation } from '../../animacion';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-gestionturnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListaturnosdisponiblesComponent, BarranavComponent, AdminNavbarComponent, RouterOutlet, NgbDropdownModule],
  templateUrl: './gestionturnos.component.html',
  styleUrl: './gestionturnos.component.css',
  animations:[fadeScaleAnimation]
})

export default class GestionturnosComponent {
  imagenSeleccionada: any = null;
  urlImagen: string = '';
  usuario: any;
  formulario!: FormGroup;
  errorChequeo: boolean = false;
  mensaje: string = '';
  especialidades: any[] = [];
  // especialidades: Especialidad[] = [];
  especialistas: any[] = [];
  // especialistas: Especialista[] = [];
  especialistasFiltrados: Especialista[] = [];
  pacientes: Paciente[] = [];
  especialidadSeleccionada: string | undefined = '';
  fechaObtenida: boolean = false;
  especialista: string | undefined = undefined;
  paciente: string | undefined = undefined;
  especialistaFalso: boolean = false;
  esAdmin: boolean = false;
  cargando: boolean = false;
  cargado: boolean = false; // Nueva variable para controlar la carga

  constructor(
    private servicioAutenticacion: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.cargando = true;
    this.formulario = new FormGroup({
      especialidad: new FormControl('', [Validators.required]),
      especialista: new FormControl('', [Validators.required]),
      paciente: new FormControl('', this.esAdmin ? [Validators.required] : []),
      hora: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
    });

    let id = localStorage.getItem('logueado');
    this.esAdmin = localStorage.getItem('admin') === 'true';

    if (id) {
      let admin = await this.servicioAutenticacion.getUserByUidAndType(id, 'admins');
      if (admin != null) {
        this.esAdmin = true;
        this.cargarPacientes();
        localStorage.setItem('admin', 'true');
      }
    }

    await this.cargarEspecialidades();

    this.cargando = false;
    this.cargado = true; // Se establece a true después de cargar todo
  }

  enCambioEspecialidad(uid: any) {
    console.log(uid);
    
    this.especialidadSeleccionada = uid;
    this.formulario.controls['especialidad'].setValue(uid);
    this.filtrarEspecialistas();
    this.especialista = undefined;
    this.fechaObtenida = false;
  }

  enCambioEspecialista(uid: any) {
    this.especialista = uid;
    this.formulario.controls['especialista'].setValue(uid);
    console.log(this.especialista);
    this.fechaObtenida = false;
    this.cdr.detectChanges();
  }

  async cargarPacientes() {
    this.pacientes = await this.servicioAutenticacion.obtenerPacientes();
  }

  async cargarEspecialidades() {
    const datosEspecialidades = await this.servicioAutenticacion.obtenerEspecialidades();

    this.especialidades = datosEspecialidades;
    // this.especialidades = datosEspecialidades.map((datosEspecialidad: any) => {
    //   const especialidad = new Especialidad(
    //     datosEspecialidad.id,
    //     datosEspecialidad.nombre,
    //     datosEspecialidad.foto
    //   );
    //   return especialidad;
    // });

    this.cargarEspecialistas();
  }

  async cargarEspecialistas() {
    const datosEspecialistas = await this.servicioAutenticacion.obtenerEspecialistas();
    this.especialistas = datosEspecialistas;

    // this.especialistas = datosEspecialistas.map((datosEspecialista: any) => {
    //   const especialidadesDelEspecialista = Array.isArray(datosEspecialista.especialidades) ? datosEspecialista.especialidades.map((idEspecialidad: string) => {
    //     const especialidad = especialidades.find(
    //           (esp: any) => esp.uid === idEspecialidad
    //         );
    //         return especialidad ? especialidad.uid : 'Especialidad Desconocida';
    //       })
    //     : [];

    // console.log(this.especialistas);
        
    //   let esp = new Especialista(
    //     datosEspecialista.uid,
    //     datosEspecialista.nombre,
    //     datosEspecialista.apellido,
    //     datosEspecialista.edad,
    //     datosEspecialista.dni,
    //     especialidadesDelEspecialista,
    //     datosEspecialista.foto1,
    //     datosEspecialista.verificado
    //   );
    //   esp.turnos = datosEspecialista.turnos;
    //   return esp;
    //   // return 1;
    // });
  }

  filtrarEspecialistas() {
    console.log("========== Medicos ==========");
    console.log(this.especialistas);

    this.especialistasFiltrados = this.especialistas.filter((e: any) => {
      console.log(`El medico ${e.nombre} ${e.apellido} tiene la especialidad?: ${this.especialidadSeleccionada}`);
      console.log(e.especialidades.some(x => x.especialidad == this.especialidadSeleccionada));
      console.log("========================================================");

      return e.especialidades.some(x => x.especialidad == this.especialidadSeleccionada) && e.verificado == 'true'
    });

    console.log(this.especialistasFiltrados);
    // this.especialistasFiltrados = this.especialistas.filter(
    //   (especialista: any) =>
    //     especialista.especialidades.includes(this.especialidadSeleccionada) &&
    //     especialista.verificado == 'true'
    // );
  }

  enTurnoSeleccionado(turno: any) {
    console.log("===== GESTION TURNOS COMPONENT  =====");
    console.log(turno);
    if (turno.hora == '') {
      this.fechaObtenida = false;
      this.especialista = undefined;
      this.especialistaFalso = true;
      Swal.fire({
        icon: 'error',
        title: 'Error, el especialista no tiene horarios cargados...',
        timer: 2500,
      });
      return;
    }

    this.especialistaFalso = false;
    const fechaSeleccionada: string = turno.dia;
    const horaSeleccionada: string = turno.hora;

    this.formulario.controls['fecha'].setValue(fechaSeleccionada);
    this.formulario.controls['hora'].setValue(horaSeleccionada);
    this.fechaObtenida = true;

    Swal.fire({
      icon: 'success',
      title:
        'La fecha seleccionada: ' +
        fechaSeleccionada +
        ' a las ' +
        horaSeleccionada,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  async onSubmit() {
    if (this.formulario.valid && this.especialistaFalso == false) {
      let paciente = localStorage.getItem('logueado');
      if (this.esAdmin) {
        paciente = this.formulario.controls['paciente'].value;
      }
      if (paciente) {
        const puedeCargarTurno = await this.validarTurno(paciente);
        if (puedeCargarTurno) {
          this.cargarTurno(paciente);
        }
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error, complete los datos correctamente',
        timer: 2500,
      });
    }
  }

  async validarTurno(idPaciente: string): Promise<boolean> {
    const especialidad = this.formulario.controls['especialidad'].value;
    const fechaSeleccionada = this.formulario.controls['fecha'].value;
    const horaSeleccionada = this.formulario.controls['hora'].value;
    const idEspecialista = this.formulario.controls['especialista'].value;

    // Obtener los turnos del paciente
    const turnosDelPaciente = await this.servicioAutenticacion.obtenerTurnosDelUsuario(
      idPaciente,
      'paciente'
    );

    for (const turno of turnosDelPaciente) {
      if (turno.fecha === fechaSeleccionada && turno.hora === horaSeleccionada) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ya tiene un turno en ese horario. No se puede solicitar otro turno.',
          timer: 3000
        });
        return false;
      }
    }

    // Obtener los turnos del especialista
    const turnosDelEspecialista = await this.servicioAutenticacion.obtenerTurnosDelUsuario(
      idEspecialista,
      'especialista'
    );

    for (const turno of turnosDelEspecialista) {
      if (turno.fecha === fechaSeleccionada && turno.hora === horaSeleccionada && turno.estado === 'aceptado') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El especialista ya tiene un turno aceptado en ese horario. No se puede solicitar el turno.',
          timer: 3000
        });
        return false;
      }
    }

    return true;
  }

  async cargarTurno(paciente: string) {
    try {
      console.log("===== GESTION TURNOS | CARGAR TURNO =====");
      console.log(paciente);
      let turno = new Turno(
        '',
        this.formulario.controls['especialista'].value,
        this.formulario.controls['especialidad'].value,
        paciente,
        'espera',
        this.formulario.controls['fecha'].value,
        this.formulario.controls['hora'].value
      );
      console.log(turno);
      await this.servicioAutenticacion.almacenarTurno(turno);
      Swal.fire({
        icon: 'success',
        text: 'Deberá esperar que el especialista acepte!',
        title: '¡Turno solicitado!',
        showConfirmButton: false,
        timer: 1500,
      });
      this.formulario.reset();
      this.especialista = undefined;
      this.especialidadSeleccionada = undefined;
      this.fechaObtenida = false;
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al solicitar turno',
        text: this.mensaje,
        timer: 4000,
      });
    }
  }
}
