import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../shared/global-service.service';

@Component({
  selector: 'app-visualiser',
  templateUrl: './visualiser.component.html',
  styleUrls: ['./visualiser.component.scss']
})
export class VisualiserComponent implements OnInit {
  frequencyData: Uint8Array;
  barCount: number = 256;
  barWidth: number = 100 / this.barCount;

  constructor(
    private globalService: GlobalService
  ) { }

  ngOnInit() {        
    this.globalService.songStarted$.subscribe(data => {
      if(data) {
        this.generateVisualiser();
      }
    });
  }

  generateVisualiser() {
    this.frequencyData = this.globalService.frequencyData;
  }
}
