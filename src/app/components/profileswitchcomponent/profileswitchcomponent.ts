import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';
import { FamilyStateComponent } from '../familycomponent/familystatecomponent';
import { FamilyContextService } from '../../services/familycontextservice';

@Component({
  selector: 'app-profile-switch',
  imports: [Menucomponent, FamilyStateComponent, RouterLink],
  templateUrl: './profileswitchcomponent.html',
  styleUrl: './profileswitchcomponent.css',
})
export class ProfileSwitchComponent {
  readonly family = inject(FamilyContextService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  constructor() {
    this.family.load();
  }
  open(id: number): void {
    if (!this.family.select(id)) return;
    const history =
      this.route.snapshot.queryParamMap.get('volver') === 'historial' || !this.family.root();
    void this.router.navigateByUrl(history ? '/historial/listar' : '/familia');
  }
}
