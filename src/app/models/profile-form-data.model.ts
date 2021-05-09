import { IPhoneNumber } from './../phone-module/models/phone-model';
export interface IProfileForm {
  readonly name: string;
  readonly email: string;
  readonly phones: IPhoneNumber[];
}
