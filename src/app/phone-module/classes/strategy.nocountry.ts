import { FormGroup } from '@angular/forms';
import { CountryCode } from 'libphonenumber-js';
import { PHONE_MAX_LENGTH, PHONE_MIN_LENGTH } from 'src/app/models/constants';
import { TStrategiesPhone } from '../models/strategies';
import { replaceNotNumber } from '../utils/plusinthephone';
import { IPhoneDeals } from './strategy-phones.interface';

export class PhoneNoCountryStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode = null;
    strategy: TStrategiesPhone = 'NO_COUNTRY';
    constructor(form: FormGroup) {
        this.form = form;
    }
    getValidationerrorMsg(): string {
        return 'номер не валиден';
    }
    getPlaceHolder(): string {
        return 'введите любой номер';
    }
    getStrategy(): TStrategiesPhone {
        return this.strategy;
    }
    needPutPlusInTheStart(): boolean {
        return false;
    }
    validate(s: string): boolean {
        return s && s.length <= PHONE_MAX_LENGTH - 1 && s.length >= PHONE_MIN_LENGTH;
    }
    replaceNotAllowedSymbols(s: string): string {
        return replaceNotNumber(s);
    }
    checkAllowedSymbols(s: string): boolean {
        const reg = new RegExp(/^\d$/);
        return reg.test(s);
    }
}