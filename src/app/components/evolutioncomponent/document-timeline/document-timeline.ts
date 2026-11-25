import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MedicaldocumentsDTO } from '../../../model/MedicaldocumentsDTO';
import { documentLink } from '../../../utils/evolutionhelpers';

@Component({
  selector: 'app-document-timeline',
  imports: [DatePipe, MatIconModule],
  templateUrl: './document-timeline.html',
  styleUrl: './document-timeline.css',
})
export class DocumentTimelineComponent implements OnChanges {
  @Input({ required: true }) documents: MedicaldocumentsDTO[] = [];
  groups: { month: string; items: { document: MedicaldocumentsDTO; link: string | null }[] }[] = [];

  ngOnChanges(): void {
    this.groups = [];
    // El servicio ya los ordena por fecha e ID, de más reciente a más antiguo.
    for (const document of this.documents) {
      const month = document.documentDate.slice(0, 7);
      let group = this.groups.at(-1);
      if (!group || group.month !== month) {
        group = { month, items: [] };
        this.groups.push(group);
      }
      group.items.push({ document, link: documentLink(document.fileURL) });
    }
  }
}
