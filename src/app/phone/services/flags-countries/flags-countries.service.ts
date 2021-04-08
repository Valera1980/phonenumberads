import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ICountry } from '../../models/country';
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
        map((d: ICountry[]) => d)
      );
  }
}
