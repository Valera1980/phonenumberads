import { FormGroup } from "@angular/forms";
import { CountryCode } from "libphonenumber-js";
import { TStrategiesPhone } from "../models/strategies";
import { checkIsOnlyNumberOrPlusInInput } from "../utils/plusinthephone";
import { IPhoneDeals } from "./phone.works.interface";

export class AutodetectStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode = null;
    allowedLength = 16;
    strategy: TStrategiesPhone = 'AUTODETECT';
    constructor(form: FormGroup) {
        this.form = form;
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
        return checkIsOnlyNumberOrPlusInInput(s) && s.length === this.allowedLength
    }

}