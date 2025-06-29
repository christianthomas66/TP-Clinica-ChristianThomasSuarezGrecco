import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Turno } from '../../clases/turno';
import { AuthService } from '../../services/auth.service';
import { BarranavComponent } from '../barranav/barranav.component';
import { AdminNavbarComponent } from '../usuarios/admin-navbar/admin-navbar.component';
import { fadeScaleAnimation } from '../../animacion';

@Component({
  selector: 'app-listaturnosdisponibles',
  standalone: true,
  imports: [CommonModule, BarranavComponent, AdminNavbarComponent],
  templateUrl: './listaturnosdisponibles.component.html',
  styleUrl: './listaturnosdisponibles.component.css',
  animations:[fadeScaleAnimation]
})
export class ListaturnosdisponiblesComponent implements OnInit, OnChanges{
  @Input() especialista: string | undefined;
  @Input() especialidad: string | undefined;
  @Output() turnoSeleccionado = new EventEmitter<{ dia: string; hora: string }>();
  especialistaData: any;
  diasDisponibles: any[] = [];
  spinnerDeCarga: boolean = false;
  diaSeleccionado: string | undefined;
  horaSeleccionada: string | undefined;

  constructor(private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.spinnerDeCarga = true;

    if (this.especialista) {
      this.especialistaData = await this.auth.getUserByUidAndType(
        this.especialista,
        'especialistas'
      );

      console.log("========== Lista Turnos Disponibles ==========");
      console.log(`El medico con id ${this.especialista} tiene la especialidad ${this.especialidad}`);
      console.log(this.especialistaData);
    }
    
    this.diasDisponibles = await this.obtenerDiasDisponibles();
    
    console.log("Los turnos disponibles son:");
    console.log(this.diasDisponibles);
    
    if (this.diasDisponibles.length == 0) {
      this.turnoSeleccionado.emit({
        dia: '',
        hora: '',
      });
    }

    this.spinnerDeCarga = false;
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['especialista']) {
      // const previo = changes['especialista'].previousValue;
      const actual = changes['especialista'].currentValue;
      this.especialista = actual;
      this.spinnerDeCarga = true;
      if (this.especialista) {
        this.especialistaData = await this.auth.getUserByUidAndType(
          this.especialista,
          'especialistas'
        );
      }
      this.diasDisponibles = await this.obtenerDiasDisponibles();
      this.spinnerDeCarga = false;
    }
  }

  seleccionarTurno() {
    if (this.diaSeleccionado && this.horaSeleccionada) {
      this.turnoSeleccionado.emit({
        dia: this.diaSeleccionado,
        hora: this.horaSeleccionada,
      });
    }
  }

  obtenerFechaFormateada(fecha: any): string {
    const opcionesFecha = {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    } as any;
    return fecha.toLocaleDateString('es-ES', opcionesFecha);
  }

  seleccionarHora(dia: any, hora: string): void {
    console.log("COMPONENTE LUSTA TURNOS DISPONIBLES");
    console.log(dia);
    console.log(hora);
    let fecha =  this.obtenerFechaFormateada(dia);
    
    console.log("Hora formateada");
    console.log(fecha);
    
    this.diaSeleccionado = fecha;
    this.horaSeleccionada = hora;

    this.seleccionarTurno();
  }

  async obtenerDiasDisponibles(): Promise<{ dia: Date; horarios: string[] }[]> {
    const today = new Date();
    const diasDisponibles = [];

    const appointments = await this.auth.getAppointmentList();
    
    // Obtener todos los turnos del especialista a la vez
    const todosLosTurnos = this.especialista
    ? await this.auth.obtenerTurnos(this.especialista)
    : [];
    
    const cantidadDias = 15;
    const duracionCita = 30;
    
    console.log("TURNOS RESERVADOS");
    console.log(appointments);
    console.log("LOS HORARIOS QUE SE DEBEN MODIFICAR SON:");
    const especialidad = this.especialistaData.especialidades.find(x => x.especialidad == this.especialidad)
    const especialidades = this.especialistaData;
    
    console.log(especialidad);
    
    for (let i = 0; i < cantidadDias; i++) {
      const currentDate = new Date();

      currentDate.setDate(today.getDate() + i);

      const currentDayOfWeek = currentDate.getDay();

      especialidad.horarios.forEach(element => {
        if (element.estaActivo && element.diaSemana == currentDayOfWeek) {
          const startTime = new Date(element.fechaInicio.seconds * 1000);
          const endTime = new Date(element.fechaFinal.seconds * 1000);

          startTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          endTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          
          const timeSlots: any[] = [];

          let currentSlot = new Date(startTime);
  
          while (currentSlot < endTime) {
            const slot = new Date(currentSlot);

            const isReserved = appointments.some((r) => {
              const fechaFormateada = this.parseFecha(r.fecha);
              console.log(fechaFormateada);
              const reservedDate = this.transformFirebaseTimestamp(fechaFormateada, r.hora);

              console.log("QUE MENSAJE MOSTRAR ACA?");
              console.log(reservedDate);
              console.log(slot);

              // DateTime result = DateTime.ParseExact(TIMESTAMP.ToString().Replace("Timestamp:", "").Trim(),"yyyy-MM-ddTHH:mm:ss.ffffffK", null); 

              return reservedDate.toISOString() == slot.toISOString();
            });

            if (!isReserved) {
              timeSlots.push(slot);
            }

            currentSlot.setMinutes(currentSlot.getMinutes() + duracionCita);
          }
  
          if (timeSlots.length > 0) {
            diasDisponibles.push({
              dia: currentDate,
              horariosDisponibles: timeSlots,
            });
          }
        }
      });
    }
    console.log("===== LOS TURNOS DISPONIBLES SON =====");
    console.log(diasDisponibles);
      
      // const dia = new Date(today);

      // dia.setDate(today.getDate() + i);

      // if (dia.getDay() === 0) {
      //   continue;
      // }

      // // Si el día es sábado, ajustar los horarios disponibles
      // let horariosPosibles;
      // if (dia.getDay() === 6) {
      //   horariosPosibles = this.obtenerHorariosDisponibles('sabado');
      // } else {
      //   const horariosManana = this.obtenerHorariosDisponibles('mañana');
      //   const horariosTarde = this.obtenerHorariosDisponibles('tarde');
      //   horariosPosibles = horariosManana.concat(horariosTarde);
      // }

      // // Filtrar los turnos del especialista para el día actual
      // const turnosDelDia = todosLosTurnos.filter((turno) =>
      //   this.mismoDia(turno.fecha, dia)
      // );

      // // Convertir los horarios tomados en un Set para acelerar las búsquedas
      // const horariosTomados = new Set(turnosDelDia.map((turno) => turno.hora));

      // // Filtrar los horarios que ya están tomados
      // const horariosDisponibles = horariosPosibles.filter(
      //   (horario) => !horariosTomados.has(horario)
      // );

      // // Solo agregar el día a la lista si hay al menos un horario disponible
      // if (horariosDisponibles.length > 0) {
      //   diasDisponibles.push({ dia, horarios: horariosDisponibles });
      // }
      return diasDisponibles;
    }

    parseFecha(fechaStr: string): Date {
  // Eliminar el día de la semana (ej: "lunes, ")
  const partes = fechaStr.split(',')[1].trim(); // "30/6/2025"

  // Separar por "/"
  const [dia, mes, anio] = partes.split('/').map(Number);

  // Crear objeto Date (mes empieza desde 0 en JS)
  return new Date(anio, mes - 1, dia);
}

  transformFirebaseTimestamp(firebaseDate: any, firebaseHour: any): Date {
    console.log("DENTRO DE LA FUNCION DE TRANSFORMAR A TIMESTAMP");
    console.log(firebaseDate);
    console.log(firebaseHour);

    // const date = new Date(firebaseDate.seconds * 1000);
    const hour = new Date(firebaseHour.seconds * 1000);
  
    firebaseDate.setHours(hour.getHours(), hour.getMinutes(), hour.getSeconds(), hour.getMilliseconds());
  
    return firebaseDate;
  }

  mismoDia(timestamp: any, dia: Date): boolean {
    const turnoFecha = this.convertirTimestampADate(timestamp);
    return (
      turnoFecha.getDate() === dia.getDate() &&
      turnoFecha.getMonth() === dia.getMonth() &&
      turnoFecha.getFullYear() === dia.getFullYear()
    );
  }

  convertirTimestampADate(timestamp: any): Date {
    const seconds = timestamp.seconds;
    const nanoseconds = timestamp.nanoseconds;
    return new Date(seconds * 1000 + nanoseconds / 1000000);
  }

  async obtenerTurnosDelEspecialista(dia: Date): Promise<Turno[]> {
    if (!this.especialista) {
      return [];
    }
    const turnos = await this.auth.obtenerTurnos(this.especialista);
    return turnos.filter((turno) => {
      const turnoFecha = this.convertirTimestampADate(turno.fecha);
      return (
        turnoFecha.getDate() === dia.getDate() &&
        turnoFecha.getMonth() === dia.getMonth() &&
        turnoFecha.getFullYear() === dia.getFullYear()
      );
    });
  }

  /// MAÑANA 8 A 13 HS Y TARDE 14 A 19 HS
  obtenerHorariosDisponibles(periodo: string): string[] {
    let horariosDisponibles: string[] = [];
    if (this.especialistaData && this.especialistaData.turnos) {
      const turnoEspecialista = this.especialistaData.turnos.find(
        (turno: any) => turno.especialidad === this.especialidad
      );
      if (turnoEspecialista?.turno === periodo) {
        if (periodo === 'mañana') {
          horariosDisponibles = Array.from({ length: 6 }, (_, index) => {
            const hora = 8 + index;
            return `${hora}:00`;
          });
        } else if (periodo === 'tarde') {
          horariosDisponibles = Array.from({ length: 6 }, (_, index) => {
            const hora = 14 + index;
            return `${hora}:00`;
          });
        }
      }
      if (periodo === 'sabado' && turnoEspecialista?.turno === 'mañana') {
        horariosDisponibles = Array.from({ length: 7 }, (_, index) => {
          const hora = 8 + index;
          return `${hora}:00`;
        });
      }
    }
    return horariosDisponibles;
  }
}
