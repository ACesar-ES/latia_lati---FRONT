import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-evolutioncomponent',
  styleUrl: './evolutioncomponent.css',
  templateUrl: './evolutioncomponent.html',
})
export class Evolutioncomponent {}
