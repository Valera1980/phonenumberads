import { IPhoneNumber } from './../phone/models/phone-model';
export interface IProfile{
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly phones: IPhoneNumber[];
}
