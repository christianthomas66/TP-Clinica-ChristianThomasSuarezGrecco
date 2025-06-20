import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private _translateService: TranslateService) { }

  changeLanguage(language: string): void {
    this._translateService.use(language);
  }
}