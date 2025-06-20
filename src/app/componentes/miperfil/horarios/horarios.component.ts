import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Firestore, Timestamp, collection, getDocs, doc, updateDoc, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule,
    NgbNavModule,
    NgbNavModule
  ],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css',
})
export class HorariosComponent implements OnInit {
  especialidades: any[] = [];
  currentSpecialty: string = '';

  active = 'top';
  doctorId!: string;

  constructor(private _firestore: Firestore, private authService: AuthService) {}

  async ngOnInit() {
    await this.getDoctorList();

    this.currentSpecialty = this.especialidades[0].nombre;
  }
  
  async getDoctorList() {
    let user = localStorage.getItem('logueado');
    
    if (user) {
      const doctor = await this.authService.getUserByUidAndType(
        user,
        'especialistas'
      );

      this.doctorId = doctor.uid;

      console.log("===== MOSTRAR DOCTOR =====");
      console.log(doctor.especialidades);
      console.log("===== MOSTRAR DOCTOR =====");

      this.especialidades = doctor.especialidades;
    }
  }

  onChangeSpecialty(specialty: string) {
    this.currentSpecialty = specialty;
  }

  async onChangeTime(e: any, diaSemana: number, fecha: string) {
    const timeValue = e.target.value;
    const [hours, minutes] = timeValue.split(':').map(Number);

    const currentDate = new Date();
    const updatedDate = new Date(currentDate.setHours(hours, minutes, 0, 0));

    const specialtyIndex = this.especialidades.findIndex(
      x => x.nombre === this.currentSpecialty
    );

    const horarioIndex = this.especialidades[specialtyIndex].horarios.findIndex(
      h => h.diaSemana === diaSemana
    );

    if (fecha === 'inicio') {
      this.especialidades[specialtyIndex].horarios[horarioIndex].fechaInicio = Timestamp.fromDate(updatedDate);
    } else {
      this.especialidades[specialtyIndex].horarios[horarioIndex].fechaFinal = Timestamp.fromDate(updatedDate);
    }

    const specialistsCollectionRef = collection(this._firestore, 'especialistas');

    const q = query(specialistsCollectionRef, where('id', '==', this.doctorId));

    const querySnapshot = await getDocs(q);

    const specialistDoc = querySnapshot.docs[0];
    const specialistDocRef = doc(this._firestore, `especialistas/${specialistDoc.id}`);

    await updateDoc(specialistDocRef, { especialidades: this.especialidades });
  }
}