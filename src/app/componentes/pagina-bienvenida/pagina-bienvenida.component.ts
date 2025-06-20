import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pagina-bienvenida',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './pagina-bienvenida.component.html',
  styleUrl: './pagina-bienvenida.component.css'
})
export class PaginaBienvenidaComponent {
  constructor(private _languageService: LanguageService, private translate: TranslateService) {}

  onChangeLanguage(language: string) {
    this._languageService.changeLanguage(language);
  }
}
