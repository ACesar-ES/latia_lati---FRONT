import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Menucomponent } from '../menucomponent/menucomponent';
import { Familycontextservice } from '../../services/familycontextservice';
import { ChatMessageDTO } from '../../model/ChatDTO';
import { Chatservice } from '../../services/chatservice';

interface ConversationMessage extends ChatMessageDTO {
  id: number;
}

@Component({
  imports: [Menucomponent, RouterLink, MatIconModule],
  selector: 'app-laticomponent',
  styleUrl: './laticomponent.css',
  templateUrl: './laticomponent.html',
})
export class Laticomponent {
  mostrarInstrucciones = false;
  mostrarMas = false;
  private readonly conversaciones = new Map<string, ConversationMessage[]>();
  private readonly borradores = new Map<string, string>();
  private readonly errores = new Map<string, string>();
  private readonly conversacionesEnviando = new Set<string>();
  private siguienteIdMensaje = 0;

  constructor(
    public contextoFamiliar: Familycontextservice,
    private readonly chat: Chatservice,
    private readonly destroyRef: DestroyRef,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get idPerfilActivo(): number | null {
    return this.contextoFamiliar.idActivo();
  }

  get nombrePerfilActivo(): string {
    const id = this.idPerfilActivo;
    return id === null ? 'tu perfil' : this.contextoFamiliar.nombre(id);
  }

  get inicialesPerfilActivo(): string {
    const id = this.idPerfilActivo;
    return id === null ? 'LT' : this.contextoFamiliar.iniciales(id);
  }

  get parentescoPerfilActivo(): string {
    const id = this.idPerfilActivo;
    return id === null ? 'Perfil activo' : this.contextoFamiliar.parentesco(id);
  }

  get mensajes(): ConversationMessage[] {
    return this.conversaciones.get(this.claveConversacion) ?? [];
  }

  get mensaje(): string {
    return this.borradores.get(this.claveConversacion) ?? '';
  }

  set mensaje(value: string) {
    this.borradores.set(this.claveConversacion, value);
  }

  get enviando(): boolean {
    return this.conversacionesEnviando.has(this.claveConversacion);
  }

  get errorEnvio(): string {
    return this.errores.get(this.claveConversacion) ?? '';
  }

  get puedeEnviar(): boolean {
    return this.idPerfilActivo !== null && !!this.mensaje.trim() && !this.enviando;
  }

  actualizarMensaje(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.mensaje = value;
    this.errores.delete(this.claveConversacion);
  }

  enviarConTecla(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  enviarMensaje(): void {
    const profileId = this.idPerfilActivo;
    const clave = this.claveConversacion;
    const pregunta = (this.borradores.get(clave) ?? this.mensaje).trim();
    if (!pregunta || this.conversacionesEnviando.has(clave)) return;
    if (profileId === null) {
      this.errores.set(clave, 'Selecciona un perfil activo antes de consultar a Lati.');
      this.cdr.markForCheck();
      return;
    }

    const anteriores = this.conversaciones.get(clave) ?? [];
    const mensajeUsuario: ConversationMessage = {
      id: this.siguienteIdMensaje++,
      role: 'user',
      content: pregunta,
    };
    this.conversaciones.set(clave, [...anteriores, mensajeUsuario]);
    this.borradores.delete(clave);
    if (clave === this.claveConversacion) this.mensaje = '';
    this.errores.delete(clave);
    this.conversacionesEnviando.add(clave);

    this.chat
      .sendMessage({
        profileId,
        message: pregunta,
        history: anteriores.slice(-20).map(({ role, content }) => ({
          role,
          content: content.length > 2000 ? content.slice(-2000) : content,
        })),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ reply }) => {
          const actual = this.conversaciones.get(clave) ?? [];
          this.conversaciones.set(clave, [
            ...actual,
            { id: this.siguienteIdMensaje++, role: 'model', content: reply },
          ]);
          this.conversacionesEnviando.delete(clave);
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          const actual = this.conversaciones.get(clave) ?? [];
          this.conversaciones.set(
            clave,
            actual.filter((message) => message !== mensajeUsuario),
          );
          if (!this.borradores.get(clave)) this.borradores.set(clave, pregunta);
          if (clave === this.claveConversacion && !this.mensaje) this.mensaje = pregunta;
          this.errores.set(clave, this.mensajeDeError(error));
          this.conversacionesEnviando.delete(clave);
          this.cdr.markForCheck();
        },
      });
  }

  limpiarConversacion(): void {
    const clave = this.claveConversacion;
    if (this.conversacionesEnviando.has(clave)) return;
    this.conversaciones.delete(clave);
    this.errores.delete(clave);
    this.borradores.delete(clave);
    this.mostrarMas = false;
  }

  private get claveConversacion(): string {
    return String(this.idPerfilActivo ?? 'sin-perfil');
  }

  private mensajeDeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con Lati. Revisa tu conexión e inténtalo de nuevo.';
      }

      const detalle = error.error;
      if (
        detalle !== null &&
        typeof detalle === 'object' &&
        'message' in detalle &&
        typeof detalle.message === 'string' &&
        detalle.message.trim()
      ) {
        return detalle.message;
      }

      if (error.status === 401 || error.status === 403) {
        return 'Tu sesión no está autorizada para usar el chat. Inicia sesión de nuevo.';
      }
    }

    return 'No se pudo enviar el mensaje. Inténtalo de nuevo.';
  }
}
