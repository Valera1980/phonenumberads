import { CountryCode } from 'libphonenumber-js';
export interface ICountry {
    readonly name: string;
    readonly alpha2Code: CountryCode;
    readonly callingCodes: string[];
    readonly flag: string;
}
