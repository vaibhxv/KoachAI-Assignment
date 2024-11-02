import { Component } from '@angular/core';

interface Event {
  start_time: number;
  end_time: number;
}

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css']
})
export class SchedulerComponent {
  start_time: number | null = null;
  end_time: number | null = null;
  events: Event[] = [];
  errorMessage = '';


  addEvent() {
    if (this.start_time !== null && this.end_time !== null) {
      if (this.start_time < this.end_time && this.start_time >= 0 && this.end_time <= 23) {
        const newEvent = { start_time: this.start_time, end_time: this.end_time };
        if (this.isEventOverlapping(newEvent)) {
          this.errorMessage = 'Event overlaps with an existing event.';
        } else {
          this.events.push(newEvent);
          this.errorMessage = '';
          this.start_time = null;
          this.end_time = null;
        }
      } else {
        this.errorMessage = 'Invalid time range. Ensure 0 <= start < end <= 23.';
      }
    }
  }

  
  isEventOverlapping(newEvent: Event): boolean {
    return this.events.some(
      event =>
        (newEvent.start_time < event.end_time && newEvent.end_time > event.start_time)
    );
  }

  
  formatTime(hour: number): string {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:00 ${suffix}`;
  }


  getEvents(): Event[] {
    return this.events;
  }
}
