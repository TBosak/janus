import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const TL = (window as any).TL;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  timeline: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {}

  ngOnInit(): void {}

  applyJourney(journey: any): void {
    this.timeline.next(new TL.Timeline('timeline-embed', journey));
  }
}
