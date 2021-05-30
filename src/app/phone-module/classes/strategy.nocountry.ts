import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PHONE_MAX_LENGTH, PHONE_MIN_LENGTH } from '@phone-module/models/constants';
import { TStrategiesPhone } from '@phone-module/models/strategies';
import { buildErrorsForPhoneInputs } from '@phone-module/utils/build-errors.util';
import { replaceNotNumber } from '@phone-module/utils/plusinthephone';
import { CountryCode } from 'libphonenumber-js';
import { IPhoneDeals } from './strategy-phones.interface';

export class PhoneNoCountryStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode = null;
    strategy: TStrategiesPhone = 'NO_COUNTRY';
    constructor(form: FormGroup) {
        this.form = form;
        this.__setValidators();
    }
    getValidationerrorMsg(): string {
        if (this.validate()) {
            return '';
        }
        return buildErrorsForPhoneInputs(this.__getPhoneControl().errors);
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
        return this.__getPhoneControl().valid;
    }
    replaceNotAllowedSymbols(s: string): string {
        return replaceNotNumber(s);
    }
    checkAllowedSymbols(s: string): boolean {
        const reg = new RegExp(/^\d$/);
        return reg.test(s);
    }
    __setValidators(): void {
        const phoneControl = this.__getPhoneControl();
        phoneControl.clearValidators();
        phoneControl.setValidators([
            // eslint-disable-next-line @typescript-eslint/unbound-method
            Validators.required,
            Validators.minLength(PHONE_MIN_LENGTH),
            Validators.maxLength(PHONE_MAX_LENGTH)]
        );
        phoneControl.updateValueAndValidity({ emitEvent: false });
    }
    __getPhoneControl(): FormControl {
        return this.form.get('pnumber') as FormControl;
    }
}
