import { ICountry } from './../../models/country';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FlagsCountriesService {

  readonly url = 'https://restcountries.eu/rest/v2/all';
  countries: ICountry[] = [];

  constructor(
    private _http: HttpClient
  ) { }

  queryCountries(): Observable<ICountry[]> {
    if (this.countries.length) {
      return of(this.countries);
    }
    return this._http.get(this.url)
      .pipe(
        map((d: ICountry[]) => {
          // https://cdn3.iconfinder.com/data/icons/mobile-phone-7/500/mobile-phone-call_6-512.png
          const internationalNumber: ICountry =  {
            flag: 'https://cdn3.iconfinder.com/data/icons/mobile-phone-7/500/mobile-phone-call_6-512.png',
            callingCodes: [null],
            alpha2Code: null,
            name: 'no country'
          };
          this.countries = [ internationalNumber, ...d];
          return this.countries;
        })
      );
  }
}
