import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TStrategiesPhone } from '@phone-module/models/strategies';
import { buildErrorsForPhoneInputs } from '@phone-module/utils/build-errors.util';
import { replaceNotNumberExceptFirstPlus } from '@phone-module/utils/plusinthephone';
import { libphonenumberValidator } from '@phone-module/validators/libphonenumber-validator';
import { CountryCode } from 'libphonenumber-js';
import { IPhoneDeals } from './strategy-phones.interface';

export class PhoneSelectedCountryStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode;
    strategy: TStrategiesPhone = 'SELECTED_COUNTRY';
    countryName = '';
    constructor(form: FormGroup, countryCode: CountryCode = 'UA', countryName = '') {
        this.form = form;
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.__setValidators();
    }
    getValidationerrorMsg(countryName?: string, countryNameNative?: string): string {
        if (this.validate()) {
            return '';
        }
        const msg = buildErrorsForPhoneInputs(this.form.get('pnumber').errors);
        if (msg === 'countryError') {
            return 'phoneNumberIsWrongParams ' + ' (' +  countryName + ' '  + countryNameNative + ' )';
        }
        return buildErrorsForPhoneInputs(this.form.get('pnumber').errors);
    }
    getPlaceHolder(): string {
        return 'phoneNumber';
    }
    getStrategy(): TStrategiesPhone {
        return this.strategy;
    }
    needPutPlusInTheStart(): boolean {
        return false;
    }
    validate(): boolean {
        return this.form.get('pnumber').valid;
    }
    replaceNotAllowedSymbols(s: string): string {
        return replaceNotNumberExceptFirstPlus(s);
    }
    checkAllowedSymbols(s: string): boolean {
        const reg = new RegExp(/^[+-]?\d+$/);
        return reg.test(s);
    }
    __setValidators(): void {
        const phoneControl = this.form.get('pnumber');
        phoneControl.clearValidators();
        phoneControl.setValidators([
            // eslint-disable-next-line @typescript-eslint/unbound-method
            Validators.required,
            libphonenumberValidator(this.countryCode)]
        );
        phoneControl.updateValueAndValidity({ emitEvent: false });
    }
    __getPhoneControl(): FormControl {
        return this.form.get('pnumber') as FormControl;
    }
}
