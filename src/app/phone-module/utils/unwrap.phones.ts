/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPhoneNumber } from '../models/phone-model';
export function unwrapPhones(phones: any[]): IPhoneNumber[] {
    if (Array.isArray(phones) && phones.length) {
        if (!!phones[0].phoneNumber) {
            return phones.map(p => p.phoneNumber);
        }
        return [];
    }
    return [];
}