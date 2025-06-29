import { Component } from '@angular/core';
import { TranslateService, TranslateLoader } from '@ngx-translate/core';

import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { provideTranslateLoader } from '@ngx-translate/http-loader';

import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BarranavComponent } from './componentes/barranav/barranav.component';
// import * as translationsEN from "../assets/i18n/en.json";


// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, BarranavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Clinica Online por Christian Thomas Suarez Grecco';

  constructor(private translate: TranslateService) {
    // translate.setTranslation('en', translationsEN);
    translate.setDefaultLang('es');
    // translate.use('en');
    // Establece un idioma predeterminado
    // this.translate.setDefaultLang('es');

    // translate.addLangs(['en', 'es', 'pt']);
    // translate.setDefaultLang('en');

    // const browserLang = translate.getBrowserLang();

    // translate.use(browserLang.match(/en|es/) ? browserLang : 'en');
  }
  // changeLanguage(event: Event) {
  //   const lang = (event.target as HTMLSelectElement).value;
  //   this.translate.use(lang);
  // }
}

