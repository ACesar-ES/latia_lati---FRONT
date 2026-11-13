import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Themeservice } from './services/themeservice';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Latia_lati');

  constructor(theme: Themeservice) {
    theme.inicializar();
  }
}
