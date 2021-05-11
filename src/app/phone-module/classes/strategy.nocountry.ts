import { FormGroup } from '@angular/forms';
import { CountryCode } from 'libphonenumber-js';
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
        return s && s.length <= 15 && s.length >= 3;
    }
    replaceNotAllowedSymbols(s: string): string {
        return replaceNotNumber(s);
    }
}