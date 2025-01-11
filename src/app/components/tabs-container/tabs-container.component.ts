import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.css'],
})
export class TabsContainerComponent implements OnInit {
  @Output() selectedJourney: EventEmitter<any> = new EventEmitter();
  journey: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor() {
    this.selectedJourney.subscribe((journey) => {
      this.journey.next(journey);
    });
  }

  ngOnInit() {}
}
