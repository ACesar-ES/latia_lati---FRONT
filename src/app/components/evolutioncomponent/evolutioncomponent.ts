import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { EvolutionPanelComponent } from './evolution-panel/evolution-panel';

@Component({
  selector: 'app-evolutioncomponent',
  imports: [Menucomponent, EvolutionPanelComponent],
  templateUrl: './evolutioncomponent.html',
  styleUrl: './evolutioncomponent.css',
})
export class Evolutioncomponent {}
