import { ICountry } from './../../models/country';
import { map, pluck, takeUntil } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { Observable, Subject } from 'rxjs';
import { FlagsCountriesService } from '../../services/flags-countries/flags-countries.service';

@Component({
  selector: 'app-flags',
  templateUrl: './flags.component.html',
  styleUrls: ['./flags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagsComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  form: FormGroup;
  countries$: Observable<SelectItem[]>;
  countries = [];
  selectedCountry: ICountry = null;

  constructor(
    private _countryService: FlagsCountriesService,
    private _fb: FormBuilder
  ) { }


  ngOnInit(): void {
    this.form = this._fb.group({
      alpha2Code: ['']
    });
    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        pluck('alpha2Code')
      )
      .subscribe(alpha2Code => {
        this.selectedCountry = this.countries.find(c => c.alpha2Code === alpha2Code);
      });
    this.countries$ = this._countryService.queryCountries()
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
      );
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }
  get country(): AbstractControl {
    return this.form.get('country');
  }
}
