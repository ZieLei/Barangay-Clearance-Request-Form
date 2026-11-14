import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PH_MOBILE_PATTERN = /^09\d{9}$/;

export function phMobileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null; // leave to `required`
    return PH_MOBILE_PATTERN.test(String(value).trim()) ? null : { phMobile: true };
  };
}
