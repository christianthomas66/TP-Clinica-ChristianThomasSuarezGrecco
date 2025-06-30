import { Component } from '@angular/core';
import { HistoriaClinica } from '../../clases/historiaClinica';
import { Turno } from '../../clases/turno';
import { AuthService } from '../../services/auth.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../usuarios/admin-navbar/admin-navbar.component';
import { RouterOutlet } from '@angular/router';
import { EspecialistaNavbarComponent } from '../especialista-navbar/especialista-navbar.component';
import { fadeScaleAnimation, rotateAnimation } from '../../animacion';
import {
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-usuarios-pacientes',
  standalone: true,
  imports: [CommonModule, EspecialistaNavbarComponent, AdminNavbarComponent, RouterOutlet],
  templateUrl: './usuarios-pacientes.component.html',
  styleUrl: './usuarios-pacientes.component.css',
  animations: [fadeScaleAnimation, rotateAnimation],
})
export default class UsuariosPacientesComponent {
  identidad: string | null = '';
  usuario: any = null;
  historiasClinicas: any[] = [];
  historiasClinicasPorPaciente: any[] = [];
  turno: any | null = null;
  historiaVer: boolean = false;
  mostrar: boolean = false;
  loading: boolean = false;
  historiapruebaPdf: HistoriaClinica = new HistoriaClinica();
  constructor(private authService: AuthService, private _firestore: Firestore) {}

  async ngOnInit(): Promise<void> {
    if (this.loading) {
      // Evitar múltiples llamadas a ngOnInit
      return;
    }

    this.loading = true;
    await this.user();
    this.identidad = localStorage.getItem('identidad');
    await this.obtenerHistorias();
    console.log(this.historiasClinicas);
    this.loading = false;
  }

  mostrarHistoria(turno: Turno) {
    this.historiaVer = true;
    this.turno = turno;
  }


  descargarHistoriasClinicas(Turnos: Turno[]) {
    // Convertir cada historia clínica en un objeto que se pueda convertir a Excel
    console.log("USUARIOS PACIENTES COMPONENT");
    const historiasClinicasArray = Turnos.map((turno) => {
      console.log(turno);

      // Crear una copia de historiaClinica para no modificar el objeto original
      let historiaClinicaCopia: Partial<Turno> = {
        ...turno,
      };
      // Eliminar los campos que no quieres incluir

      // Desglosar el objeto datosDinamicos en propiedades individuales
      let datosDinamicosDesglosados: { [clave: string]: any } = {};
      for (let clave in turno.historiaClinica?.datosDinamicos) {
        datosDinamicosDesglosados[clave] =
          turno.historiaClinica.datosDinamicos[clave];
      }

      return {
        Especialidad: turno.Especialidad,
        Especialista: turno.Especialista,
        Paciente: turno.Paciente,
        fecha: turno.fecha,
        altura: turno.historiaClinica?.altura,
        peso: turno.historiaClinica?.peso,
        presion: turno.historiaClinica?.presion,
        temperatura: turno.historiaClinica?.temperatura,
        ...datosDinamicosDesglosados,
      } as any;
    });

    const worksheet = XLSX.utils.json_to_sheet(historiasClinicasArray);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    saveAs(
      new Blob([excelBuffer]),
      `${Turnos[0].Paciente}_historias_clinicas.xlsx`
    );
  }

  historiasClinicasUnicas: Turno[] = [];

  async getUserById(doctorId: string, collName: string) {
  const collRef = collection(this._firestore, collName);
  const q = query(collRef, where('uid', '==', doctorId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]; // tomamos el primero (debería ser único)
    return doc.data() as any;
  }

  return null; // o throw new Error("No se encontró el doctor");
}


  async obtenerHistorias() {
    let historiasClinicasA: any[] = [];
    let pacientes = await this.authService.getAllPacientes();
    let especialidades = await this.authService.obtenerEspecialidades();
    let especialistas = await this.authService.obtenerEspecialistas();

    switch (this.identidad) {
      case 'paciente':
        historiasClinicasA = await this.authService.obtenerTurnosDelUsuario(
          this.usuario.uid,
          'paciente'
        );
        break;
      case 'especialista':
        historiasClinicasA = await this.authService.obtenerTurnosDelUsuario(
          this.usuario.uid,
          'especialista'
        );
        break;
      case 'admin':
        historiasClinicasA = await this.authService.obtenerTodosLosTurnos();
        break;
    }

    console.log("HISTORIA CLINICA AAAAAAAAAAAA");
    console.log(historiasClinicasA);

    for (const historia of historiasClinicasA) {
      const pacienteEncontrado = await this.getUserById(historia.paciente, "pacientes");
      // const pacienteEncontrado = pacientes.find(
      //   (p) => p.uid === historia.idPaciente
      // );

      if (pacienteEncontrado) {
        const nombrePaciente = pacienteEncontrado.nombre;
        const fotoPaciente = pacienteEncontrado.foto1;

        historia.Paciente = nombrePaciente;
        historia.fotoPaciente = fotoPaciente;
      } else {
        historia.Paciente = 'Desconocido';
      }

      // const medico = await this.getUserById(historia.especialistas, "especialistas");

      // historia.Especialista = medico.nombre;
      // historia.Especialista =
      //   especialistas.find((e) => e.uid === historia.idEspecialista)?.nombre ||
      //   'Desconocido';
      historia.Especialidad = historia.especialidad;
      // historia.Especialidad =
      //   especialidades.find((e) => e.id === historia.idEspecialidad)?.nombre ||
      //   'Desconocido';
    }

    this.historiasClinicas = historiasClinicasA.filter(
      (historia) => historia.historiaClinica !== null
    );

    // Evitar duplicados en historiasClinicasUnicas
    console.log("QQQQQQQQQQQQQQQQQQQQQQQQQ");
    this.historiasClinicasUnicas = Array.from(new Set(this.historiasClinicas.map(a => a.Paciente)))
      .map(Paciente => {
        console.log(Paciente);
        return this.historiasClinicas.find(a => a.Paciente === Paciente);
      });

    console.log(this.historiasClinicas);
  }

  mostrarHistoriasClinicasDePaciente(idPaciente: string) {

    console.log(idPaciente);
    console.log('uid paciente arriba.');

    this.historiasClinicasPorPaciente = this.historiasClinicas.filter(
      (historia) => historia.idPaciente === idPaciente
    );
  }
  //gjB9xASvWXW4VnR396N4vfWL8Lm1
  mostraryDescargarHistoriasClinicasDePaciente(idPaciente: string) {
    this.historiasClinicasPorPaciente = this.historiasClinicas.filter(
      (historia) => historia.idPaciente === idPaciente
    );
    this.descargarHistoriasClinicas(this.historiasClinicasPorPaciente);
  }

  uidSeleccionado: string = '';

  checkboxSeleccionado: any;

  mostrarResena(historia: Turno, event: any) {
    if (
      this.checkboxSeleccionado &&
      this.checkboxSeleccionado !== event.target
    ) {
      this.checkboxSeleccionado.checked = false;
    }
    this.checkboxSeleccionado = event.target;
    this.mostrar = event.target.checked;
    this.uidSeleccionado = historia.uid;
  }

  async user() {
    let user = localStorage.getItem('logueado');
    if (user) {
      const especialista = await this.authService.getUserByUidAndType(
        user,
        'especialistas'
      );
      if (especialista) {
        this.identidad = 'especialista';
        this.usuario = especialista;
        localStorage.setItem('identidad', 'especialista');
      } else {
        const paciente = await this.authService.getUserByUidAndType(
          user,
          'pacientes'
        );
        if (paciente) {
          this.identidad = 'paciente';
          this.usuario = paciente;
          localStorage.setItem('identidad', 'paciente');
        } else {
          const admin = await this.authService.getUserByUidAndType(
            user,
            'admins'
          );
          this.identidad = 'admin';
          this.usuario = admin;
          localStorage.setItem('identidad', 'admin');
        }
      }
    }
  }
}

