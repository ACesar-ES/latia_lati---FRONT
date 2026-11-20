import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-dashboardcomponent',
  styleUrl: './dashboardcomponent.css',
  templateUrl: './dashboardcomponent.html',
})
export class Dashboardcomponent {}
