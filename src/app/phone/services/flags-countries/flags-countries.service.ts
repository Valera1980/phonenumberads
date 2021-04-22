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
          const noNumber: ICountry = {
            flag: 'https://icons-for-free.com/iconfiles/png/512/loupe+magnifying+glass+search+icon-1320196420501324296.png',
            callingCodes: [null],
            alpha2Code: undefined,
            name: 'autodetect country...'
          };
          const internationalNumber: ICountry =  {
            flag: 'https://cdn3.iconfinder.com/data/icons/mobile-phone-7/500/mobile-phone-call_6-512.png',
            callingCodes: [null],
            alpha2Code: null,
            name: 'no country'
          };
          this.countries = [ noNumber,internationalNumber, ...d];
          return this.countries;
        })
      );
  }
}
