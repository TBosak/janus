import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { TimelineFormComponent } from './components/timeline-form/timeline-form.component';
import { TabsContainerComponent } from './components/tabs-container/tabs-container.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { FileUploadService } from './services/file-upload.service';
import { HttpClientModule } from '@angular/common/http';
import { JourneysComponent } from './components/journeys/journeys.component';
import { TimelineEditComponent } from './components/timeline-edit/timeline-edit.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    TimelineFormComponent,
    TabsContainerComponent,
    JourneysComponent,
    TimelineEditComponent,
  ],
  imports: [
    RouterOutlet,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    HttpClientModule,
  ],
  providers: [FileUploadService],
  bootstrap: [AppComponent],
})
export class AppModule {}
