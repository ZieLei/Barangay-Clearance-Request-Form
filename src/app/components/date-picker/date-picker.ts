import {
  Component,
  ElementRef,
  HostListener,
  forwardRef,
  inject
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

type CalendarView = 'days' | 'months' | 'years';

interface CalendarDay {
  day: number;
  iso: string;
  date: Date;
  inCurrentMonth: boolean;
}

/* ---------- helpers ---------- */

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Accepts YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD and MM/DD/YYYY. Rejects impossible dates. */
function parseDate(text: string | null | undefined): Date | null {
  if (!text) return null;
  const t = text.trim();

  let y: number, m: number, d: number;
  let match = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);

  if (match) {
    [y, m, d] = [+match[1], +match[2], +match[3]];
  } else if ((match = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) {
    [m, d, y] = [+match[1], +match[2], +match[3]];
  } else {
    return null;
  }

  const date = new Date(y, m - 1, d);
  const valid =
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d;

  return valid ? date : null;
}

/* ---------- component ---------- */

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true
    }
  ]
})
export class DatePicker implements ControlValueAccessor {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(2000, i, 1))
  );
  readonly todayIso = toIso(new Date());
  readonly currentYear = new Date().getFullYear();

  view: CalendarView = 'days';
  isOpen = false;
  disabled = false;

  viewDate = startOfMonth(new Date());
  selectedDate: string | null = null;

  inputText = '';
  inputInvalid = false;

  calendarWeeks: CalendarDay[][] = [];
  yearRange: number[] = [];

  private onChange: (value: string | null) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    this.updateCalendar();
  }

  /* ---------- labels ---------- */

  get headerLabel(): string {
    const year = this.viewDate.getFullYear();

    if (this.view === 'months') return String(year);
    if (this.view === 'years') return `${this.yearRange[0]} – ${this.yearRange[this.yearRange.length - 1]}`;

    return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(this.viewDate);
  }

  get stepLabel(): string {
    return this.view === 'days' ? 'month' : this.view === 'months' ? 'year' : 'years';
  }

  /* ---------- open / close ---------- */

  open(): void {
    if (this.disabled) return;
    this.isOpen = true;
    this.view = 'days';
  }

  close(): void {
    this.isOpen = false;
    this.view = 'days';
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // composedPath is captured at dispatch time, so it still works
    // even if the clicked button was removed by a view switch.
    if (this.isOpen && !event.composedPath().includes(this.host.nativeElement)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  /* ---------- navigation ---------- */

  previous(): void {
    this.shift(-1);
  }

  next(): void {
    this.shift(1);
  }

  private shift(direction: 1 | -1): void {
    const y = this.viewDate.getFullYear();
    const m = this.viewDate.getMonth();

    if (this.view === 'days') this.viewDate = new Date(y, m + direction, 1);
    else if (this.view === 'months') this.viewDate = new Date(y + direction, m, 1);
    else this.viewDate = new Date(y + direction * 12, m, 1);

    this.updateCalendar();
  }

  zoomOut(): void {
    if (this.view === 'days') this.view = 'months';
    else if (this.view === 'months') this.view = 'years';
  }

  selectYear(year: number): void {
    this.viewDate = new Date(year, this.viewDate.getMonth(), 1);
    this.view = 'months';
    this.updateCalendar();
  }

  selectMonth(month: number): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), month, 1);
    this.view = 'days';
    this.updateCalendar();
  }

  /* ---------- calendar build ---------- */

  updateCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    // Start on the Sunday on/before the 1st, always render 6 weeks (42 cells)
    const firstWeekday = new Date(year, month, 1).getDay();
    const days: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(year, month, 1 - firstWeekday + i);
      days.push({
        day: date.getDate(),
        iso: toIso(date),
        date,
        inCurrentMonth: date.getMonth() === month
      });
    }

    this.calendarWeeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.calendarWeeks.push(days.slice(i, i + 7));
    }

    const pageStart = Math.floor(year / 12) * 12;
    this.yearRange = Array.from({ length: 12 }, (_, i) => pageStart + i);
  }

  /* ---------- selection ---------- */

  selectDay(day: CalendarDay): void {
    if (this.disabled) return;

    if (!day.inCurrentMonth) {
      this.viewDate = startOfMonth(day.date);
      this.updateCalendar();
    }

    this.setValue(day.iso);
    this.close();
  }

  clear(): void {
    this.setValue(null);
  }

  isSelectedMonth(month: number): boolean {
    const d = parseDate(this.selectedDate);
    return !!d && d.getFullYear() === this.viewDate.getFullYear() && d.getMonth() === month;
  }

  isSelectedYear(year: number): boolean {
    const d = parseDate(this.selectedDate);
    return !!d && d.getFullYear() === year;
  }

  private setValue(value: string | null): void {
    this.selectedDate = value;
    this.inputText = value ?? '';
    this.inputInvalid = false;
    this.onChange(value);
    this.onTouched();
  }

  /* ---------- typed input ---------- */

  onInput(text: string): void {
    this.inputText = text;
    this.inputInvalid = false;
  }

  commitInput(): void {
    const text = this.inputText.trim();

    if (!text) {
      if (this.selectedDate !== null) this.setValue(null);
      this.onTouched();
      return;
    }

    const parsed = parseDate(text);

    if (!parsed) {
      this.inputInvalid = true;
      this.onTouched();
      return;
    }

    const iso = toIso(parsed);
    this.viewDate = startOfMonth(parsed);
    this.updateCalendar();

    if (iso !== this.selectedDate) {
      this.setValue(iso);
    } else {
      this.inputText = iso; // normalise formatting, e.g. 11/3/2026 -> 2026-11-03
      this.onTouched();
    }
  }

  /* ---------- ControlValueAccessor ---------- */

  writeValue(value: string | null): void {
    const parsed = parseDate(value);

    this.selectedDate = parsed ? toIso(parsed) : null;
    this.inputText = this.selectedDate ?? '';
    this.inputInvalid = false;

    if (parsed) this.viewDate = startOfMonth(parsed);
    this.updateCalendar();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.close();
  }
}
