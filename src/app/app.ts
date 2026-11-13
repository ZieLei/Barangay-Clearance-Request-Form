import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DatePicker } from './components/date-picker/date-picker';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DatePicker, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('barangay-clearance');
  isDark = false;
}
