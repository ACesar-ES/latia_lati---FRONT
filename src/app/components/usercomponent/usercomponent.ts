import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-usercomponent',
  styleUrl: './usercomponent.css',
  templateUrl: './usercomponent.html',
})
export class Usercomponent {}
