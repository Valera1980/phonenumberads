import { ICountry } from './../../models/country';
import { map, pluck, takeUntil, filter } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { FlagsCountriesService } from '../../services/flags-countries/flags-countries.service';
import { Dropdown } from 'primeng/dropdown';

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
  isComboOpen = false;
  private _countryInput: any;
  private _countryCode$ = new BehaviorSubject(null);
  private _optionsIsReady$ = new BehaviorSubject(false);
  private _setFormDisable$ = new BehaviorSubject(false);
  @Input() set countryInput(c: any) {
    if (c) {
      this._countryInput = c;
      this._countryCode$.next(c);
    }
  }
  get countryInput(): any {
    return this._countryInput;
  }
  @Input() set isDisabled(isDisabled: boolean) {
    this._setFormDisable$.next(isDisabled);
  }
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
    this._setFormDisable$
    .subscribe(v => {
      if(v === true){
        this.form.disable()
      } else {
        this.form.enable();
      }
    })


    combineLatest([
      this._countryCode$,
      this._optionsIsReady$
    ])
      .pipe(
        takeUntil(this.destroy$),
        filter((code, opt) => !!opt)
      )
      .subscribe(([code, opt]) => {
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
        if (alpha2Code === null) {
          this.form.patchValue({ alpha2Code: 'AUTODETECT' }, { emitEvent: false });
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
              label: c.name + c.nativeName,
              icon: c.flag,
              callingCode: c.callingCodes[0],
              value: c.alpha2Code,
              nativeName: c.nativeName,
              numericCode: c.numericCode
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
  get alpha2Code(): FormControl {
    return this.form.get('alpha2Code') as FormControl;
  }
  resetFilter(e: MouseEvent, dd: Dropdown): void {
    dd.resetFilter();
    const findInput = dd.filterViewChild.nativeElement;
    if (findInput) {
      findInput.click();
      findInput.focus();
    }
    e.stopPropagation();
  }
  hideCombo(): void {
    this.isComboOpen = false;
  }
  showCombo(): void {
    this.isComboOpen = true;
  }
  isFindInputHasText(dd: Dropdown): boolean {
    return !!dd._filterValue?.length;
  }
}
