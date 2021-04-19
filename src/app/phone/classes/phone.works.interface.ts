import { FormGroup } from '@angular/forms';
import { CountryCode } from "libphonenumber-js";

export interface IPhoneDeals {
    form: FormGroup;
    countryCode: CountryCode;
    validate(value: string): boolean;
    needPutPlusInTheStart(): boolean;
    // TODO remove after debug
    getStrategyName(): string;
    
}