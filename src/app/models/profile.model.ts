import { IPhoneNumber } from '../phone-module/models/phone-model';
export interface IProfile{
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly phones: IPhoneNumber[];
}
