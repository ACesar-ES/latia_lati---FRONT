import { Component } from '@angular/core';
import { MatSidenavModule } from  '@angular/material/sidenav' ;
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [MatSidenavModule, MatIconModule, MatListModule, RouterOutlet],
  selector: 'app-menucomponent',
  styleUrl: './menucomponent.css',
  templateUrl: './menucomponent.html',
})

export class Menucomponent {
}
