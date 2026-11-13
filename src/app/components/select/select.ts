import {
  Component,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  input
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.html',
  styleUrl: './select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true
    }
  ]
})
export class Select implements ControlValueAccessor {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = input<string[]>([]);
  readonly placeholder = input('Select an option');

  value: string | null = null;
  isOpen = false;
  disabled = false;
  activeIndex = -1;

  private onChange: (value: string | null) => void = () => { };
  private onTouched: () => void = () => { };

  open(): void {
    if (this.disabled) return;
    this.isOpen = true;
    this.activeIndex = Math.max(0, this.options().indexOf(this.value ?? ''));
  }

  close(): void {
    if (this.isOpen) this.onTouched();
    this.isOpen = false;
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  choose(option: string): void {
    this.value = option;
    this.onChange(option);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !event.composedPath().includes(this.host.nativeElement)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.options().length;
    if (!count) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) this.open();
        else this.activeIndex = (this.activeIndex + 1) % count;
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) this.open();
        else this.activeIndex = (this.activeIndex - 1 + count) % count;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen && this.activeIndex >= 0) this.choose(this.options()[this.activeIndex]);
        else this.open();
        break;
    }
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.isOpen = false;
  }
}
