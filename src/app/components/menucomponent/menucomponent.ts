import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    RouterLink,
    RouterLinkActive],
  selector: 'app-menucomponent',
  styleUrl: './menucomponent.css',
  templateUrl: './menucomponent.html',
})

export class Menucomponent {
}
