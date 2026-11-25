import { ChangeDetectorRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DocumentPeriod } from '../../model/DocumentPeriod';
import { Familycontextservice } from '../../services/familycontextservice';
import { Medicaldocumentsservice } from '../../services/medicaldocumentsservice';
import { buildMonthlySeries, defaultDocumentPeriod, documentLink } from '../../utils/evolutionhelpers';
import { EvolutionPanelComponent } from './evolution-panel/evolution-panel';

describe('Evolución por perfil', () => {
  let id: number;
  let panel: EvolutionPanelComponent;
  let http: HttpTestingController;
  const cdr = { detectChanges() {}, markForCheck() {} } as ChangeDetectorRef;
  const endpoint = (suffix: string) => (r: { url: string }) => r.url.endsWith('/api/medicaldocuments/' + suffix);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    id = 4;
    const family = { fase: 'listo', cargar: () => of(undefined), idActivo: () => id,
      seleccionar: (next: number) => { id = next; return true; } } as unknown as Familycontextservice;
    panel = new EvolutionPanelComponent(family, TestBed.inject(Medicaldocumentsservice), cdr);
  });

  afterEach(() => { panel.ngOnDestroy(); http.verify(); });

  it('cancels both requests when switching profiles and sends identical filters', () => {
    panel.ngOnInit();
    const oldList = http.expectOne(endpoint('timeline'));
    const oldReport = http.expectOne(endpoint('report/monthly'));
    expect(oldList.request.params.get('profileId')).toBe('4');
    panel.period = new DocumentPeriod('2025-12-31', '2026-02-01', ' Receta ');
    panel.selectProfile(9);
    expect(oldList.cancelled && oldReport.cancelled).toBe(true);
    expect(panel.documents).toEqual([]);
    const list = http.expectOne(endpoint('timeline'));
    const report = http.expectOne(endpoint('report/monthly'));
    for (const req of [list, report]) {
      expect(req.request.params.get('profileId')).toBe('9');
      expect(req.request.params.get('startDate')).toBe('2025-12-31');
      expect(req.request.params.get('endDate')).toBe('2026-02-01');
      expect(req.request.params.get('documentType')).toBe('Receta');
      expect(req.request.params.has('userId')).toBe(false);
    }
    report.flush([{ year: 2025, month: 12, total: 1 }]);
    list.flush([{ idMedicalDocuments: 25, idHealthProfile: 9, documentDate: '2025-12-31' }]);
    expect(panel.documents.map((d) => d.idHealthProfile)).toEqual([9]);
    expect(panel.months[0].total).toBe(1);
  });

  it('the dashboard requests counts without downloading file links', () => {
    panel.showTimeline = false;
    panel.ngOnInit();
    http.expectNone(endpoint('timeline'));
    const report = http.expectOne(endpoint('report/monthly'));
    expect(report.request.params.has('documentType')).toBe(false);
    report.flush([]);
    expect(panel.loadingReport).toBe(false);
    expect(panel.reportError).toBe('');
  });

  it('keeps errors distinct from an empty timeline and permits retry', () => {
    panel.ngOnInit();
    http.expectOne(endpoint('report/monthly')).flush([]);
    http.expectOne(endpoint('timeline')).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(panel.timelineError).toBeTruthy();
    expect(panel.reportError).toBe('');
    panel.refresh();
    http.expectOne(endpoint('report/monthly')).flush([]);
    http.expectOne(endpoint('timeline')).flush([]);
    expect(panel.timelineError).toBe('');
    expect(panel.loadingTimeline).toBe(false);
  });
});

describe('Presentación de documentos', () => {
  it('fills missing months across New Year without mixing years', () => {
    const data = buildMonthlySeries(new DocumentPeriod('2025-12-31', '2026-02-01'), [
      { year: 2025, month: 12, total: 2 }, { year: 2026, month: 2, total: 1 },
    ]);
    expect(data.map((m) => m.total)).toEqual([2, 0, 1]);
    expect(new Set(data.map((m) => m.key)).size).toBe(3);
  });

  it('defaults to twelve calendar months including today', () => {
    const p = defaultDocumentPeriod(new Date(2026, 0, 1));
    expect([p.startDate, p.endDate]).toEqual(['2025-02-01', '2026-01-01']);
  });

  it('only opens external web documents with an available URL', () => {
    expect(documentLink('https://example.test/informe.pdf')).toBe('https://example.test/informe.pdf');
    expect(documentLink('data:text/plain,ejemplo')).toBeNull();
    expect(documentLink('https://example.com/latia/documentos-ficticios/expediente-1.pdf')).toBeNull();
    expect(documentLink('/incompleto')).toBeNull();
  });
});
