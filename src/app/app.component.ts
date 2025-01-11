import { Component, OnInit } from '@angular/core';

export const TL = (window as any).TL;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  timeline: any;

  constructor() {}

  ngOnInit(): void {}

  applyJourney(journey: any): void {
    this.timeline = new TL.Timeline('timeline-embed', journey);
  }
}
