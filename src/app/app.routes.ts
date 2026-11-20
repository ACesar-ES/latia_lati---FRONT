import { Routes } from '@angular/router';
import { Clinicalrecordcomponent } from './components/clinicalrecordcomponent/clinicalrecordcomponent';
import { Clinicalrecordlistcomponent } from './components/clinicalrecordcomponent/clinicalrecordlistcomponent/clinicalrecordlistcomponent';
import { Clinicalrecordinsertcomponent } from './components/clinicalrecordcomponent/clinicalrecordinsertcomponent/clinicalrecordinsertcomponent';
import { Clinicalrecordupdatecomponent } from './components/clinicalrecordcomponent/clinicalrecordupdatecomponent/clinicalrecordupdatecomponent';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Landingcomponent } from './components/landingcomponent/landingcomponent';
import { RegistroComponent } from './components/registrocomponent/registrocomponent';
import { RecuperarComponent } from './components/recuperarcomponent/recuperarcomponent';
import { Healthprofilecomponent } from './components/healthprofilecomponent/healthprofilecomponent';
import { Healthprofileupdatecomponent } from './components/healthprofilecomponent/healthprofileupdatecomponent/healthprofileupdatecomponent';
import { Healthprofilelistcomponent } from './components/healthprofilecomponent/healthprofilelistcomponent/healthprofilelistcomponent';
import { Medicationscomponent } from './components/medicationscomponent/medicationscomponent';
import { Medicationslistcomponent } from './components/medicationscomponent/medicationslistcomponent/medicationslistcomponent';
import { Medicationsinsertcomponent } from './components/medicationscomponent/medicationsinsertcomponent/medicationsinsertcomponent';
import { Medicationsupdatecomponent } from './components/medicationscomponent/medicationsupdatecomponent/medicationsupdatecomponent';
import { Settingscomponent } from './components/settingscomponent/settingscomponent';
import { Laticomponent } from './components/laticomponent/laticomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Familycomponent } from './components/familycomponent/familycomponent';
import { Schedulecomponent } from './components/schedulecomponent/schedulecomponent';
import { Medicamentoscomponents } from './components/medicamentoscomponents/medicamentoscomponents';
import { Evolutioncomponent } from './components/evolutioncomponent/evolutioncomponent';
import { Medicaldocumentscomponent } from './components/medicaldocumentscomponent/medicaldocumentscomponent';
import { Medicaldocumentslistcomponent } from './components/medicaldocumentscomponent/medicaldocumentslistcomponent/medicaldocumentslistcomponent';
import { Medicaldocumentsinsertcomponent } from './components/medicaldocumentscomponent/medicaldocumentsinsertcomponent/medicaldocumentsinsertcomponent';
import { Medicaldocumentsupdatecomponent } from './components/medicaldocumentscomponent/medicaldocumentsupdatecomponent/medicaldocumentsupdatecomponent';


export const routes: Routes = [
  // 1. Landing: lo primero que se ve
  {
    path: '',
    component: Landingcomponent,
    pathMatch: 'full'
  },

  // 2. Login: al que lleva "Regístrate aquí"
  {
    path: 'login',
    component: Logincomponent
  },

  // 3. Registro: la ruta a la que apunta tu botón "Crear una cuenta" / routerLink="/registro"
  {
    path: 'registro',
    component: RegistroComponent
  },

  {
    path: 'recuperar',
    component: RecuperarComponent
  },

  {
    path: 'inicio',
    component: Homecomponent,
  },

  // 4. Historial clínico (con menú lateral), protegido por sesión
  {
    path: 'historial',
    component: Clinicalrecordcomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Clinicalrecordlistcomponent },
      { path: 'insertar', component: Clinicalrecordinsertcomponent },
      { path: 'actualizar/:id', component: Clinicalrecordupdatecomponent },
    ],
  },

  {
    path: "familia",
    component: Familycomponent,
  },

  {
    path: "agenda",
    component: Schedulecomponent,
  },

  {
    path: "medicamentos",
    component: Medicationscomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full'},
      { path: 'listar', component: Medicationslistcomponent },
      { path: 'insertar', component: Medicationsinsertcomponent },
      { path: 'actualizar/:id', component: Medicationsupdatecomponent },
    ],
  },

  {
    path: "documentos",
    component: Medicaldocumentscomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full'},
      { path: 'listar', component: Medicaldocumentslistcomponent },
      { path: 'insertar', component: Medicaldocumentsinsertcomponent },
      { path: 'actualizar/:id', component: Medicaldocumentsupdatecomponent },
    ],
  },

  {
    path: "evolucion",
    component: Evolutioncomponent,
  },

  {
    path: "lati",
    component: Laticomponent
  },

  {
    path: 'ajustes',
    component: Settingscomponent
  },

  {
    path: 'perfil',
    component: Healthprofilecomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Healthprofilelistcomponent },
      { path: 'actualizar', component: Healthprofileupdatecomponent },
    ],
  },

  // 5. Cualquier URL desconocida vuelve a la landing (SIEMPRE al final)
  {
    path: '**',
    redirectTo: '/historial'
  },
  // 5. Cualquier URL desconocida vuelve al inicio (SIEMPRE al final)

  {
    path: '**',
    redirectTo: '/inicio'
  },

];
