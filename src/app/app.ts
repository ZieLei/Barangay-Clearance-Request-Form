import { Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { DatePicker } from './components/date-picker/date-picker';
import { Select } from './components/select/select';
import { phMobileValidator } from './validators/ph-mobile.validator';

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
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    birthdate: new FormControl<string | null>(null, [Validators.required]),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contactNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, phMobileValidator()],
    }),
    purpose: new FormControl<string | null>(null, [Validators.required]),
    // Disabled (and therefore excluded from validity) until "Others" is picked.
    otherPurpose: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
  });

  /** Live form values for the preview card. */
  readonly value = toSignal(this.form.valueChanges.pipe(startWith(null)), { initialValue: null });

  /** Form status from statusChanges: VALID | INVALID | PENDING | DISABLED. */
  readonly status = toSignal(this.form.statusChanges.pipe(startWith(this.form.status)), {
    initialValue: this.form.status,
  });

  readonly preview = computed(() => {
    this.value(); // re-evaluate on every change
    const v = this.form.getRawValue();
    return {
      fullName: v.fullName,
      birthdate: v.birthdate,
      address: v.address,
      contactNumber: v.contactNumber,
      purpose: v.purpose === 'Others' ? v.otherPurpose : v.purpose,
    };
  });

  readonly banner = computed(() => {
    switch (this.status()) {
      case 'VALID':
        return { tone: 'success', text: 'All set — the request is ready to submit.' };
      case 'PENDING':
        return { tone: 'warning', text: 'Checking…' };
      default:
        return { tone: 'danger', text: 'Please complete all required fields correctly.' };
    }
  });

  constructor() {
    const other = this.form.controls.otherPurpose;

    this.form.controls.purpose.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((purpose) => {
        if (purpose === 'Others') {
          other.setValidators([Validators.required]);
          other.enable();
        } else {
          other.clearValidators();
          other.reset('');
          other.disable();
        }
        other.updateValueAndValidity();
      });
  }

  /** True when a control was touched and has the given error. */
  hasError(name: keyof typeof this.form.controls, error: string): boolean {
    const c = this.form.controls[name];
    return c.touched && c.hasError(error);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    console.log('Submitted', this.preview());
  }
}
