import { Routes } from '@angular/router';
import {canActivate,redirectUnauthorizedTo,redirectLoggedInTo } from "@angular/fire/auth-guard"

export const routes: Routes = [
    { path: '', redirectTo: 'bienvenida', pathMatch: 'full' },
    {
      path: "login",
      loadComponent: () => import("./componentes/login/login.component"),
    },
    {
      path: "home",
      loadComponent: () => import("./componentes/home/home.component"),
      ...canActivate(()=> redirectUnauthorizedTo(['/login'])),
    },
    {
      path: "error",
      loadComponent: () => import("./componentes/error/error.component"),
    },
    {
     path: "eleccionregistro",
     loadComponent: () => import("./componentes/registros/eleccionregistro/eleccionregistro.component")
    },
    {
     path: "estados-fav-button",
     loadComponent: () => import("./componentes/estados-fav-button/estados-fav-button.component").then(m => m.EstadosFavButtonComponent)
    },
    {
      path: 'homeAdmin',
      loadChildren: () => import('./componentes/usuarios/usuarios.routes')
    },
    {
      path: 'turnos',
      loadChildren: () => import('./componentes/turnos/turnos.routes')
    },
    {
      path: 'solicitarturno',
      loadComponent: () => import('./componentes/gestionturnos/gestionturnos.component') //solicitar turno
    },
    {
      path: 'miperfil',
      loadComponent: () => import('./componentes/miperfil/miperfil.component')
    },
    {
      path: 'usuariospacientes',
      loadComponent: () => import('./componentes/usuarios-pacientes/usuarios-pacientes.component')
    },
    {
      path: 'bienvenida',
      loadComponent: () => import('./componentes/pagina-bienvenida/pagina-bienvenida.component').then(m => m.PaginaBienvenidaComponent)
    },
    {
      path: "**", //¿estoy en cualquier ruta?
      redirectTo: 'error',
    }
];
