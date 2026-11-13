import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DatePicker } from './components/date-picker/date-picker';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Select } from './components/select/select';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DatePicker, Select, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('barangay-clearance');
  isDark = false;

  readonly purposes = [
    'Employment',
    'Scholarship',
    'Business Permit',
    'Travel',
    'Residency',
    'Others',
  ];

  readonly form = new FormGroup({
    fullName: new FormControl(''),
    birthdate: new FormControl<string | null>(null),
    address: new FormControl(''),
    contactNumber: new FormControl(''),
    purpose: new FormControl<string | null>(null),
    otherPurpose: new FormControl(''),
  });
}
