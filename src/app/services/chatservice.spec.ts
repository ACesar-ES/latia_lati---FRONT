import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../environments/environment.development';
import { Chatservice } from './chatservice';

describe('Chatservice', () => {
  let service: Chatservice;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Chatservice);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the current message and prior turns to the backend chat endpoint', () => {
    const request = {
      profileId: 18,
      message: '¿Qué significa este resultado?',
      history: [{ role: 'user' as const, content: 'Tengo una duda.' }],
    };
    let reply = '';

    service.sendMessage(request).subscribe((response) => (reply = response.reply));

    const req = http.expectOne(`${environment.base}/api/chat`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ reply: 'Puedo ayudarte a entenderlo.' });

    expect(reply).toBe('Puedo ayudarte a entenderlo.');
  });
});
