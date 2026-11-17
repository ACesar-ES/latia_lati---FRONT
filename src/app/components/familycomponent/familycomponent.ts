import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { Menucomponent } from '../menucomponent/menucomponent';
import { FamilyStateComponent } from './familystatecomponent';
import { FamilyContextService } from '../../services/familycontextservice';
import { nearby } from '../../utils/family-tree';

@Component({
  selector: 'app-familycomponent',
  imports: [Menucomponent, RouterLink, NgTemplateOutlet, FamilyStateComponent, MatTableModule],
  templateUrl: './familycomponent.html',
  styleUrl: './familycomponent.css',
})
export class Familycomponent {
  readonly family = inject(FamilyContextService);
  readonly mode = signal<'tree' | 'list'>('tree');
  readonly zoom = signal(100);
  readonly expanded = signal(false);
  readonly columns = ['person', 'action'];
  readonly parents = computed(() =>
    nearby(this.family.links(), this.family.root()?.idHealthProfile ?? -1, 'up'),
  );
  readonly children = computed(() =>
    nearby(this.family.links(), this.family.root()?.idHealthProfile ?? -1, 'down'),
  );
  readonly available = computed(() =>
    ['Madre', 'Padre'].filter(
      (r) => !this.parents().some((id) => this.family.role(id).toLowerCase() === r.toLowerCase()),
    ),
  );
  constructor() {
    this.family.load();
  }
  ancestors(id: number): number[] {
    return nearby(this.family.links(), id, 'up');
  }
  connections(id: number): number {
    return new Set(
      this.family
        .links()
        .filter((e) => e.idOriginProfile === id || e.idRelativeProfile === id)
        .map((e) => (e.idOriginProfile === id ? e.idRelativeProfile : e.idOriginProfile)),
    ).size;
  }
  changeZoom(delta: number): void {
    this.zoom.update((n) => Math.max(70, Math.min(140, n + delta)));
  }
}
