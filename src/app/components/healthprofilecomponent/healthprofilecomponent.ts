import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-healthprofilecomponent',
  styleUrl: './healthprofilecomponent.css',
  templateUrl: './healthprofilecomponent.html',
})
export class Healthprofilecomponent {}
