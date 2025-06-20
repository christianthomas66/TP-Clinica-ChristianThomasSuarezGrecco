import { Component, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './captcha-directiva.component.html',
  styleUrls: ['./captcha-directiva.component.css'],
})
export class CaptchaDirectivaComponent {
  @Output() corrected = new EventEmitter();

  question = '4 x 1 ='; // Pregunta del Captcha
  answer = 4; // Respuesta esperada
  userInput: string = ''; // Respuesta ingresada por el usuario
  isCorrect: boolean = false;

  validateCaptcha(input: string) {
    this.userInput = input;
    this.isCorrect = +input === this.answer;
  }

  onSubmit() {
    if (this.isCorrect) {
      this.corrected.emit(true);
    } else {
      this.corrected.emit(false);
    }
  }
}