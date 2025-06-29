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

  especialidadActual: any;

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

      this.especialidades = doctor.especialidades;
    }
  }

  async onChangeSpecialty(specialty: string) {
    this.currentSpecialty = specialty;

    this.especialidadActual = this.especialidades.find(x => x.especialidad == specialty);

    console.log(this.especialidadActual);
  }

  async onChangeTime(e: any, diaSemana: number, fecha: string) {
    const timeValue = e.target.value;
    const [hours, minutes] = timeValue.split(':').map(Number);

    const currentDate = new Date();
    const updatedDate = new Date(currentDate.setHours(hours, minutes, 0, 0));
    
    let idEspecialidad = 0;
    
    const collRef = collection(this._firestore, 'especialistas');
    
    const q = query(collRef, where('uid', '==', this.doctorId));
    
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;

      if (data.uid == this.doctorId) {
        idEspecialidad = data.id;
        
        data.especialidades.forEach(element => {
          if (element.especialidad == this.currentSpecialty) {
            const specialtyIndex = this.especialidades.findIndex(
              x => x.especialidad === this.currentSpecialty
            );
            
            const horarioIndex = this.especialidades[specialtyIndex].horarios.findIndex(
              h => h.diaSemana === diaSemana
            );
            
            if (fecha === 'inicio') {
              this.especialidades[specialtyIndex].horarios[horarioIndex].fechaInicio = Timestamp.fromDate(updatedDate);
            } else {
              this.especialidades[specialtyIndex].horarios[horarioIndex].fechaFinal = Timestamp.fromDate(updatedDate);
            }
          }
        });
      }
    });
    
    const specialistDocRef = doc(this._firestore, `especialistas/${idEspecialidad}`);

    await updateDoc(specialistDocRef, { especialidades: this.especialidades });
  }
}