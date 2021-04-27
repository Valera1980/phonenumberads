import { FormGroup } from '@angular/forms';
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import { TStrategiesPhone } from '../models/strategies';
import { IPhoneDeals } from "./strategy-phones.interface";

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

}