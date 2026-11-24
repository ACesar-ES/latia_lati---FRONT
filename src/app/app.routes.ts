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
import { Familyaddcomponent } from './components/familycomponent/familyaddcomponent/familyaddcomponent';
import { Profileswitchcomponent } from './components/profileswitchcomponent/profileswitchcomponent';
import { Schedulecomponent } from './components/schedulecomponent/schedulecomponent';
import { Evolutioncomponent } from './components/evolutioncomponent/evolutioncomponent';

import { Medicaldocumentscomponent } from './components/medicaldocumentscomponent/medicaldocumentscomponent';
import { Medicaldocumentslistcomponent } from './components/medicaldocumentscomponent/medicaldocumentslistcomponent/medicaldocumentslistcomponent';
import { Medicaldocumentsinsertcomponent } from './components/medicaldocumentscomponent/medicaldocumentsinsertcomponent/medicaldocumentsinsertcomponent';
import { Medicaldocumentsupdatecomponent } from './components/medicaldocumentscomponent/medicaldocumentsupdatecomponent/medicaldocumentsupdatecomponent';
import { Dashboardcomponent } from './components/dashboardcomponent/dashboardcomponent';

import { Familyshellcomponent } from './components/familycomponent/familyshellcomponent/familyshellcomponent';
import { Familylistcomponent } from './components/familycomponent/familylistcomponent/familylistcomponent';
import { Familyinsertcomponent } from './components/familycomponent/familyinsertcomponent/familyinsertcomponent';
import { Familyupdatecomponent } from './components/familycomponent/familyupdatecomponent/familyupdatecomponent';
import { Familyprofilecomponent } from './components/familycomponent/familyprofilecomponent/familyprofilecomponent';
import { Familygenerationcomponent } from './components/familycomponent/familygenerationcomponent/familygenerationcomponent';
import { Familybackgroundcomponent } from './components/familycomponent/familybackgroundcomponent/familybackgroundcomponent';
import { Familyhelpcomponent } from './components/familycomponent/familyhelpcomponent/familyhelpcomponent';
import { Emergencycontactcomponent } from './components/emergencycontactcomponent/emergencycontactcomponent';
import { Emergencycontactlistcomponent } from './components/emergencycontactcomponent/emergencycontactlistcomponent/emergencycontactlistcomponent';
import { Emergencycontactinsertcomponent } from './components/emergencycontactcomponent/emergencycontactinsertcomponent/emergencycontactinsertcomponent';
import { Emergencycontactupdatecomponent } from './components/emergencycontactcomponent/emergencycontactupdatecomponent/emergencycontactupdatecomponent';
import { Emergencycardcomponent } from './components/emergencycontactcomponent/emergencycardcomponent/emergencycardcomponent';
import { ReportCountClinicalRecordsByMedicalCondition } from './components/dashboardcomponent/report-count-clinical-records-by-medical-condition/report-count-clinical-records-by-medical-condition';
import { ReportCountEmergencyContactsByRelationship } from './components/dashboardcomponent/report-count-emergency-contacts-by-relationship/report-count-emergency-contacts-by-relationship';
import { ReportCountEmergencyContactsByProfile } from './components/dashboardcomponent/report-count-emergency-contacts-by-profile/report-count-emergency-contacts-by-profile';
import { ReportCountFamilyRelationshipsByType } from './components/dashboardcomponent/report-count-family-relationships-by-type/report-count-family-relationships-by-type';
import { ReportCountFamilyRelationshipsByProfile } from './components/dashboardcomponent/report-count-family-relationships-by-profile/report-count-family-relationships-by-profile';
import { authGuard } from './core/guards/auth-guard';
import { Medicalconditioncomponent } from './components/medicalconditioncomponent/medicalconditioncomponent';
import { Medicalconditionlistcomponent } from './components/medicalconditioncomponent/medicalconditionlistcomponent/medicalconditionlistcomponent';
import { Medicalconditioninsertcomponent } from './components/medicalconditioncomponent/medicalconditioninsertcomponent/medicalconditioninsertcomponent';
import { Medicalconditionupdatecomponent } from './components/medicalconditioncomponent/medicalconditionupdatecomponent/medicalconditionupdatecomponent';

export const routes: Routes = [
  // 1. Rutas públicas
  {
    path: '',
    component: Landingcomponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Logincomponent,
  },
  {
    path: 'registro',
    component: RegistroComponent,
  },
  {
    path: 'recuperar',
    component: RecuperarComponent,
  },

  // 2. Rutas protegidas (requieren sesión)
  {
    path: 'inicio',
    component: Homecomponent,
    canActivate: [authGuard],
  },
  {
    path: 'historial',
    component: Clinicalrecordcomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Clinicalrecordlistcomponent },
      { path: 'insertar', component: Clinicalrecordinsertcomponent },
      { path: 'actualizar/:id', component: Clinicalrecordupdatecomponent },
    ],
  },
  {
    path: 'condicionmedica',
    component: Medicalconditioncomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Medicalconditionlistcomponent },
      { path: 'insertar', component: Medicalconditioninsertcomponent },
      { path: 'actualizar/:id', component: Medicalconditionupdatecomponent },
    ],
  },
  {
    path: 'familia',
    component: Familycomponent,
    canActivate: [authGuard],
  },
  {
    path: 'familia/agregar',
    component: Familyaddcomponent,
    canActivate: [authGuard],
  },
  {
    path: 'familia',
    component: Familyshellcomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'listar', component: Familylistcomponent },
      { path: 'insertar', component: Familyinsertcomponent },
      { path: 'actualizar/:id', component: Familyupdatecomponent },
      { path: 'perfil/:id', component: Familyprofilecomponent },
      { path: 'generaciones', component: Familygenerationcomponent },
      { path: 'antecedentes', component: Familybackgroundcomponent },
      { path: 'ayuda', component: Familyhelpcomponent },
    ],
  },
  {
    path: 'cambiar-perfil',
    component: Profileswitchcomponent,
    canActivate: [authGuard],
  },
  {
    path: 'agenda',
    component: Schedulecomponent,
    canActivate: [authGuard],
  },
  {
    path: 'medicamentos',
    component: Medicationscomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Medicationslistcomponent },
      { path: 'insertar', component: Medicationsinsertcomponent },
      { path: 'actualizar/:id', component: Medicationsupdatecomponent },
    ],
  },
  {
    path: 'documentos',
    component: Medicaldocumentscomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Medicaldocumentslistcomponent },
      { path: 'insertar', component: Medicaldocumentsinsertcomponent },
      { path: 'actualizar/:id', component: Medicaldocumentsupdatecomponent },
    ],
  },
  {
    path: 'evolucion',
    component: Evolutioncomponent,
    canActivate: [authGuard],
  },
  {
    path: 'lati',
    component: Laticomponent,
    canActivate: [authGuard],
  },
  {
    path: 'reportes',
    component: Dashboardcomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'reporte01', pathMatch: 'full' },
      { path: 'reporte01', component: ReportCountClinicalRecordsByMedicalCondition },
      { path: 'contactos-parentesco', component: ReportCountEmergencyContactsByRelationship },
      { path: 'contactos-perfil', component: ReportCountEmergencyContactsByProfile },
      { path: 'familia-parentesco', component: ReportCountFamilyRelationshipsByType },
      { path: 'familia-perfil', component: ReportCountFamilyRelationshipsByProfile },
    ],
  },
  {
    path: 'ajustes',
    component: Settingscomponent,
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    component: Healthprofilecomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Healthprofilelistcomponent },
      { path: 'actualizar', component: Healthprofileupdatecomponent },
    ],
  },
  {
    path: 'contactos',
    component: Emergencycontactcomponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Emergencycontactlistcomponent },
      { path: 'insertar', component: Emergencycontactinsertcomponent },
      { path: 'actualizar/:id', component: Emergencycontactupdatecomponent },
      { path: 'fichas', component: Emergencycardcomponent },
    ],
  },
];
