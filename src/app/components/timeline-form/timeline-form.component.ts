import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FileUploadService } from '../../services/file-upload.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-timeline-form',
  templateUrl: './timeline-form.component.html',
  styleUrls: ['./timeline-form.component.scss'],
})
export class TimelineFormComponent implements OnInit {
  timelineForm!: FormGroup;
  titleUrl: string = '';
  @Output() timelineCreated: EventEmitter<any> = new EventEmitter();
  constructor(
    public fb: FormBuilder,
    public fileUploadService: FileUploadService,
    public http: HttpClient
  ) {}

  ngOnInit(): void {
    this.timelineForm = this.fb.group({
      title: this.fb.group({
        media: this.fb.group({
          url: [''],
          caption: [''],
          credit: [''],
        }),
        text: this.fb.group({
          headline: ['', Validators.required],
          text: ['', Validators.required],
        }),
      }),
      events: this.fb.array([]),
    });

    // Add an initial event
    this.addEvent();
  }

  get events(): FormArray {
    return this.timelineForm.get('events') as FormArray;
  }

  addEvent(): void {
    const eventGroup = this.fb.group({
      date_range: this.fb.group({
        start_date: ['', Validators.required],
        end_date: [''],
      }),
      text: this.fb.group({
        headline: ['', Validators.required],
        text: [''],
      }),
      media: this.fb.group({
        url: [''],
        caption: [''],
        credit: [''],
      }),
    });

    this.events.push(eventGroup);
  }

  removeEvent(index: number): void {
    this.events.removeAt(index);
  }

  onFileUpload(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.fileUploadService.uploadFile(file).subscribe((response: any) => {
        const fileUrl = response.url; // Assume API responds with the file URL
        if (index !== -1) {
          // Update the media URL for the event at the specified index
          const eventMediaControl = this.events.at(index).get('media.url');
          if (eventMediaControl) {
            eventMediaControl.setValue(fileUrl);
          } else {
            console.error(
              `Media control for event at index ${index} not found.`
            );
          }
        } else {
          // Update the media URL for the title
          this.titleUrl = fileUrl;
          const titleMediaControl = this.timelineForm.get([
            'title',
            'media',
            'url',
          ]);
          if (titleMediaControl) {
            titleMediaControl.setValue(fileUrl);
          } else {
            console.error('Media control for title not found.');
          }
        }
      });
    }
  }

  submitTimeline(): void {
    const timelineData = this.timelineForm.value;

    // Transform the events to match the required JSON structure
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

    // Submit the formatted timeline
    this.http.post('/api/timelines', formattedTimeline).subscribe({
      next: (response: any) => {
        this.timelineCreated.emit({ id: response.id, ...formattedTimeline });
      },
      error: (err) => {
        console.error('Error saving timeline:', err);
      },
    });
  }

  formatDate(date: string): any {
    const parsedDate = new Date(date);
    return {
      year: parsedDate.getFullYear(),
      month: parsedDate.getMonth() + 1,
      day: parsedDate.getDate(),
    };
  }
}
