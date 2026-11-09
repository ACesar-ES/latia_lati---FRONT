import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-clinicalrecordcomponent',
  styleUrl: './clinicalrecordcomponent.css',
  templateUrl: './clinicalrecordcomponent.html',
})
export class Clinicalrecordcomponent {}
