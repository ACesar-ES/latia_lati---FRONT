import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-emergencycontactcomponent',
  styleUrl: './emergencycontactcomponent.css',
  templateUrl: './emergencycontactcomponent.html',
})
export class Emergencycontactcomponent {}
