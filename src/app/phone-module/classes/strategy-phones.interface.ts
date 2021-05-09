import { TStrategiesPhone } from '../models/strategies';
import { FormGroup } from '@angular/forms';
import { CountryCode } from 'libphonenumber-js';

export interface IPhoneDeals {
    strategy: TStrategiesPhone;
    form: FormGroup;
    countryCode: CountryCode;
    validate(value: string): boolean;
    needPutPlusInTheStart(): boolean;
    getStrategy(): TStrategiesPhone;
    getPlaceHolder(): string;
    getValidationerrorMsg(countryName?: string, countryNameNative?: string): string;
    
}