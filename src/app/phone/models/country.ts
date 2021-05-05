import { CountryCode } from 'libphonenumber-js';
export type OwnCountryCode = CountryCode | 'NO_COUNTRY' | 'AUTODETECT';
export interface ICountry {
    readonly name: string;
    readonly nativeName: string;
    readonly alpha2Code: OwnCountryCode;
    callingCodes: string[];
    readonly flag: string;
    readonly numericCode: string;
}
