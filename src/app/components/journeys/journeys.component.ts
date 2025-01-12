import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-journeys',
  templateUrl: './journeys.component.html',
  styleUrls: ['./journeys.component.css'],
})
export class JourneysComponent implements OnInit {
  @Output() journeySelected: EventEmitter<any> = new EventEmitter();
  @Input() journeyUpdated: EventEmitter<any> = new EventEmitter();
  subscriptions: any[] = [];
  journeys: BehaviorSubject<any> = new BehaviorSubject([]);
  private dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  constructor(public http: HttpClient) {}

  ngOnInit() {
    this.loadAllTimelines();
    this.subscriptions.push(
      this.journeyUpdated.subscribe(async () => {
        this.loadAllTimelines();
      })
    );
  }

  loadAllTimelines(): void {
    firstValueFrom(this.http.get<any[]>('/api/timelines')).then(
      (timelines: any[]) => {
        const formattedTimelines = timelines.map((timeline) => ({
          ...timeline,
          events: timeline.events.map((event: any) => ({
            ...event,
            formattedDateRange: this.formatEventDateRange(
              event.start_date,
              event.end_date
            ),
          })),
        }));
        this.journeys.next(formattedTimelines);
      }
    );
  }

  formatEventDateRange(startDate: any, endDate?: any): string {
    if (!startDate) {
      return 'No date available';
    }

    const start = this.formatDateObject(startDate);
    const end = endDate ? this.formatDateObject(endDate) : null;

    return end ? `${start} - ${end}` : start;
  }

  private formatDateObject(date: any): string {
    if (!date.year || !date.month || !date.day) {
      return 'Invalid date';
    }

    const formattedDate = this.dateFormatter.format(
      new Date(date.year, date.month - 1, date.day)
    );
    return formattedDate;
  }

  applyLine(journey: any): void {
    this.journeySelected.emit(journey);
  }

  confirmDelete(timelineId: string, event: Event): void {
    event.stopPropagation();
    const confirmed = window.confirm(
      'Are you sure you want to delete this timeline?'
    );
    if (confirmed) {
      this.deleteTimeline(timelineId);
    }
  }

  deleteTimeline(timelineId: string): void {
    this.http.delete(`/api/timelines/${timelineId}`).subscribe({
      next: () => {
        // Filter out the deleted timeline by its ID
        const updatedJourneys = this.journeys
          .getValue()
          .filter((timeline: any) => timeline.id !== timelineId);
        this.journeys.next(updatedJourneys); // Emit the updated array
        console.log('Timeline deleted:', timelineId);
      },
      error: (err) => console.error('Error deleting timeline:', err),
    });
  }
}
