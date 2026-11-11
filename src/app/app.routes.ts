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
    path: 'perfil',
    component: Healthprofilecomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Healthprofilelistcomponent },
      { path: 'actualizar/:id', component: Healthprofileupdatecomponent },
    ],
  },
 
  // 5. Cualquier URL desconocida vuelve a la landing (SIEMPRE al final)
  { 
    path: '**', 
    redirectTo: '/historial'
  },
];
