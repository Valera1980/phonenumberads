import { FormGroup } from "@angular/forms";
import { CountryCode } from "libphonenumber-js";
import { checkIsOnlyNumberOrPlusInInput } from "../utils/plusinthephone";
import { IPhoneDeals } from "./phone.works.interface";

export class PhoneNoCountryStrategy implements IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode = null;
    allowedLength = 16;
    constructor(form: FormGroup) {
        this.form = form;
    }
    getStrategyName(): string {
        return 'No country';
    }
    needPutPlusInTheStart(): boolean {
        return true;
    }
    validate(s: string): boolean {
        return checkIsOnlyNumberOrPlusInInput(s) && s.length === this.allowedLength
    }

}