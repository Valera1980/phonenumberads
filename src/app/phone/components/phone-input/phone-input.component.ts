import { ICountry } from './../../models/country';
import { PhoneSelectedCountryStrategy } from './../classes/selectedcountry.strategy';
import { PhoneNoCountryStrategy } from './../classes/nocountry.strategy';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { AsYouType, PhoneNumber } from 'libphonenumber-js/max';
// import getRegionCodeForNumber from 'libphonenumber-js/max';
import { parsePhoneNumberFromString, getPhoneCode, isValidPhoneNumber, CountryCode, formatNumber } from 'libphonenumber-js';
import { filter, map, tap } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs';
import { checkIsOnlyNumberOrPlusInInput, isPlusPresent, replaceNotNumber } from '../utils/plusinthephone';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhoneInputComponent implements OnInit {

  form: FormGroup;
  selectedCountryCode: CountryCode = null;
  selectedCountryName = '';
  isNumberValid = false;
  currentPhoneNumber: PhoneNumber;
  phoneDealStrategy: PhoneNoCountryStrategy | PhoneSelectedCountryStrategy;
  constructor(
    private _fb: FormBuilder,
    private _users: UserService
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      pnumber: ['']
    });
    this.phoneDealStrategy = new PhoneNoCountryStrategy(this.form);
    this.pnumber.valueChanges
      .pipe(
        // allow only numbers and '+'
        map((n: string) => {
          console.log(n);
          if (checkIsOnlyNumberOrPlusInInput(n)) {
            return n;
          }
          const replacedString = replaceNotNumber(n);
          this.form.patchValue({ pnumber: replacedString }, { emitEvent: false });
          return replacedString;

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
        this.currentPhoneNumber = parsePhoneNumberFromString(inputNumber, this.selectedCountryCode || 'UA');
        console.log(this.currentPhoneNumber);
        if (this.currentPhoneNumber) {
          console.log();
          this.selectedCountryCode = this.currentPhoneNumber.country || null;
          this.isNumberValid = this.checkIsNubmerValid(inputNumber);
        }
      });

  }
  get pnumber(): AbstractControl {
    return this.form.get('pnumber');
  }
  private _queryUsers(): Observable<any> {
    return this._users.queryGet();
  }
  eventQueryUsers(): void {
    this._queryUsers()
      .subscribe(u => {
        console.log(u);
      });
  }
  eventSelectCountry(data: ICountry): void {
    console.log('countryCode ', data.alpha2Code);
    console.log('this.selectedCountryCode', this.selectedCountryCode);
    this.phoneDealStrategy = this.buildStrategy(data.alpha2Code);
    if (this.selectedCountryCode === data.alpha2Code) {
      return;
    }
    this.selectedCountryCode = data.alpha2Code;
    this.selectedCountryName = data.name;
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
   * Method checks length of input number. If it is empty or has only '+' then we set 
   * selectedCountryCode to null. The child component <<app-flags> listens that and set country flag to default
   */
  // checkAndresetCountryCode(n: string): void {
  //   if (n.length === 1 || n.length === 0) {
  //     this.selectedCountryCode = null;
  //   }
  // }
  // checkPlusCountInTheInputNumber(n: string): number {
  //   return n.match(/\+/g)?.length || 0;
  // }
  copyNumber(e: any): void {
    console.log(e);
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (this.currentPhoneNumber ?
        this.currentPhoneNumber.number.toString().replace('+', '') :
        this.pnumber.value));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }
  checkIsNubmerValid(n: string): boolean {
    return this.phoneDealStrategy.validate(n);
  }
  isShowErrorNamberValidation(): boolean {
    return this.pnumber.dirty && !this.isNumberValid;
  }
  buildStrategy(countryCode: CountryCode): PhoneNoCountryStrategy | PhoneSelectedCountryStrategy {
    if (!countryCode) {
      return new PhoneNoCountryStrategy(this.form);
    }
    return new PhoneSelectedCountryStrategy(this.form, countryCode);
  }
}
