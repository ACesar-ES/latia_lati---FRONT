import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { Menucomponent } from '../menucomponent/menucomponent';
import { Familystatecomponent } from './familystatecomponent';
import { Familycontextservice } from '../../services/familycontextservice';

@Component({
  selector: 'app-familycomponent',
  imports: [Menucomponent, RouterLink, NgTemplateOutlet, Familystatecomponent, MatTableModule],
  templateUrl: './familycomponent.html',
  styleUrl: './familycomponent.css',
})
export class Familycomponent implements OnInit {
  modo: 'arbol' | 'lista' = 'arbol';
  zoom: number = 100;
  ampliado: boolean = false;
  columns: string[] = ['person', 'action'];

  constructor(
    public fcS: Familycontextservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarFamilia();
  }

  cargarFamilia(forzar: boolean = false): void {
    this.fcS.cargar(forzar).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => {
        console.log('Ocurrió un error al cargar la familia', err);
        this.cdr.detectChanges();
      },
    });
  }

  recargar(): void {
    this.cargarFamilia(true);
  }

  private idRaiz(): number {
    return this.fcS.raiz()?.idHealthProfile ?? -1;
  }

  // Padres del perfil principal (arriba en el árbol)
  padres(): number[] {
    return this.fcS.cercanos(this.idRaiz(), 'arriba');
  }

  // Hijos del perfil principal (abajo en el árbol)
  hijos(): number[] {
    return this.fcS.cercanos(this.idRaiz(), 'abajo');
  }

  // Padres de un progenitor (abuelos)
  ancestros(id: number): number[] {
    return this.fcS.cercanos(id, 'arriba');
  }

  // Madre o Padre que todavía faltan agregar
  disponibles(): string[] {
    return ['Madre', 'Padre'].filter(
      (r) => !this.padres().some((id) => this.fcS.parentesco(id).toLowerCase() === r.toLowerCase()),
    );
  }

  cambiarZoom(cambio: number): void {
    this.zoom = Math.max(70, Math.min(140, this.zoom + cambio));
  }
}
