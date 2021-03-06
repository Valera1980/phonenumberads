/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-empty-function */

import { IErrorStatus } from './../../../models/error.status.model';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Input,
  forwardRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormControl,
  Validators
} from '@angular/forms';
import {
  parsePhoneNumberFromString,
  PhoneNumber,
  CountryCode
} from 'libphonenumber-js';
import { filter, map, tap } from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { PhoneSelectedCountryStrategy } from '@phone-module/classes/strategy.selectedcountry';
import { PhoneNoCountryStrategy } from '@phone-module/classes/strategy.nocountry';
import { IPhoneNumber } from '@phone-module/models/phone-model';
import { PHONE_MAX_LENGTH } from '@phone-module/models/constants';
import { ICountry, OwnCountryCode } from '@phone-module/models/country';
import { isPlusPresent, replaceNotNumber } from '@phone-module/utils/plusinthephone';
import { AutodetectStrategy } from '@phone-module/classes/strategy.autodetect';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements OnInit, ControlValueAccessor {
  @Input() setFocus = false;
  private _showTextErrors = false;
  @Input() set showTextErrors(isShow: boolean) {
    this._showTextErrors = isShow;
    if (this.form) {
      this.pnumber.markAsDirty();
      this.checkNumberIsValidAndEmit();
    }
  }
  get showTextErrors(): boolean {
    return this._showTextErrors;
  }
  currentPhoneNumber: PhoneNumber;
  cursorPosition = 0;
  form: FormGroup;
  phoneDealStrategy:
    | PhoneNoCountryStrategy
    | PhoneSelectedCountryStrategy
    | AutodetectStrategy;
  // regexpPlusDigits = new RegExp(/^[+-]?\d+$/);
  selectedCountryCallingCode = '';
  selectedCountryCode: OwnCountryCode = 'AUTODETECT';
  selectedCountryName = '';
  selectedCountryNativeName = '';
  selectedCountryNumericCode: string = null;
  isDisabled = false;
  currentData: IPhoneNumber;
  @ViewChild('phone_input', { static: true })
  private _phoneInputControl: ElementRef<HTMLInputElement>;
  @Output() eventDelete = new EventEmitter();
  @Output() eventValidationStatus = new EventEmitter<IErrorStatus>();
  rawPhoneInput = '';

  lastInput = '';
  constructor(
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef,
    private _toast: MessageService
  ) { }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any = () => { };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTouch: any = () => { };

  registerOnChange(fn: Partial<IPhoneNumber>): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: Partial<IPhoneNumber>): void {
    this.onTouch = fn;
  }

  writeValue(obj: IPhoneNumber): void {
    console.log(obj);
    this.currentData = obj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.selectedCountryCode = obj.countryRegion as OwnCountryCode;
    setTimeout(() => {
      this.form.patchValue({ pnumber: obj.phoneNumberShort, id: obj.id });
      this._cd.detectChanges();
    }, 50);
    if (obj.isNew) {
      this.eventValidationStatus.emit({
        id: this.currentData.id,
        status: false,
        message: '?????????? ???? ??????????????'
      });
    }
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled === true) {
      this.pnumber.disable();
    }
  }
  setValue(data: Partial<IPhoneNumber>): void {
    console.log(data);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.onChange({ ...this.currentData, ...data });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.onTouch({ ...this.currentData, ...data });
  }

  ngOnInit(): void {
    if (this.setFocus) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this._phoneInputControl.nativeElement.focus();
    }
    this.form = this._fb.group({
      id: [0],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      pnumber: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(PHONE_MAX_LENGTH)]]
    });
    this.phoneDealStrategy = new PhoneNoCountryStrategy(this.form);
    this.pnumber.valueChanges
      .pipe(
        filter((n: string) => !!n && n.length > 0),
        // ???????? ????????  map(([prev, curr])
        // ?????????? ?????? ???????????????????? ?????????? ?????????? ?? ???????? ???? ???????????? 16
        // ???????? ?? ?????? ?????? ??????????????????  maxLength ?? input ????????????, ?????? ?????? ?????? ??????????????????
        // ???????????? ???????? +375-(29)-538-10-80 -  ?????????????????? ???????????? ????????????????
        // ?????????????? ???????????????????????? ?????????????? , ?????????????????????? ?????????? ?????? ???????????????? ?? ?????????????? replaceNotNumber(curr).length
        // ?? ?????????? ?????????? ?????????????????? ??????????????, ???? ???????????????? ???????????? ??????????????????, ?????????????? ?????????????????????????? ?????????? - this.lastInput
        map((str) => {
          if (replaceNotNumber(str).length === PHONE_MAX_LENGTH) {
            this.lastInput = str;
            return this.lastInput;
          }
          if (replaceNotNumber(str).length > PHONE_MAX_LENGTH) {
            this.pnumber.patchValue(this.lastInput, { emitEvent: false });
            return this.lastInput;
          }
          this.pnumber.patchValue(str, { emitEvent: false });
          return str;
        }),
        filter((s) => !!s),
        map((n: string) => {
          const cursorPosition = this.calculateCursorPosition(n);
          if (this.phoneDealStrategy.checkAllowedSymbols(n)) {
            return n;
          }
          const replacedString = this.phoneDealStrategy.replaceNotAllowedSymbols(n);
          this.form.patchValue(
            { pnumber: replacedString },
            { emitEvent: false }
          );
          this._phoneInputControl.nativeElement.setSelectionRange(
            cursorPosition,
            cursorPosition
          );
          return replacedString;
        }),
        tap((n: string) => {
          if (this.phoneDealStrategy.needPutPlusInTheStart()) {
            this.putPlusAtStartOFNumber(n);
          }
        })
      )
      .subscribe((inputNumber: string) => {
        this.rawPhoneInput = inputNumber;
        this.currentPhoneNumber = this.parsePhoneNumberFromStringWrapper(
          inputNumber,
          this.selectedCountryCode
        );
        if (this.selectedCountryCode !== 'NO_COUNTRY') {
          this.setValue({
            phoneNumber: inputNumber,
            phoneNumberShort: inputNumber
          });

          if (this.currentPhoneNumber && this.currentPhoneNumber.country) {
            this.phoneDealStrategy = new PhoneSelectedCountryStrategy(
              this.form,
              this.currentPhoneNumber.country,
              this.selectedCountryName
            );
            const isNumberValid = this.phoneDealStrategy.validate();
            this.checkNumberIsValidAndEmit();
            this.selectedCountryCode = this.currentPhoneNumber.country;
            this.selectedCountryCallingCode = this.currentPhoneNumber.countryCallingCode.toString();

            this.setValue({
              phoneNumber: this.currentPhoneNumber.nationalNumber.toString(),
              phoneNumberShort: this.currentPhoneNumber.nationalNumber.toString(),
              countryCode: this.currentPhoneNumber.countryCallingCode.toString(),
              countryRegion: this.selectedCountryCode,
              countryId: this.selectedCountryNumericCode
            });

            if (isNumberValid) {
              const numberFormatted = this.currentPhoneNumber
                .format('NATIONAL', { nationalPrefix: false })
                .replace(/-/g, ' ')
                .replace('(', ' ')
                .replace(')', ' ');
              this.pnumber.patchValue(
                this.removeExtraSymbols(
                  numberFormatted.trim(),
                  this.selectedCountryCode
                ),
                { emitEvent: false }
              );
              this.checkNumberIsValidAndEmit();

              // ???????? ???????? ???????????????? ????????????????????
              this.cursorPosition = this.getRawCursorPosition();

              this.setValue({
                phoneNumber: this.currentPhoneNumber.number.toString(),
                phoneNumberShort: this.currentPhoneNumber.nationalNumber.toString(),
                countryCode: this.currentPhoneNumber.countryCallingCode.toString(),
                countryRegion: this.selectedCountryCode,
                countryId: this.selectedCountryNumericCode
              });

              this._cd.markForCheck();
            } else {
              this.pnumber.patchValue(
                this.removeExtraSymbols(
                  this.currentPhoneNumber.nationalNumber.trim(),
                  this.selectedCountryCode
                ),
                { emitEvent: false }
              );
            }
          }
        } else {
          this.phoneDealStrategy = new PhoneNoCountryStrategy(this.form);
          this.checkNumberIsValidAndEmit();

          this.setValue({
            phoneNumber: inputNumber.toString(),
            phoneNumberShort: inputNumber,
            countryCode: null,
            countryId: null,
            countryRegion: null
          });
          this._cd.markForCheck();
        }
      });
  }
  /**
   *
   * @param 'inputNumber'
   * @param 'selectedCountry'
   * @returns 'PhoneNumber | undefined
   */
  parsePhoneNumberFromStringWrapper(
    inputNumber: string,
    selectedCountry: OwnCountryCode
  ): PhoneNumber | undefined {
    const countryCode: CountryCode =
      selectedCountry === 'AUTODETECT' || selectedCountry === 'NO_COUNTRY'
        ? null
        : selectedCountry;
    return parsePhoneNumberFromString(inputNumber, countryCode);
  }
  /**
   *
   * @param 'string'
   * @param 'countryCode'
   * @returns 'string
   * ???????? ?????????? ?????????????? 0 ?? ?????????? ????????????
   * ?????????????? "this.currentPhoneNumber.format('NATIONAL'" ????????????-???? ???????????????????? 0 ?????????????? ?????? ??????????????
   * ???????? ???? ????????????. ???????????????????? ???????????????? ?????? 380 ?? ?????????? 066 11 22 555.
   */
  removeExtraSymbols(s: string, countryCode: CountryCode): string {
    if (countryCode === 'UA' && s.startsWith('0')) {
      return s.replace('0', '');
    }
    if (countryCode === 'BY' && s.startsWith('8')) {
      return s.replace('8', '');
    }
    return s;
  }
  get pnumber(): FormControl {
    return this.form.get('pnumber') as FormControl;
  }
  get id(): FormControl {
    return this.form.get('id') as FormControl;
  }
  // private _queryUsers(): Observable<any> {
  //   return this._users.queryGet();
  // }
  clearNumber(): void {
    this.pnumber.reset();
    this.pnumber.markAsDirty();
    this.checkNumberIsValidAndEmit();
  }
  /**
   *
   * @param data ICountry
   * @returns void
   * ?????????????? ???????????? ???? ?????????? ??????????
   */
  eventSelectCountry(data: ICountry): void {
    this.phoneDealStrategy = this.buildStrategy(data.alpha2Code);
    this.selectedCountryName = data.name;
    this.selectedCountryNativeName = data.nativeName;
    this.selectedCountryCallingCode = data.callingCodes[0];
    this.selectedCountryNumericCode = data.numericCode;

    this.setValue({
      countryCode: data.callingCodes[0],
      countryRegion: data.alpha2Code,
      countryId: Number(data.numericCode),
      phoneNumber: data.alpha2Code === 'NO_COUNTRY' ? this.rawPhoneInput.toString() :this.currentPhoneNumber?.number.toString(),
      phoneNumberShort: data.alpha2Code === 'NO_COUNTRY' ? this.rawPhoneInput : this.currentPhoneNumber?.nationalNumber.toString()
    });

    if (this.selectedCountryCode === data.alpha2Code) {
      return;
    }
    this.selectedCountryCode = data.alpha2Code;
    // ?????????????? ???????????????? ???? ?????? ???????? ?? ???????? ?????? ???????????????????????? ?? "?????? ????????????" ???? "??????????????????"

    if (this.phoneDealStrategy.getStrategy() === 'AUTODETECT') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const numberWithPlus = `+${this.pnumber.value}`;
      this.pnumber.patchValue(numberWithPlus);
    } else {
      this.form.reset();
    }

    this.checkNumberIsValidAndEmit();
  }
  /**
   * We need check if the '+' is in very start of the string. If there isn't '+' then put it.
   */
  putPlusAtStartOFNumber(n: string): void {
    if (!isPlusPresent(n) && n.length > 0) {
      this.form.patchValue({ pnumber: '+' + n }, { emitEvent: false });
    }
  }
  /**
   *
   * @param e Event
   * ???????????????? ?????????? ?? ?????????? ???????????? ?????? ?????????????? ???? ???????????? "copy"
   */
  copyNumber(): void {
    // console.log(e);

    const copyToClipBoard = (ev: ClipboardEvent) => {
      ev.clipboardData.setData(
        'text/plain',
        this.currentPhoneNumber
          ? this.currentPhoneNumber.number
          : this.pnumber.value
      );
      ev.preventDefault();
    };

    document.addEventListener('copy', copyToClipBoard);
    document.execCommand('copy');
    document.removeEventListener('copy', copyToClipBoard );
    this._toast.add({ severity: 'info', summary: '??????????????????????' });
  }
  checkIsNubmerValid(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.phoneDealStrategy.validate();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  }
  checkNumberIsValidAndEmit(): boolean {
    const isValid = this.checkIsNubmerValid();
    this.eventValidationStatus.emit({
      id: this.currentData.id,
      status: isValid,
      message: isValid ? '' : this.getErorMessage()
    });
    return isValid;
  }
  isShowErrorNumberControlValidation(): boolean {
    return Object.keys(this.pnumber.errors ?? {}).length > 0;
  }
  isShowErrorNumberMsgValidation(): boolean {
    return this._showTextErrors && this.isShowErrorNumberControlValidation();
  }
  /**
   *
   * @returns string
   * ???????????????????? ???????????? ??????????????????
   */
  getErorMessage(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.phoneDealStrategy.getValidationerrorMsg(
      this.selectedCountryName,
      this.selectedCountryNativeName
    );
  }
  /**
   *
   * @param countryCode ?????? ?????????????????? ????????????
   * @returns
   * ?????????????????????? ???????????????? ???????????? ?? ??????????????, ?? ?????????????????????? ???? ?????????? ???? ????????????????
   * ?????? ?????? ?? ?????? ???????? ?????????????? ?????? ?????????????????? ???????????? ?? ????????????????:
   * - ?? ???????????????????? ?????????????? -  ??????????????????????????????
   * - ?? ???????????????????? ?????????????? - ?????? ????????????
   * - ?? ???????????????????? ?????????????? - ??????????-???? ???????????????????? ????????????
   * ???? ?? ?????????????????????? ???????????? ??????????????????, ???????????????????? ?????????? ?? ???????????? ???????????? ?? ??.??
   *
   */
  buildStrategy(
    countryCode: OwnCountryCode
  ): PhoneNoCountryStrategy | PhoneSelectedCountryStrategy {
    if (countryCode === 'AUTODETECT') {
      return new AutodetectStrategy(this.form);
    } else if (countryCode === 'NO_COUNTRY') {
      return new PhoneNoCountryStrategy(this.form);
    } else {
      return new PhoneSelectedCountryStrategy(
        this.form,
        countryCode,
        this.selectedCountryName
      );
    }
  }
  /**
   *
   * @returns placeholder
   * ???????????? ?????????????????? ???????? ???????? ??????????????????????
   */
  buildPlaceHolderPhoneInput(): string {
    return this.phoneDealStrategy.getPlaceHolder();
  }

  calculateCursorPosition(st: string): number {
    const s = st.trim();
    if (s.startsWith('+') && s.length === 1) {
      return 1;
    }
    // (cursor here)66 999 5655 || 66 999 5655(cursor here).
    // ???????? ???????????? ?? ???????????? ?????? ?? ?????????? - ???? ?????? ?????? ?? ??????????????????
    if (this.cursorPosition === 0 || s.length === this.getRawCursorPosition()) {
      return this.getRawCursorPosition();
    }
    // ?????? ?????? ???????????? ?????????? ?????????? ?????? 066 123 4(cursor here)567 ?? ???????????? ?????????? ???????? ????????????????
    // ?????????? ????????????????, ???? ?????? ?????????????? ???? ???????????????? -  ???????????? ?????????????????????????? ??????????????
    // this.currentPhoneNumber.format ?? ??????????????  ??????????????. ??.?? ???? ???????????? ??????????????????????
    // ?????????????? ?????????????? ?????? ?????????? ????????????????

    // ???????????????????? ??????-???? ???????????????? ???? ??????????????
    const stringBeforeCursor = s.substring(0, this.getRawCursorPosition());
    // console.log('stringBeforeCursor ', stringBeforeCursor);
    const spaces = stringBeforeCursor.match(/ /g) ?? [];
    // console.log('spaces ', spaces);

    // ???????? ???????????? ?????????????????????? - ???? ???????? ???????????????? ???????????? ?????????? ?????????? -  ????????????
    // ?????????????? ???????????? - ???????? ?????????? ?????? ?????? ???????????????? ?? ???????????? - ??.?? ?????????????????????????????????? ??????????,
    // ???????????? ?? ???????? ?????????????? ?? ???????????????? ?? ?????? ?????? ????????????
    const storedString = this.currentPhoneNumber?.nationalNumber ?? s;

    // ???????????? ???????? ??????????????????????
    if (storedString.length > s.length) {
      return this.getRawCursorPosition() - spaces.length - 1;
    }
    return this.getRawCursorPosition() - spaces.length;
  }
  getRawCursorPosition(): number {
    return this._phoneInputControl.nativeElement.selectionEnd;
  }
  remove(): void {
    this.eventDelete.emit(this.id.value);
  }
}
