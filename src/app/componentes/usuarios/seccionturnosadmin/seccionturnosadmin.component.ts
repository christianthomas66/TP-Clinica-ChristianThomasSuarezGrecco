import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../services/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Turno } from '../../../clases/turno';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { RouterOutlet } from '@angular/router';
import { fadeScaleAnimation } from '../../../animacion';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-seccionturnosadmin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent, RouterOutlet],
  templateUrl: './seccionturnosadmin.component.html',
  styleUrl: './seccionturnosadmin.component.css',
  animations:[fadeScaleAnimation]
})
export default class SeccionturnosadminComponent {
  turnos: any[] = [];
  turnoA: Turno | null = null;
  comentario: boolean = false;
  motivoCancelacion: string = '';
  loading : boolean = false;
  @ViewChild('filtro') filtro!: ElementRef;

  private _turnos = new BehaviorSubject<any[]>([]);
  turnosFiltrados!: Observable<any[]>;

  ngAfterViewInit() {
    this.spinner.show();
    setTimeout(() => {
      this.turnosFiltrados = this._turnos.asObservable().pipe(
        map((turnos) => {
          console.log("OBSERVABLE: ");
          console.log(turnos);
          let filtro = this.filtro.nativeElement.value.toLowerCase();
          
          console.log("===== FILTRO =====");
          return turnos.filter((turno) => {
            console.log(turno);
            let especialidad = turno.Especialidad.toLowerCase();
            let especialista = turno.Especialista.toLowerCase();
            console.log(especialista);
            console.log(filtro);
            console.log("=======================================");

            return (
              especialidad.includes(filtro) || especialista.includes(filtro)
            );
          });
        })
      );
      this.spinner.hide();
    }, 4500);
  }

  constructor(
    private firestoreService: AuthService,
    private _firestore: Firestore,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    this.loading = true;
    await this.cargarTurnos();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
    this.loading = false;
  }

  async cargarTurnos() {
    let turnos = await this.firestoreService.obtenerTodosLosTurnos();
    let especialidades = await this.firestoreService.obtenerEspecialidades();
    let especialistas = await this.firestoreService.obtenerEspecialistas();
    let pacientes = await this.firestoreService.getAllPacientes();
    let mapEspecialistas: { [key: string]: any } = {};
    let mapPacientes: { [key: string]: any } = {};

    especialistas.forEach((especialista) => {
      mapEspecialistas[especialista.uid] = especialista;
    });

    pacientes.forEach((paciente: any) => {
      mapPacientes[paciente.uid] = paciente;
    });

    console.log("===== SECCION TURNOS ADMIN =====");
    for (let turno of turnos) {
      let especialidad = especialidades.find((especialidad) => {
          console.log(especialidad);
          console.log(turno.especialidad);

          return especialidad.nombre == turno.especialidad
        }
      );

      console.log("LA ESPECIALIDAD ES: ");
      console.log(especialidad);

      turno.Especialidad = especialidad.nombre;
      turno.idEspecialidad = especialidad.id;

      let especialista = mapEspecialistas[turno.idEspecialista];
      console.log("DEBAJO DE ESTA LINEA ESTA EL ERROR");
      console.log(especialista);
      console.log(turno);

      const doctor = await this.getUserById(turno.especialista, "especialistas");
      const patient = await this.getUserById(turno.paciente, "pacientes");

      console.log(doctor);
      console.log(patient);
      turno.Especialista = doctor.nombre + ' ' + doctor.apellido;
      turno.idEspecialista = doctor.uid;

      let paciente = mapPacientes[turno.idPaciente];
      turno.Paciente = patient.nombre + ' ' + patient.apellido;
      turno.idPaciente = patient.uid;
    }

    this._turnos.next(turnos);
  }

  async getUserById(doctorId: string, collectionName: string) {
    const collRef = collection(this._firestore, collectionName);

    const q = query(collRef, where('uid', '==', doctorId));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];

      return doc.data() as any;
    }

    return null;
  }

  filtrarTurnos() {
    this._turnos.next(this._turnos.value);
  }

  // obtenerFechaHoraFormateada(fecha: any, hora: string): string {
  //   const fechaFormateada = fecha.toDate().toLocaleDateString('es-AR');
  //   return `${fechaFormateada} ${hora}`;
  // }

  async cancelarTurno() {
    if (this.turnoA && this.motivoCancelacion != '') {
      console.log(this.motivoCancelacion);
      this.turnoA.estado = 'cancelado';
      this.turnoA.comentario = this.motivoCancelacion;
      try {
        console.log(this.turnoA);
        await this.firestoreService.modificarTurno(this.turnoA);
        Swal.fire({
          icon: 'success',
          title: 'Turno cancelado',
          text: 'el turno ha sido cancelado..',
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Hubo un problema',
          text: 'el turno no ha sido cancelado..',
          showConfirmButton: false,
          timer: 1500,
        });
      }
      this.turnoA = null;
      this.comentario = false;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Hubo un problema',
        text: 'el turno no ha sido cancelado..',
        showConfirmButton: false,
        timer: 1500,
      });
      this.turnoA = null;
      this.comentario = false;
    }
  }

  cargarComentario(turno: Turno) {
    this.motivoCancelacion = '';
    this.comentario = true;
    this.turnoA = turno;
  }
}
