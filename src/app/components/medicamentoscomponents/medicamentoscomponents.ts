import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-medicamentoscomponents',
  styleUrl: './medicamentoscomponents.css',
  templateUrl: './medicamentoscomponents.html',
})
export class Medicamentoscomponents {}
