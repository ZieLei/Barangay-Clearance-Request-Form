import { Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { DatePicker } from './components/date-picker/date-picker';
import { Select } from './components/select/select';
import { ConfirmModal } from './components/confirm-modal/confirm-modal';
import { phMobileValidator } from './validators/ph-mobile.validator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DatePicker, Select, ConfirmModal, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('barangay-clearance');
  private _isDark = false;

  get isDark(): boolean {
    return this._isDark;
  }

  set isDark(value: boolean) {
    this._isDark = value;
    document.documentElement.classList.toggle('dark', value);
    try {
      localStorage.setItem('theme', value ? 'dark' : 'light');
    } catch {}
  }

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

  readonly value = toSignal(this.form.valueChanges.pipe(startWith(null)), { initialValue: null });

  readonly status = toSignal(this.form.statusChanges.pipe(startWith(this.form.status)), {
    initialValue: this.form.status,
  });

  readonly banner = computed(() => {
    switch (this.status()) {
      case 'VALID':
        return { tone: 'success', icon: 'check', text: 'Review your request, then submit it.' };
      case 'PENDING':
        return { tone: 'warning', icon: 'clock', text: 'Hold on while we check your details.' };
      default:
        return { tone: 'danger', icon: 'warning-diamond', text: 'Fill in every field correctly to continue.' };
    }
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

  constructor() {
    this.isDark = this.initialTheme();

    const other = this.form.controls.otherPurpose;

    this.form.controls.purpose.valueChanges.pipe(takeUntilDestroyed()).subscribe((purpose) => {
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

  private initialTheme(): boolean {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  hasError(name: keyof typeof this.form.controls, error: string): boolean {
    const c = this.form.controls[name];
    return c.touched && c.hasError(error);
  }

  /** Whether the submit confirmation modal is showing. */
  readonly confirmOpen = signal(false);

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.confirmOpen.set(true);
  }

  confirmSubmit(): void {
    this.confirmOpen.set(false);
    console.log('Submitted', this.preview());
  }
}
