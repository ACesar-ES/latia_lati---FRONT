import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-familyhelpcomponent',
  styleUrls: ['../familypages.css', './familyhelpcomponent.css'],
  templateUrl: './familyhelpcomponent.html',
})
export class Familyhelpcomponent {
  guias = [
    {
      icono: 'account_tree',
      titulo: 'Tu árbol familiar',
      texto: 'Tú eres el centro. Agrega a tus padres arriba, a tus hijos debajo y amplía las generaciones cuando lo necesites.',
      ruta: '/familia/listar',
    },
    {
      icono: 'folder_shared',
      titulo: 'Tu primer documento',
      texto: 'Elige el perfil, sube una foto o un PDF y revisa la información antes de guardarla.',
      ruta: '/historial/insertar',
    },
    {
      icono: 'monitor_heart',
      titulo: 'Habla con Lati',
      texto: 'Abre una conversación por persona y prepara preguntas a partir de sus documentos.',
      ruta: '/lati',
    },
  ];
}
