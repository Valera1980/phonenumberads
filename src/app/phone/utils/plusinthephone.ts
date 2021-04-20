import { FormGroup } from '@angular/forms';
export function isPlusPresent(s: string) {
    return s.startsWith('+');
}

export function checkIsOnlyNumberOrPlusInInput(n: string): boolean {
    return /^(?:[+\d].*\d|\d)$/.test(n);
}

export function replaceNotNumber(n: string): string {
    if (!n || n === '+') {
        return '+';
    }
    const str = n.replace(n.substring(n.length - 1), '');
    return str;
}