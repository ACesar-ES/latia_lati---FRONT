import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-laticomponent',
  styleUrl: './laticomponent.css',
  templateUrl: './laticomponent.html',
})
export class Laticomponent {}
