export function isPlusPresent(s: string) {
    return s.startsWith('+');
}

export function checkIsOnlyNumberOrPlusInInput(n: string): boolean {
    return /^(?:[+\d].*\d|\d)$/.test(n);
}

export function isOnlyAllowedSymbols(s: string, r: RegExp): boolean {
   return r.test(s);
}

export function replaceNotNumber(n: string): string {
    if (!n || n === '+') {
        return '+';
    }
    const str = n.replace(n.substring(n.length), '');
    return n;
}