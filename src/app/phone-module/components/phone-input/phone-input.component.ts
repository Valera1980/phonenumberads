import { IErrorStatus } from './../../../models/error.status.model';
import { AutodetectStrategy } from '../../classes/strategy.autodetect';
import { ICountry, OwnCountryCode } from '../../models/country';
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
import { FormGroup, FormBuilder, AbstractControl, NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import {
  parsePhoneNumberFromString,
  PhoneNumber,
  CountryCode
} from 'libphonenumber-js';
import { filter, map, pairwise, startWith, tap } from 'rxjs/operators';
import { PhoneNoCountryStrategy } from '../../classes/strategy.nocountry';
import { PhoneSelectedCountryStrategy } from '../../classes/strategy.selectedcountry';
import { isOnlyAllowedSymbols, isPlusPresent, replaceNotNumber } from '../../utils/plusinthephone';
import { MessageService } from 'primeng/api';
import { IPhoneNumber } from '../../models/phone-model';

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
  ],
})
export class PhoneInputComponent implements OnInit, ControlValueAccessor {

  @Input() setFocus = false;
  currentPhoneNumber: PhoneNumber;
  cursorPosition = 0;
  form: FormGroup;
  isNumberValid = false;
  phoneDealStrategy: PhoneNoCountryStrategy | PhoneSelectedCountryStrategy | AutodetectStrategy;
  regexpPlusDigits = new RegExp(/^[+-]?\d+$/);
  selectedCountryCallingCode = '';
  selectedCountryCode: OwnCountryCode = 'AUTODETECT';
  selectedCountryName = '';
  selectedCountryNativeName = '';
  selectedCountryNumericCode = null;
  isDisabled = false;
  currentData: IPhoneNumber;
  @ViewChild('phone_input', { static: true }) private _phoneInputControl: ElementRef;
  @Output() eventDelete = new EventEmitter();
  @Output() eventValidationStatus = new EventEmitter<IErrorStatus>();
  lastInput = '';
  constructor(
    private _fb: FormBuilder,
    // private _users: UserService,
    private _cd: ChangeDetectorRef,
    private _toast: MessageService
  ) { }

  onChange: any = () => { };
  onTouch: any = () => { };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(obj: IPhoneNumber): void {
    console.log(obj);
    this.currentData = obj;
    this.selectedCountryCode = obj.countryRegion as any;
    setTimeout(() => {
      this.form.patchValue({ pnumber: obj.phoneNumberShort, id: obj.id });
      this._cd.detectChanges();
    }, 50);
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled === true) {
      this.pnumber.disable();
    }
  }
  setValue(data: Partial<IPhoneNumber>): void {
    console.log(data);
    this.onChange({ ...this.currentData, ...data });
    this.onTouch({ ...this.currentData, ...data });
  }

  ngOnInit(): void {

    if (this.setFocus) {
      this._phoneInputControl.nativeElement.focus();
    }
    this.form = this._fb.group({
      id: [0],
      pnumber: ['']
    });
    this.phoneDealStrategy = new PhoneNoCountryStrategy(this.form);
    this.pnumber.valueChanges
      .pipe(
        filter((n: string) => !!n && n.length > 0 ),
        // этот блок  map(([prev, curr])
        // нужен для ораничения длины ввода в поле не больше 16
        // дело в том что поставить  maxLength в input нельзя, так как при копипасте
        // номера типа +375-(29)-538-10-80 -  последние номера срежуться
        // поэтому запоминается текущее , проверяется длина без символов в функции replaceNotNumber(curr).length
        // и когда длина достигает предела, то патчится всегда последнее, которое удовлетворяло длине - this.lastInput
        map((str) => {
          if(replaceNotNumber(str).length === 16){
            this.lastInput = str;
            return this.lastInput;
          }
          if (replaceNotNumber(str).length > 16 ){
            this.pnumber.patchValue(this.lastInput, {emitEvent: false});
            return this.lastInput;
          }
          this.pnumber.patchValue(str, { emitEvent: false });
          return str;
        }),
        filter(s => !!s),
        map((n: string) => {
          const cursorPosition = this.calculateCursorPosition(n);
          if (isOnlyAllowedSymbols(n, this.regexpPlusDigits)) {
            return n;
          }
          const replacedString = replaceNotNumber(n);
          this.form.patchValue({ pnumber: replacedString }, { emitEvent: false });
          this._phoneInputControl.nativeElement.setSelectionRange(cursorPosition, cursorPosition);
          return replacedString;

        }),
        tap((n: string) => {
          if (this.phoneDealStrategy.needPutPlusInTheStart()) {
            this.putPlusAtStartOFNumber(n);
          }
        }),
      )
      .subscribe((inputNumber: string) => {

        this.currentPhoneNumber = this.parsePhoneNumberFromStringWrapper(inputNumber, this.selectedCountryCode);

        if (this.selectedCountryCode !== 'NO_COUNTRY') {

          this.setValue({
            phoneNumber: Number(inputNumber),
            phoneNumberShort: inputNumber
          });

          if (this.currentPhoneNumber) {
            console.log('>>>>>>>>>', this.currentPhoneNumber);
            this.phoneDealStrategy = new PhoneSelectedCountryStrategy(
              this.form,
              this.currentPhoneNumber.country,
              this.selectedCountryName);
            this.isNumberValid = this.checkNumberIsValidAndEmit(this.currentPhoneNumber.number.toString());
            this.selectedCountryCode = this.currentPhoneNumber.country;
            this.selectedCountryCallingCode = this.currentPhoneNumber.countryCallingCode.toString();

            this.setValue({
              phoneNumber: Number(this.currentPhoneNumber.nationalNumber),
              phoneNumberShort: this.currentPhoneNumber.nationalNumber.toString(),
              countryCode: this.currentPhoneNumber.countryCallingCode.toString(),
              countryRegion: this.selectedCountryCode,
              countryId: this.selectedCountryNumericCode
            });

            if (this.isNumberValid) {
              const numberFormatted = this.currentPhoneNumber.format('NATIONAL', { nationalPrefix: false })
                .replace(/-/g, ' ')
                .replace('(', ' ')
                .replace(')', ' ');
              this.pnumber.patchValue(this.removeFirstZero(numberFormatted.trim(), this.selectedCountryCode),
                { emitEvent: false });
              // если поле вставили копипастом
              this.cursorPosition = this.getRawCursorPosition();


              this.setValue({
                phoneNumber: Number(this.currentPhoneNumber.nationalNumber),
                phoneNumberShort: this.currentPhoneNumber.nationalNumber.toString(),
                countryCode: this.currentPhoneNumber.countryCallingCode.toString(),
                countryRegion: this.selectedCountryCode,
                countryId: this.selectedCountryNumericCode
              });
              this._cd.markForCheck();

            }
          }
        } else {
          this.phoneDealStrategy = new PhoneNoCountryStrategy(this.form);
          this.isNumberValid = this.checkNumberIsValidAndEmit(inputNumber);

          this.setValue({ phoneNumber: Number(inputNumber) });
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
  parsePhoneNumberFromStringWrapper(inputNumber: string, selectedCountry: OwnCountryCode): PhoneNumber | undefined {
    const countryCode: CountryCode = selectedCountry === 'AUTODETECT' || selectedCountry === 'NO_COUNTRY'
      ? null
      : selectedCountry;
    return parsePhoneNumberFromString(inputNumber, countryCode);
  }
  /**
   *
   * @param 'string'
   * @param 'countryCode'
   * @returns 'string
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
    this.form.reset();
  }
  // TODO или закончить с файрсторе или удалить
  // eventQueryUsers(): void {
  //   this._queryUsers()
  //     .subscribe(u => {
  //       console.log(u);
  //     });
  // }
  /**
   *
   * @param data ICountry
   * @returns void
   * событие выбора из комбо стран
   */
  eventSelectCountry(data: ICountry): void {
    this.phoneDealStrategy = this.buildStrategy(data.alpha2Code);
    this.selectedCountryName = data.name;
    this.selectedCountryNativeName = data.nativeName;
    this.selectedCountryCallingCode = data.callingCodes[0];
    this.selectedCountryNumericCode = data.numericCode;
    if (this.selectedCountryCode === data.alpha2Code) {
      return;
    }
    this.selectedCountryCode = data.alpha2Code;
    this.form.reset();

    this.setValue({
      phoneNumber: null,
      countryCode: data.callingCodes[0],
      countryRegion: data.alpha2Code,
      countryId: Number(data.numericCode),
      phoneNumberShort: '',
    });
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
  copyNumber(e: MouseEvent): void {
    // console.log(e);
    document.addEventListener('copy', (ev: ClipboardEvent) => {
      ev.clipboardData.setData('text/plain', (this.currentPhoneNumber ?
        this.currentPhoneNumber.number :
        this.pnumber.value));
      ev.preventDefault();
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
  checkNumberIsValidAndEmit(n: string): boolean {
    const isValid = this.checkIsNubmerValid(n);
    this.eventValidationStatus.emit({
      id: this.currentData.id,
      status: isValid,
      message: isValid ? '' : this.getErorMessage()
    })
    return isValid;
  }
  isShowErrorNamberValidation(): boolean {
    // console.log('validation ', this.isNumberValid);
    // console.log('this.pnumber.touched ', this.pnumber.touched);
    return (this.pnumber.dirty && !this.isNumberValid) || !this.isNumberValid;
  }
  /**
   *
   * @returns string
   * возвращает ошибки валидации
   */
  getErorMessage(): string {
    return this.phoneDealStrategy.getValidationerrorMsg(this.selectedCountryName, this.selectedCountryNativeName);
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

  calculateCursorPosition(st: string): number {
    const s = st.trim();
    if (s.startsWith('+') && s.length === 1) {
      return 1;
    }
    // (cursor here)66 999 5655 || 66 999 5655(cursor here).
    // Если курсор в начале или в конце - то там его и оставляем
    if (this.cursorPosition === 0 || s.length === this.getRawCursorPosition()) {
      return this.getRawCursorPosition();
    }
    // так как строка может иметь вид 066 123 4(cursor here)567 и курсор может быть например
    // после четверки, то при нажатии на бекспейс -  строка форматируется методом
    // this.currentPhoneNumber.format и пробелы  ичезнут. Т.е мы должны пересчитать
    // позицию курсора без учета пробелов

    // вычисление кол-ва пробелов до курсора
    const stringBeforeCursor = s.substring(0, this.getRawCursorPosition());
    // console.log('stringBeforeCursor ', stringBeforeCursor);
    const spaces = stringBeforeCursor.match(/ /g) ?? [];
    // console.log('spaces ', spaces);

    // если строка уменьшается - то надо сместить курсор влево иначе -  вправо
    // текущая строка - надо взять что уже хранится в памяти - т.е отформатированный номер,
    // убрать с него пробелы и сравнить с тем что пришло
    const storedString = this.currentPhoneNumber?.nationalNumber ?? s;

    // строка ввод уменьшилась
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
