import { ValidationErrors } from '@angular/forms';
export function buildErrorsForPhoneInputs(errors: ValidationErrors): string {
    if (!errors) {
        return '';
    }
    const [firstKey] = Object.keys(errors);
    if (firstKey === 'libphonenumberError') {
        return 'countryError';
    }
    if (firstKey === 'required') {
        return 'cannotBeBlank';
    }
    if (firstKey === 'minlength') {
        return 'itIsTooShort';
    }
    if (firstKey === 'maxlength') {
        return 'itIsTooLong';
    }
    if (firstKey === 'dublicate') {
        return 'duplicateCheckingError';
    }
    return 'validationError';
}
