import { AutodetectStrategy } from '../../classes/strategy.autodetect';
import { ICountry, OwnCountryCode } from './../../models/country';
import { ChangeDetectionStrategy, Component, OnInit, EventEmitter, ChangeDetectorRef, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import {
  parsePhoneNumberFromString,
  PhoneNumber,
  CountryCode,
  formatIncompletePhoneNumber,
  isPossiblePhoneNumber,
  parseNumber as parseNumberCustom,
  getNumberType,
  parse
} from 'libphonenumber-js';
import { filter, map, tap } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs';
import { PhoneNoCountryStrategy } from '../../classes/strategy.nocountry';
import { PhoneSelectedCountryStrategy } from '../../classes/strategy.selectedcountry';
import { isOnlyAllowedSymbols, isPlusPresent, replaceNotNumber } from '../../utils/plusinthephone';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhoneInputComponent implements OnInit {

  form: FormGroup;
  selectedCountryCode: OwnCountryCode = 'AUTODETECT';
  selectedCountryName = '';
  selectedCountryNativeName = '';
  selectedCountryCallingCode = '';
  isNumberValid = false;
  currentPhoneNumber: PhoneNumber;
  phoneDealStrategy: PhoneNoCountryStrategy | PhoneSelectedCountryStrategy | AutodetectStrategy;
  regexpPlusDigits = new RegExp(/^[+-]?\d+$/);
  cursorPosition = 0;
  @ViewChild('phone_input') private _phoneInputControl: ElementRef<HTMLInputElement>;
  constructor(
    private _fb: FormBuilder,
    private _users: UserService,
    private _cd: ChangeDetectorRef,
    private _toast: MessageService
  ) { }

  ngOnInit(): void {

    this.form = this._fb.group({
      pnumber: ['']
    });
    this.phoneDealStrategy = new PhoneNoCountryStrategy(this.form);
    this.pnumber.valueChanges
      .pipe(
        filter((n: string) => !!n && n.length > 0),
        map((n: string) => {
          // console.log(n);
          console.log(isOnlyAllowedSymbols(n, this.regexpPlusDigits));
          if (isOnlyAllowedSymbols(n, this.regexpPlusDigits)) {
            return n;
          }
          const replacedString = replaceNotNumber(n);
          const cursorPosition = this.calculateCursorPosition(n);
          console.log('calc cursor ', cursorPosition);
          this.form.patchValue({ pnumber: replacedString }, { emitEvent: false });
          this._phoneInputControl.nativeElement.setSelectionRange(cursorPosition, cursorPosition);
          return replacedString;
          // return n;

        }),
        tap((n: string) => {
          if (this.phoneDealStrategy.needPutPlusInTheStart()) {
            this.putPlusAtStartOFNumber(n);
          }
          // this.checkAndresetCountryCode(n);
        }),
      )
      .subscribe((inputNumber: string) => {

        console.log(inputNumber);
        // console.log(this.currentPhoneNumber);
        this.currentPhoneNumber = this.parsePhoneNumberFromStringWrapper(inputNumber, this.selectedCountryCode);

        if (this.selectedCountryCode !== 'NO_COUNTRY') {

          if (this.currentPhoneNumber) {
            console.log('>>>>>>>>>', this.currentPhoneNumber);
            this.phoneDealStrategy = new PhoneSelectedCountryStrategy(
              this.form,
              this.currentPhoneNumber.country,
              this.selectedCountryName);
            this.isNumberValid = this.checkIsNubmerValid(this.currentPhoneNumber.number.toString());
            this.selectedCountryCode = this.currentPhoneNumber.country;
            this.selectedCountryCallingCode = this.currentPhoneNumber.countryCallingCode.toString();
            if (this.isNumberValid) {
              const numberFormatted = this.currentPhoneNumber.format('NATIONAL', { nationalPrefix: false })
                .replace(/-/g, ' ')
                .replace('(', ' ')
                .replace(')', ' ')
              this.pnumber.patchValue(this.removeFirstZero(numberFormatted, this.selectedCountryCode),
                { emitEvent: false });
            }
          }
        } else {
          this.phoneDealStrategy = new PhoneNoCountryStrategy(this.form);
          this.isNumberValid = this.checkIsNubmerValid(inputNumber);
        }
      });

  }
  /**
   * 
   * @param inputNumber 
   * @param selectedCountry 
   * @returns 
   */
  parsePhoneNumberFromStringWrapper(inputNumber: string, selectedCountry: OwnCountryCode): PhoneNumber | undefined {
    const countryCode: CountryCode = selectedCountry === 'AUTODETECT' || selectedCountry === 'NO_COUNTRY'
      ? null
      : selectedCountry;
    return parsePhoneNumberFromString(inputNumber, countryCode);
  }
  /**
   * 
   * @param s 
   * @param countryCode 
   * @returns 
   * Этот метод убирает 0 в самом начале
   * функция "this.currentPhoneNumber.format('NATIONAL'" почему-то возвращает 0 впереди для Украины
   * хотя не должна. Получается например код 380 и номер 066 11 22 555. 
   */
  removeFirstZero(s: string, countryCode: CountryCode): string {
    if (countryCode === 'UA' && s.startsWith('0')) {
      return s.replace('0', '');
    }
    return s;
  }
  get pnumber(): AbstractControl {
    return this.form.get('pnumber');
  }
  private _queryUsers(): Observable<any> {
    return this._users.queryGet();
  }
  clearNumber(): void {
    this.form.reset();
  }
  // TODO или закончить с файрсторе или удалить
  eventQueryUsers(): void {
    this._queryUsers()
      .subscribe(u => {
        console.log(u);
      });
  }
  /**
   * 
   * @param data ICountry
   * @returns void
   * событие выбора из комбо стран
   */
  eventSelectCountry(data: ICountry): void {
    // console.log('countryCode ', data.alpha2Code);
    // console.log('this.selectedCountryCode', this.selectedCountryCode);
    // console.log('countryName', data.name);
    this.phoneDealStrategy = this.buildStrategy(data.alpha2Code);
    this.selectedCountryName = data.name;
    this.selectedCountryNativeName = data.nativeName;
    this.selectedCountryCallingCode = data.callingCodes[0];
    if (this.selectedCountryCode === data.alpha2Code) {
      return;
    }
    this.selectedCountryCode = data.alpha2Code;
    this.form.reset();
    // this.isNumberValid = this.checkIsNubmerValid(this.pnumber.value);
    // console.log(this.isNumberValid);
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
   * копирует номер в буфер обмена при нажатии на иконку "copy"
   */
  copyNumber(e: any): void {
    console.log(e);
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (this.currentPhoneNumber ?
        this.currentPhoneNumber.number :
        this.pnumber.value));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this._toast.add({ severity: 'info', summary: 'Скопировано' });
  }
  checkIsNubmerValid(n: string): boolean {
    // console.log(n);
    // console.log(this.phoneDealStrategy.getStrategy());
    const val = this.phoneDealStrategy.validate(n);
    // console.log(val);
    return val;
    // return this.phoneDealStrategy.validate(n);
  }
  isShowErrorNamberValidation(): boolean {
    // console.log('validation ', this.isNumberValid);
    // console.log('this.pnumber.touched ', this.pnumber.touched);
    return this.pnumber.dirty && !this.isNumberValid;
  }
  /**
   * 
   * @returns string
   * возвращает ошибки валидации
   */
  getErorMessage(): string {
     return this.phoneDealStrategy.getValidationerrorMsg(this.selectedCountryName,this.selectedCountryNativeName);
  }
  /**
   * 
   * @param countryCode код выбранной страны
   * @returns 
   * Возворащает стртегию работы с номером, в зависимости от комбо со странами
   * так как у нас есть условно три стратегии работы с номерами:
   * - в комбобоксе выбрано -  автоопределение
   * - в комбобоксе выбрано - без страны
   * - в комбобоксе выбрано - какая-то конкретная страна
   * то и различаются методы валидации, подтановки плюса в начало строки и т.д
   *
   */
  buildStrategy(countryCode: OwnCountryCode): PhoneNoCountryStrategy | PhoneSelectedCountryStrategy {
    if (countryCode === 'AUTODETECT') {
      return new AutodetectStrategy(this.form);
    } else if (countryCode === 'NO_COUNTRY') {
      return new PhoneNoCountryStrategy(this.form);
    } else {
      return new PhoneSelectedCountryStrategy(this.form, countryCode, this.selectedCountryName);
    }
  }
  /**
   * 
   * @returns placeholder
   * каждая стратегия имее свой плейсхолдер
   */
  buildPlaceHolderPhoneInput(): string {
    return this.phoneDealStrategy.getPlaceHolder();
  }
  /**
   * 
   * @param e event
   * вычисление позации курсора в контроле
   */
  onKeyUp(e): void {

    this.cursorPosition = e.target.selectionStart;
  }
  calculateCursorPosition(s: string): number {
    // так как строка может иметь вид 066 123 4567 и курсор может быть например
    // после четверки, то при нажатии на бекспейс -  строка форматируется методом
    // this.currentPhoneNumber.format и пробелы  ичезнут. Т.е мы должны пересчитать 
    // позицию курсора без учета пробелов
    const stringBeforeCursor = s.substring(0, this.cursorPosition);
    const spaces = stringBeforeCursor.match(/ /g);
    return this.cursorPosition - spaces.length;
  }
}
