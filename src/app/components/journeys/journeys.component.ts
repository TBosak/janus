import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-journeys',
  templateUrl: './journeys.component.html',
  styleUrls: ['./journeys.component.css'],
})
export class JourneysComponent implements OnInit {
  @Output() journeySelected: EventEmitter<any> = new EventEmitter();
  journeys: any[] = [];
  constructor(public http: HttpClient) {}

  ngOnInit() {
    this.loadAllTimelines();
  }

  loadAllTimelines(): void {
    this.http.get<any[]>('/api/timelines').subscribe({
      next: (timelines: any[]) => {
        console.log('Available timelines:', timelines);
        this.journeys = timelines;
      },
      error: (err) => {
        console.error('Error fetching timelines:', err);
      },
    });
  }

  applyLine(journey: any): void {
    this.journeySelected.emit(journey);
  }

  confirmDelete(timelineId: string, index: number, event: Event): void {
    event.stopPropagation();
    const confirmed = window.confirm(
      'Are you sure you want to delete this timeline?'
    );
    if (confirmed) {
      this.deleteTimeline(timelineId, index);
    }
  }

  deleteTimeline(timelineId: string, index: number): void {
    this.http.delete(`/api/timelines/${timelineId}`).subscribe({
      next: () => {
        this.journeys.splice(index, 1); // Remove from UI
        console.log('Timeline deleted:', timelineId);
      },
      error: (err) => console.error('Error deleting timeline:', err),
    });
  }
}
