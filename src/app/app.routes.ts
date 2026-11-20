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
import { Dashboardcomponent } from './components/dashboardcomponent/dashboardcomponent';
import { ReportCountClinicalRecordsByMedicalCondition } from './components/dashboardcomponent/report-count-clinical-records-by-medical-condition/report-count-clinical-records-by-medical-condition';


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

  // Relaciones familiares (HU46-HU50, HU73)
  {
    path: "familia",
    component: Familycomponent,
  },

  {
    path: "agenda",
    component: Schedulecomponent,
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
    path: "reportes",
    component: Dashboardcomponent,
    children: [
      { path: '', redirectTo: 'reporte01', pathMatch: 'full' },
      { path: 'reporte01', component: ReportCountClinicalRecordsByMedicalCondition },
    ],
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

  // Familia: agregar un familiar al árbol (/familia ya muestra el árbol)
  {
    path: 'familia/agregar',
    component: Familyaddcomponent,
  },

  // Elegir el perfil de salud con el que se trabaja (historial, familia)
  {
    path: 'cambiar-perfil',
    component: Profileswitchcomponent,
  },

  // CRUD de relaciones familiares (HU46-HU50, HU73). /familia (sin más) es el árbol de Aixa;
  // estas pantallas van debajo, con su propio contenedor de menú.
  {
    path: 'familia',
    component: Familyshellcomponent,
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

  // Contactos de emergencia (HU11-HU15, HU68, HU69)
  {
    path: 'contactos',
    component: Emergencycontactcomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Emergencycontactlistcomponent },
      { path: 'insertar', component: Emergencycontactinsertcomponent },
      { path: 'actualizar/:id', component: Emergencycontactupdatecomponent },
      { path: 'fichas', component: Emergencycardcomponent },
    ],
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
