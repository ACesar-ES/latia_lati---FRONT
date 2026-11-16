import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-homecomponent',
  styleUrl: './homecomponent.css',
  templateUrl: './homecomponent.html',
})
export class Homecomponent {}
