import { FormGroup } from '@angular/forms';
import { CountryCode } from 'libphonenumber-js';
import { PHONE_MAX_LENGTH } from 'src/app/models/constants';
import { TStrategiesPhone } from '../models/strategies';
import { checkIsOnlyNumberOrPlusInInput, replaceNotNumberExceptFirstPlus } from '../utils/plusinthephone';
import { IPhoneDeals } from './strategy-phones.interface';

export class AutodetectStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode = null;
    strategy: TStrategiesPhone = 'AUTODETECT';
    constructor(form: FormGroup) {
        this.form = form;
    }
    getValidationerrorMsg(): string {
        return 'номер не валиден';
    }
    getPlaceHolder(): string {
        return 'введите телефон с кодом';
    }
    getStrategy(): TStrategiesPhone {
        return this.strategy;
    }
    needPutPlusInTheStart(): boolean {
        return true;
    }
    validate(s: string): boolean {
        return checkIsOnlyNumberOrPlusInInput(s) && s.length === PHONE_MAX_LENGTH;
    }
    replaceNotAllowedSymbols(s: string): string {
        return replaceNotNumberExceptFirstPlus(s);
    }
    checkAllowedSymbols(s: string): boolean {
        const reg = new RegExp(/^[+-]?\d+$/);
        return reg.test(s);
    }
}