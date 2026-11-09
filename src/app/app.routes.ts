import { Routes } from '@angular/router';
import { Clinicalrecordcomponent } from './components/clinicalrecordcomponent/clinicalrecordcomponent';
import { Clinicalrecordlistcomponent } from './components/clinicalrecordcomponent/clinicalrecordlistcomponent/clinicalrecordlistcomponent';
import { Clinicalrecordinsertcomponent } from './components/clinicalrecordcomponent/clinicalrecordinsertcomponent/clinicalrecordinsertcomponent';
import { Clinicalrecordupdatecomponent } from './components/clinicalrecordcomponent/clinicalrecordupdatecomponent/clinicalrecordupdatecomponent';

export const routes: Routes = [
  {
    path: '',
    component: Clinicalrecordcomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full'
      },
      {
        path: 'listar',
        component: Clinicalrecordlistcomponent,
      },
      {
        path: 'insertar',
        component: Clinicalrecordinsertcomponent,
      },
      {
        path: 'actualizar/:id',
        component: Clinicalrecordupdatecomponent,
      },
    ],
  },
];
