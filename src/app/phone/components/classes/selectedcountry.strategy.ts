import { FormGroup } from '@angular/forms';
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import { IPhoneDeals } from "./phone.works.interface";

export class PhoneSelectedCountryStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode;
    constructor(form: FormGroup, countryCode: CountryCode = 'UA') {
        this.form = form;
        this.countryCode = countryCode;
    }
    getStrategyName(): string {
        return 'With country ' + this.countryCode;
    }
    needPutPlusInTheStart(): boolean {
        return false;
    }
    validate(n: string): boolean {
        return isValidPhoneNumber(n, this.countryCode);
    }

}