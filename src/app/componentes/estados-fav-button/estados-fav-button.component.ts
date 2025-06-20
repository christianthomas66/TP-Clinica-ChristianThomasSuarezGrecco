import { Component } from '@angular/core';
import { Especialista } from '../../clases/especialista';
import { AuthService } from '../../services/auth.service';
import { Firestore, addDoc, collection, doc, getDocs, getFirestore, query, updateDoc, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../usuarios/admin-navbar/admin-navbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-estados-fav-button',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent, TranslateModule],
  templateUrl: './estados-fav-button.component.html',
  styleUrl: './estados-fav-button.component.css'
})
export class EstadosFavButtonComponent {
  active = 1;
  especialistas: Especialista[] = [];
  administradores: any[] = [];
  pacientes: any[] = [];
  loading: boolean = false;
  constructor(private authService: AuthService, private _firestore: Firestore, private translate: TranslateService) {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.cargarEspecialistas();
    await this.getAdminList();
    await this.getPatientList();
    console.log(this.pacientes);
    this.loading = false;
  }

  async getAdminList(): Promise<void> {
    const docRef = collection(this._firestore, 'admins');
    const querySnapshot = await getDocs(docRef);

    this.administradores = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
  }

  async getPatientList(): Promise<void> {
    const docRef = collection(this._firestore, 'pacientes');
    const querySnapshot = await getDocs(docRef);

    this.pacientes = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
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
