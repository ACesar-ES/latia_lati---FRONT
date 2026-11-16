import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-schedulecomponent',
  styleUrl: './schedulecomponent.css',
  templateUrl: './schedulecomponent.html',
})
export class Schedulecomponent {}
