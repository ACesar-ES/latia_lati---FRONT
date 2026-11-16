import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-familycomponent',
  styleUrl: './familycomponent.css',
  templateUrl: './familycomponent.html',
})
export class Familycomponent {}
