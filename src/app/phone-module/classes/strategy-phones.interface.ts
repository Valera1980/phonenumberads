import { TStrategiesPhone } from '../models/strategies';
import { FormControl, FormGroup } from '@angular/forms';
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
    checkAllowedSymbols(s: string): boolean;
    replaceNotAllowedSymbols(s: string): string;
    __setValidators(): void;
    __getPhoneControl(): FormControl;
}