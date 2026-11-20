import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-medicaldocumentscomponent',
  styleUrl: './medicaldocumentscomponent.css',
  templateUrl: './medicaldocumentscomponent.html',
})
export class Medicaldocumentscomponent {}
