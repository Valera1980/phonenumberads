import { FormGroup } from '@angular/forms';
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import { TStrategiesPhone } from '../models/strategies';
import { IPhoneDeals } from "./phone.works.interface";

export class PhoneSelectedCountryStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode;
    strategy: TStrategiesPhone = 'SELECTED_COUNTRY';
    constructor(form: FormGroup, countryCode: CountryCode = 'UA') {
        this.form = form;
        this.countryCode = countryCode;
    }
    getStrategy(): TStrategiesPhone {
        return this.strategy;
    }
    needPutPlusInTheStart(): boolean {
        return true;
    }
    validate(n: string): boolean {
        return isValidPhoneNumber(n, this.countryCode);
    }

}