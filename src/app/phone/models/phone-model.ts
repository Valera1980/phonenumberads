export interface IPhoneNumber {
    readonly id: number | string;
    readonly isNew: boolean;
    readonly isMain: boolean;
    readonly countryId: number;
    readonly countryCode: string;
    readonly countryRegion: string;
    readonly phoneNumberShort: string;
    readonly phoneNumber: number;
    readonly profileId: number | string;
    readonly clientId: number | string;
}
