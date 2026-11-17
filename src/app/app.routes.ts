import { Routes } from '@angular/router';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Landingcomponent } from './components/landingcomponent/landingcomponent';
import { RegistroComponent } from './components/registrocomponent/registrocomponent';
import { RecuperarComponent } from './components/recuperarcomponent/recuperarcomponent';
import { Medicationscomponent } from './components/medicationscomponent/medicationscomponent';
import { Medicationslistcomponent } from './components/medicationscomponent/medicationslistcomponent/medicationslistcomponent';
import { Medicationsinsertcomponent } from './components/medicationscomponent/medicationsinsertcomponent/medicationsinsertcomponent';
import { Medicationsupdatecomponent } from './components/medicationscomponent/medicationsupdatecomponent/medicationsupdatecomponent';
import { Settingscomponent } from './components/settingscomponent/settingscomponent';
import { Laticomponent } from './components/laticomponent/laticomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Schedulecomponent } from './components/schedulecomponent/schedulecomponent';
import { Evolutioncomponent } from './components/evolutioncomponent/evolutioncomponent';

export const routes: Routes = [
  // 1. Landing: lo primero que se ve
  {
    path: '',
    component: Landingcomponent,
    pathMatch: 'full',
  },

  // 2. Login: al que lleva "Regístrate aquí"
  {
    path: 'login',
    component: Logincomponent,
  },

  // 3. Registro: la ruta a la que apunta tu botón "Crear una cuenta" / routerLink="/registro"
  {
    path: 'registro',
    component: RegistroComponent,
  },

  {
    path: 'recuperar',
    component: RecuperarComponent,
  },

  {
    path: 'inicio',
    component: Homecomponent,
  },

  // 4. Historial clínico (con menú lateral), protegido por sesión
  {
    path: 'historial',
    loadComponent: () =>
      import('./components/clinicalrecordcomponent/clinicalrecordcomponent').then(
        (m) => m.Clinicalrecordcomponent,
      ),
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'listar',
        loadComponent: () =>
          import('./components/clinicalrecordcomponent/clinicalrecordlistcomponent/clinicalrecordlistcomponent').then(
            (m) => m.Clinicalrecordlistcomponent,
          ),
      },
      {
        path: 'insertar',
        loadComponent: () =>
          import('./components/clinicalrecordcomponent/clinicalrecordinsertcomponent/clinicalrecordinsertcomponent').then(
            (m) => m.Clinicalrecordinsertcomponent,
          ),
      },
      {
        path: 'actualizar/:id',
        loadComponent: () =>
          import('./components/clinicalrecordcomponent/clinicalrecordupdatecomponent/clinicalrecordupdatecomponent').then(
            (m) => m.Clinicalrecordupdatecomponent,
          ),
      },
    ],
  },

  {
    path: 'familia/agregar',
    loadComponent: () =>
      import('./components/familycomponent/familyaddcomponent/familyaddcomponent').then(
        (m) => m.FamilyAddComponent,
      ),
  },
  {
    path: 'cambiar-perfil',
    loadComponent: () =>
      import('./components/profileswitchcomponent/profileswitchcomponent').then(
        (m) => m.ProfileSwitchComponent,
      ),
  },
  {
    path: 'familia',
    loadComponent: () =>
      import('./components/familycomponent/familycomponent').then((m) => m.Familycomponent),
  },

  {
    path: 'agenda',
    component: Schedulecomponent,
  },

  {
    path: 'evolucion',
    component: Evolutioncomponent,
  },

  {
    path: 'lati',
    component: Laticomponent,
  },

  {
    path: 'ajustes',
    component: Settingscomponent,
  },

  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/healthprofilecomponent/healthprofilecomponent').then(
        (m) => m.Healthprofilecomponent,
      ),
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'listar',
        loadComponent: () =>
          import('./components/healthprofilecomponent/healthprofilelistcomponent/healthprofilelistcomponent').then(
            (m) => m.Healthprofilelistcomponent,
          ),
      },
      {
        path: 'actualizar',
        loadComponent: () =>
          import('./components/healthprofilecomponent/healthprofileupdatecomponent/healthprofileupdatecomponent').then(
            (m) => m.Healthprofileupdatecomponent,
          ),
      },
    ],
  },

  {
    path: 'medicamentos',
    component: Medicationscomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Medicationslistcomponent },
      { path: 'insertar', component: Medicationsinsertcomponent },
      { path: 'actualizar/:id', component: Medicationsupdatecomponent },
    ],
  },

  // 5. Cualquier URL desconocida vuelve a la landing (SIEMPRE al final)
  {
    path: '**',
    redirectTo: '/historial',
  },
  // 5. Cualquier URL desconocida vuelve al inicio (SIEMPRE al final)

  {
    path: '**',
    redirectTo: '/inicio',
  },
];
