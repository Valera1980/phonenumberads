import { CountryCode } from 'libphonenumber-js';
import { ICountry, OwnCountryCode } from './../../models/country';
import { map, pluck, takeUntil, filter } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { FlagsCountriesService } from '../../services/flags-countries/flags-countries.service';
import { NullTemplateVisitor } from '@angular/compiler';

@Component({
  selector: 'app-flags',
  templateUrl: './flags.component.html',
  styleUrls: ['./flags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagsComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  form: FormGroup;
  optionsCountries: SelectItem[] = [];
  countries = [];
  selectedCountry: ICountry = null;
  private _countryInput: any;
  private _countryCode$ = new BehaviorSubject(NullTemplateVisitor);
  private _optionsIsReady$ = new BehaviorSubject(false);
  @Input() set countryInput(c: any) {
    // console.log(c);
    if(c){
      this._countryInput = c;
      this._countryCode$.next(c);
    }
  }
  get countryInput(): any {
    return this._countryInput;
  }
  // TODO add model to generic
  @Output() eventSelect = new EventEmitter<ICountry>();

  constructor(
    private _countryService: FlagsCountriesService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef
  ) { }


  ngOnInit(): void {


    this.form = this._fb.group({
      alpha2Code: []
    });

    combineLatest([
      this._countryCode$,
      this._optionsIsReady$
    ])
      .pipe(
        filter((code, opt) => !!opt)
      )
      .subscribe(([code]) => {
        console.log(code);
        this.form.patchValue({ alpha2Code: code });
        this._cd.markForCheck();
      })


    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        pluck('alpha2Code'),
      )
      .subscribe(alpha2Code => {
        // press button clear on combo
        if (alpha2Code === null) {
          this.form.patchValue({ alpha2Code: 'AUTODETECT' },{emitEvent: false});
          this.selectedCountry = this.countries.find(c => c.alpha2Code === 'AUTODETECT');
          this.eventSelect.emit(this.selectedCountry);
        } else {
          this.selectedCountry = this.countries.find(c => c.alpha2Code === alpha2Code);
          this.eventSelect.emit(this.selectedCountry);
        }

      });
    this._countryService.queryCountries()
      .pipe(
        map(countries => {
          this.countries = countries;
          return countries.map(c => (
            {
              label: c.name,
              icon: c.flag,
              callingCode: c.callingCodes[0],
              value: c.alpha2Code
            }
          ));

        })
      )
      .subscribe(optionsCountries => {
        this.optionsCountries = optionsCountries;
        this._optionsIsReady$.next(true);
      })
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }
  get country(): AbstractControl {
    return this.form.get('country');
  }
}
