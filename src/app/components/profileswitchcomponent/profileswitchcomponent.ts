import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';
import { Familystatecomponent } from '../familycomponent/familystatecomponent';
import { Familycontextservice } from '../../services/familycontextservice';

@Component({
  selector: 'app-profileswitchcomponent',
  imports: [Menucomponent, Familystatecomponent, RouterLink],
  templateUrl: './profileswitchcomponent.html',
  styleUrl: './profileswitchcomponent.css',
})
export class Profileswitchcomponent implements OnInit {
  constructor(
    public fcS: Familycontextservice,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles(forzar: boolean = false): void {
    this.fcS.cargar(forzar).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => {
        console.log('Ocurrió un error al cargar los perfiles', err);
        this.cdr.detectChanges();
      },
    });
  }

  recargar(): void {
    this.cargarPerfiles(true);
  }

  // Elige el perfil y vuelve a Familia o al Historial
  abrir(id: number): void {
    if (!this.fcS.seleccionar(id)) return;
    const volver = this.route.snapshot.queryParamMap.get('volver');
    const destino =
      volver === 'lati'
        ? '/lati'
        : volver === 'historial' || !this.fcS.raiz()
          ? '/historial/listar'
          : '/familia';
    this.router.navigate([destino]);
  }
}
