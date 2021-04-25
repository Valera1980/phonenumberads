import { FormGroup } from "@angular/forms";
import { CountryCode } from "libphonenumber-js";
import { TStrategiesPhone } from "../models/strategies";
import { checkIsOnlyNumberOrPlusInInput } from "../utils/plusinthephone";
import { IPhoneDeals } from "./phone.works.interface";

export class PhoneNoCountryStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode = null;
    strategy: TStrategiesPhone = 'NO_COUNTRY';
    constructor(form: FormGroup) {
        this.form = form;
    }
    getPlaceHolder(): string {
        return 'input any numbers'
    }
    getStrategy(): TStrategiesPhone {
        return this.strategy;
    }
      needPutPlusInTheStart(): boolean {
        return false;
    }
    validate(s: string): boolean {
        return s && s.length < 15 && s.length >= 3;
    }

}