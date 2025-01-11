import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-timeline-edit',
  templateUrl: './timeline-edit.component.html',
  styleUrls: ['./timeline-edit.component.scss'],
})
export class TimelineEditComponent implements OnChanges {
  @Input() timeline: any = null;
  timelineForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeline'] && this.timeline) {
      this.buildForm();
    }
  }

  buildForm(): void {
    if (!this.timeline) {
      return; // Prevent building the form if the timeline is null
    }

    this.timelineForm = this.fb.group({
      title: this.fb.group({
        media: this.fb.group({
          url: [this.timeline.title?.media?.url || ''],
          caption: [this.timeline.title?.media?.caption || ''],
          credit: [this.timeline.title?.media?.credit || ''],
        }),
        text: this.fb.group({
          headline: [
            this.timeline.title?.text?.headline || '',
            Validators.required,
          ],
          text: [this.timeline.title?.text?.text || '', Validators.required],
        }),
      }),
      events: this.fb.array(
        (this.timeline.events || []).map((event: any) =>
          this.createEventGroup(event)
        )
      ),
    });
  }

  createEventGroup(event: any): FormGroup {
    return this.fb.group({
      date_range: this.fb.group({
        start_date: [
          this.parseDate(event.start_date) || '',
          Validators.required,
        ],
        end_date: [this.parseDate(event.end_date) || ''],
      }),
      text: this.fb.group({
        headline: [event.text?.headline || '', Validators.required],
        text: [event.text?.text || ''],
      }),
      media: this.fb.group({
        url: [event.media?.url || ''],
        caption: [event.media?.caption || ''],
        credit: [event.media?.credit || ''],
      }),
    });
  }

  parseDate(date: any): string | null {
    if (!date) return null;
    const { year, month, day } = date;
    return new Date(year, month - 1, day).toISOString().split('T')[0];
  }

  formatDate(date: string): any {
    const parsedDate = new Date(date);
    return {
      year: parsedDate.getFullYear(),
      month: parsedDate.getMonth() + 1,
      day: parsedDate.getDate(),
    };
  }

  get events(): FormArray {
    return this.timelineForm?.get('events') as FormArray;
  }

  saveTimeline(): void {
    if (!this.timelineForm.valid) {
      alert('Please fill in all required fields.');
      return;
    }

    const timelineData = this.timelineForm.value;

    // Transform events to match the required JSON structure
    const formattedEvents = timelineData.events.map((event: any) => {
      const { start_date, end_date } = event.date_range;

      return {
        start_date: this.formatDate(start_date),
        end_date: end_date ? this.formatDate(end_date) : undefined,
        text: event.text,
        media: event.media,
      };
    });

    const formattedTimeline = {
      title: timelineData.title,
      events: formattedEvents,
    };

    this.http
      .put(`/api/timelines/${this.timeline.id}`, formattedTimeline)
      .subscribe({
        next: () => {
          alert('Timeline updated successfully');
        },
        error: (err) => {
          console.error('Error updating timeline:', err);
          alert('Failed to update timeline');
        },
      });
  }

  addEvent(eventData: any = null): void {
    const eventGroup = this.createEventGroup(eventData || {});
    this.events.push(eventGroup);
  }

  removeEvent(index: number): void {
    this.events.removeAt(index);
  }
}
