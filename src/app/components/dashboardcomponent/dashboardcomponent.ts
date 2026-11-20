import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { Menucomponent } from '../menucomponent/menucomponent';
import { ReportCountClinicalRecordsByMedicalCondition } from './report-count-clinical-records-by-medical-condition/report-count-clinical-records-by-medical-condition';
import { ReportCountEmergencyContactsByRelationship } from './report-count-emergency-contacts-by-relationship/report-count-emergency-contacts-by-relationship';
import { ReportCountFamilyRelationshipsByProfile } from './report-count-family-relationships-by-profile/report-count-family-relationships-by-profile';
import { ReportCountFamilyRelationshipsByType } from './report-count-family-relationships-by-type/report-count-family-relationships-by-type';
import { CountclinicalrecordsbymedicalconditionDTO } from '../../model/CountclinicalrecordsbymedicalconditionDTO';
import { ReportCountEmergencyContactsByProfile } from './report-count-emergency-contacts-by-profile/report-count-emergency-contacts-by-profile';

@Component({
  selector: 'app-dashboardcomponent',
  imports: [
    RouterLink,
    Menucomponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatTabsModule,
    ReportCountClinicalRecordsByMedicalCondition,
    ReportCountEmergencyContactsByProfile,
    ReportCountEmergencyContactsByRelationship,
    ReportCountFamilyRelationshipsByProfile,
    ReportCountFamilyRelationshipsByType,
  ],
  templateUrl: './dashboardcomponent.html',
  styleUrl: './dashboardcomponent.css',
})
export class Dashboardcomponent {
  // Tarjetas de resumen: se llenan con lo que informa el reporte de historiales
  resumen = { total: 0, condiciones: 0, principal: '—' };

  // Los reportes viven dentro de pestañas: un reporte existe solo cuando su pestaña ya se abrió
  @ViewChild(ReportCountClinicalRecordsByMedicalCondition)
  reporteCondiciones?: ReportCountClinicalRecordsByMedicalCondition;

  @ViewChild(ReportCountEmergencyContactsByProfile)
  reporteContactosPerfil?: ReportCountEmergencyContactsByProfile;

  @ViewChild(ReportCountEmergencyContactsByRelationship)
  reporteContactosParentesco?: ReportCountEmergencyContactsByRelationship;

  @ViewChild(ReportCountFamilyRelationshipsByProfile)
  reporteFamiliaPerfil?: ReportCountFamilyRelationshipsByProfile;

  @ViewChild(ReportCountFamilyRelationshipsByType)
  reporteFamiliaTipo?: ReportCountFamilyRelationshipsByType;

  constructor(private cdr: ChangeDetectorRef) {}

  alCargarCondiciones(datos: CountclinicalrecordsbymedicalconditionDTO[]): void {
    this.resumen.total = datos.reduce((suma, d) => suma + d.totalRecords, 0);
    this.resumen.condiciones = datos.filter((d) => d.totalRecords > 0).length;
    this.resumen.principal =
      datos.length > 0
        ? datos.reduce((mayor, d) => (d.totalRecords > mayor.totalRecords ? d : mayor)).conditionName
        : '—';
    this.cdr.detectChanges();
  }

  // Vuelve a pedir los datos de todos los reportes que ya están abiertos
  actualizar(): void {
    this.reporteCondiciones?.obtenerTotal();
    this.reporteContactosPerfil?.obtenerReporte();
    this.reporteContactosParentesco?.obtenerReporte();
    this.reporteFamiliaPerfil?.obtenerReporte();
    this.reporteFamiliaTipo?.obtenerReporte();
  }
}