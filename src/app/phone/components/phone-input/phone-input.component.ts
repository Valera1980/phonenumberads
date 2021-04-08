import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { AsYouType, PhoneNumber } from 'libphonenumber-js/max';
// import getRegionCodeForNumber from 'libphonenumber-js/max';
import parse, { getPhoneCode } from 'libphonenumber-js';
import { filter, map } from 'rxjs/operators';
import { parsePhoneNumberFromString } from 'libphonenumber-js';



@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss']
})
export class PhoneInputComponent implements OnInit {

  form: FormGroup;
  constructor(
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      pnumber: []
    });

    this.pnumber.valueChanges
      .pipe(
        filter(d => !!d),
        map(t => t.toString())
      )
      .subscribe(d => {
        console.log(d);
        const phoneNumber = parsePhoneNumberFromString(d, 'UA');

        console.log(phoneNumber);
      });

  }
  get pnumber(): AbstractControl {
    return this.form.get('pnumber');
  }
  private _parsingNumber(inputNumber: string): PhoneNumber | undefined {
    return parsePhoneNumberFromString(inputNumber);
  }
}
