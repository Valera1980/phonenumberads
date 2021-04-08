export interface ICountry {
    readonly name: string;
    readonly topLevelDomain: string[];
    readonly alpha2Code: string;
    readonly alpha3Code: string;
    readonly callingCodes: string[];
    readonly capital: string;
    readonly altSpellings: string[];
    readonly region: string;
    readonly subregion: string;
    readonly population: number;
    readonly latlng: number[];
    readonly demonym: string;
    readonly area?: number;
    readonly gini?: number;
    readonly timezones: string[];
    readonly borders: string[];
    readonly nativeName: string;
    readonly numericCode: string;
    readonly flag: string;
    readonly cioc: string;
}
