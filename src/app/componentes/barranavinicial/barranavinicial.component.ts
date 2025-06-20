import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-barranavinicial',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './barranavinicial.component.html',
  styleUrl: './barranavinicial.component.css',
})
export class BarranavinicialComponent {
  constructor(private _languageService: LanguageService, private translate: TranslateService) {}

  onChangeLanguage(language: string) {
    this._languageService.changeLanguage(language);
  }
}
