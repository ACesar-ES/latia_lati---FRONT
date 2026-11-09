import { Component } from '@angular/core';
import { MatSidenavModule } from  '@angular/material/sidenav' ;
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatSidenavModule, MatIconModule, MatListModule],
  selector: 'app-menucomponent',
  styleUrl: './menucomponent.css',
  templateUrl: './menucomponent.html',
})

export class Menucomponent {
}
