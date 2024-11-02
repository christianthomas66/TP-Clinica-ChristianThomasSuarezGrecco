import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { provideHttpClient } from '@angular/common/http';
import { RecaptchaModule } from 'ng-recaptcha';
import { NgxEchartsModule } from 'ngx-echarts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    RecaptchaModule,
    provideRouter(routes),
    /*
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyBwCGCWWdm3Hv1gWYit9LhfGgFheRRYO6g",
      authDomain: "tp-clinica-christianthomas.firebaseapp.com",
      projectId: "tp-clinica-christianthomas",
      storageBucket: "tp-clinica-christianthomas.firebasestorage.app",
      messagingSenderId: "179800149077",
      appId: "1:179800149077:web:c786875929afdf4b2d98dc"

    })),*/
    /*importProvidersFrom(AngularFireModule.initializeApp({
          apiKey: "AIzaSyBwCGCWWdm3Hv1gWYit9LhfGgFheRRYO6g",
          authDomain: "tp-clinica-christianthomas.firebaseapp.com",
          projectId: "tp-clinica-christianthomas",
          storageBucket: "tp-clinica-christianthomas.firebasestorage.app",
          messagingSenderId: "179800149077",
          appId: "1:179800149077:web:c786875929afdf4b2d98dc"
    })),*/
    importProvidersFrom(
      NgxEchartsModule.forRoot({
        echarts: () => import('echarts'),
      })
    ),
    importProvidersFrom(BrowserAnimationsModule),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'tp-clinica-christianthomas',
        appId: '1:179800149077:web:c786875929afdf4b2d98dc',
        storageBucket: 'tp-clinica-christianthomas.firebasestorage.app',
        apiKey: 'AIzaSyBwCGCWWdm3Hv1gWYit9LhfGgFheRRYO6g',
        authDomain: 'tp-clinica-christianthomas.firebaseapp.com',
        messagingSenderId: '179800149077',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()), // Añade BrowserAnimationsModule aquí
  ],
};
