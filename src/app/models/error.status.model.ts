export interface IErrorStatus {
    readonly id?: number | string;
    readonly status: boolean;
    readonly message: string;
}
export type TErrorSeverity = 'success' | 'info' | 'warn' | 'error';