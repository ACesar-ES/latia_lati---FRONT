import { Component } from '@angular/core';
import { Menucomponent } from '../../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

// Contenedor (menú + router-outlet) de las pantallas del CRUD de relaciones familiares
@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-familyshellcomponent',
  templateUrl: './familyshellcomponent.html',
})
export class Familyshellcomponent {}
