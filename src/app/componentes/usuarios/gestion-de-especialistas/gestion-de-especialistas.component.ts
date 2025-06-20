import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Especialista } from '../../../clases/especialista';
import { AuthService } from '../../../services/auth.service';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { fadeScaleAnimation } from '../../../animacion';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Firestore, addDoc, collection, doc, getDocs, getFirestore, query, updateDoc, where } from '@angular/fire/firestore';
import { UserFavbuttonComponent } from './user-favbutton/user-favbutton.component';
import { EstadosFavButtonComponent } from '../../estados-fav-button/estados-fav-button.component';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

@Component({ 
  selector: 'app-gestion-de-especialistas',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminNavbarComponent, NgbNavModule, UserFavbuttonComponent, EstadosFavButtonComponent],
  templateUrl: './gestion-de-especialistas.component.html',
  styleUrl: './gestion-de-especialistas.component.css',
  animations: [fadeScaleAnimation]
})
export default class GestionDeEspecialistasComponent {
  active = 1;
  especialistas: any[] = [];
  administradores: any[] = [];
  pacientes: any[] = [];

  data: any[] = [];

  loading: boolean = false;
  constructor(private authService: AuthService, private _firestore: Firestore) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.cargarEspecialistas();

    await this.getAdminList();
    await this.getDoctorList();
    await this.getPatientList();

    this.loading = false;
  }

  async getAdminList(): Promise<void> {
    const docRef = collection(this._firestore, 'admins');
    const querySnapshot = await getDocs(docRef);

    this.administradores = querySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    this.data = [...this.data, ...this.administradores];
  }

  async getDoctorList(): Promise<void> {
    const docRef = collection(this._firestore, 'especialistas');
    const querySnapshot = await getDocs(docRef);

    this.especialistas = querySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    this.data = [...this.data, ...this.especialistas];
  }

  async getPatientList(): Promise<void> {
    const docRef = collection(this._firestore, 'pacientes');
    const querySnapshot = await getDocs(docRef);

    this.pacientes = querySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    this.data = [...this.data, ...this.pacientes];
  }

  onDownloadExcel() {
    this.createExcel(this.data);
  }
  
  createExcel(data: any) {
    const propertiesToOmit = ["foto1", "foto2"];

    const result = data.map(item => {
      const newItem = { ...item }; // Hacemos una copia del objeto
      propertiesToOmit.forEach(prop => delete newItem[prop]); // Eliminamos propiedades no deseadas
      return newItem;
    });
    console.log("===== GESTION DE ESPECIALISTAS =====");
    console.log(result);
    console.log("===== GESTION DE ESPECIALISTAS =====");

    const worksheet = XLSX.utils.json_to_sheet(result);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    saveAs(
      new Blob([excelBuffer]),
      `users.xlsx`
    );
  }

  async cargarEspecialistas() {
    const especialistasData = await this.authService.obtenerEspecialistas();
    const especialidades = await this.authService.obtenerEspecialidades();

    this.especialistas = especialistasData.map((especialistaData: any) => {
      const especialidadesDelEspecialista = Array.isArray(
        especialistaData.especialidades
      )
        ? especialistaData.especialidades.map((especialidadId: string) => {
            const especialidad = especialidades.find(
              (esp: any) => esp.id === especialidadId
            );
            return especialidad
              ? especialidad.nombre
              : 'Especialidad Desconocida';
          })
        : [];

      return new Especialista(
        especialistaData.uid,
        especialistaData.nombre,
        especialistaData.apellido,
        especialistaData.edad,
        especialistaData.dni,
        especialidadesDelEspecialista,
        especialistaData.foto1,
        especialistaData.verificado
      );
    });
  }

  async aceptarEspecialista(especialista: Especialista): Promise<void> {
    try {
      await this.authService.actualizarVerificadoEspecialista(
        especialista.uid,
        'true'
      );
      especialista.verificado = 'true';
    } catch (error) {
      console.error('Error al aceptar al especialista: ', error);
      throw error;
    }
  }

  async rechazarEspecialista(especialista: Especialista) {
    try {
      await this.authService.actualizarVerificadoEspecialista(
        especialista.uid,
        'null'
      );
      especialista.verificado = 'null';
    } catch (error) {
      console.error('Error al rechazar al especialista: ', error);
      throw error;
    }
  }
}
