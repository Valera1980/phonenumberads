import { AbstractControl, ValidatorFn } from '@angular/forms';
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';


export function libphonenumberValidator(countryCode: CountryCode): ValidatorFn {
    return (control: AbstractControl): { [key: string]: unknown | null } => {
        const valid = isValidPhoneNumber(control?.value ?? '', countryCode);
        return valid ? null : { 'libphonenumberError': true };
    };
}
