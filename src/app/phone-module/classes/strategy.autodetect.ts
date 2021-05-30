import { FormGroup, Validators, FormControl } from '@angular/forms';
import { TStrategiesPhone } from '@phone-module/models/strategies';
import { replaceNotNumberExceptFirstPlus } from '@phone-module/utils/plusinthephone';
import { CountryCode } from 'libphonenumber-js';
import { IPhoneDeals } from './strategy-phones.interface';
import { buildErrorsForPhoneInputs } from '@phone-module/utils/build-errors.util';
import { libphonenumberValidator } from '@phone-module/validators/libphonenumber-validator';

export class AutodetectStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode = null;
    strategy: TStrategiesPhone = 'AUTODETECT';
    constructor(form: FormGroup) {
        this.form = form;
        this.__setValidators();

    }
    getValidationerrorMsg(): string {
        if (this.validate()) {
            return '';
        }
        const msg = buildErrorsForPhoneInputs(this.__getPhoneControl().errors);
        if (msg === 'countryError') {
            return 'phoneNumberIsWrongParams undefinedCountry';
        }
        return msg;
    }
    getPlaceHolder(): string {
        return 'phoneNumber';
    }
    getStrategy(): TStrategiesPhone {
        return this.strategy;
    }
    needPutPlusInTheStart(): boolean {
        return true;
    }
    validate(): boolean {
        return this.__getPhoneControl().valid;
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
