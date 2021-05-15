import { FormGroup } from '@angular/forms';
import { TStrategiesPhone } from '@phone-module/models/strategies';
import { replaceNotNumberExceptFirstPlus } from '@phone-module/utils/plusinthephone';
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
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
    }
    getValidationerrorMsg(countryName?: string, countryNameNative?: string): string {
        return `номер не валиден для ${countryName} (${countryNameNative})`;
    }
    getPlaceHolder(): string {
        if(this.countryName.length > 20){
            return 'введите номер для ' + this.countryName.substring(0, 20) + '...';
        }
        return 'введите номер для ' + this.countryName;
    }
    getStrategy(): TStrategiesPhone {
        return this.strategy;
    }
    needPutPlusInTheStart(): boolean {
        return false;
    }
    validate(n: string): boolean {
        return isValidPhoneNumber(n, this.countryCode);
    }
    replaceNotAllowedSymbols(s: string): string {
        return replaceNotNumberExceptFirstPlus(s);
    }
    checkAllowedSymbols(s: string): boolean {
        const reg = new RegExp(/^[+-]?\d+$/);
        return reg.test(s);
    }
}