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
    // casching
    if (this.countries.length) {
      return of(this.countries);
    }
    return this._http.get(this.url)
      .pipe(
        map((countries: ICountry[]) => {
          const noNumber: ICountry = {
            flag: 'https://icons-for-free.com/iconfiles/png/512/loupe+magnifying+glass+search+icon-1320196420501324296.png',
            callingCodes: [null],
            alpha2Code: 'AUTODETECT',
            name: 'автовыбор страны',
            nativeName: '',
            numericCode: null
          };
          const internationalNumber: ICountry =  {
            flag: 'https://cdn3.iconfinder.com/data/icons/mobile-phone-7/500/mobile-phone-call_6-512.png',
            callingCodes: [null],
            alpha2Code: 'NO_COUNTRY',
            name: 'без страны',
            nativeName: '',
            numericCode: null
          };
          this.countries = [noNumber, internationalNumber, ...countries];
          return this.countries;
        })
      );
  }
}
