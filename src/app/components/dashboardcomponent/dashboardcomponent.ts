import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-dashboardcomponent',
  styleUrl: './dashboardcomponent.css',
  templateUrl: './dashboardcomponent.html',
})
export class Dashboardcomponent {}
