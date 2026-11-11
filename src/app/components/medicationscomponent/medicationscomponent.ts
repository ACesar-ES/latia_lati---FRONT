import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-medicationscomponent',
  styleUrl: './medicationscomponent.css',
  templateUrl: './medicationscomponent.html',
})
export class Medicationscomponent {}
