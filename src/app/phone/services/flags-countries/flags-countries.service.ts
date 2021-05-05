import { ICountry } from './../../models/country';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FlagsCountriesService {

  readonly url = 'https://restcountries.eu/rest/v2/all';
  countries: ICountry[] = [];
  private _countries$ = new BehaviorSubject<ICountry[]>([]);

  constructor(
    private _http: HttpClient
  ) { }

  // TODO разобраться с кешированием
  queryCountries(): Observable<ICountry[]> {
    // casching
    return this._countries$
      .pipe(
        mergeMap(c => {
          if (!!c.length) {
            return of(c);
          }
          console.log('----------------------------------');
          return this._http.get(this.url)
            .pipe(
              map((countries: any[]) => {
                // код Казахстана указан в либе неверно
                for (const currItem of countries) {
                  if (currItem.alpha2Code === 'KZ') {
                    currItem.callingCodes = ['7'];
                  }
                }
                return countries;
              }),
              map((countries: ICountry[]) => {
                const noNumber: ICountry = {
                  flag: 'https://icons-for-free.com/iconfiles/png/512/loupe+magnifying+glass+search+icon-1320196420501324296.png',
                  callingCodes: [null],
                  alpha2Code: 'AUTODETECT',
                  name: 'автовыбор страны',
                  nativeName: '',
                  numericCode: null
                };
                const internationalNumber: ICountry = {
                  flag: 'https://cdn3.iconfinder.com/data/icons/mobile-phone-7/500/mobile-phone-call_6-512.png',
                  callingCodes: [null],
                  alpha2Code: 'NO_COUNTRY',
                  name: 'без страны',
                  nativeName: '',
                  numericCode: null
                };
                
                const countriesWithDefaultValues = [noNumber, internationalNumber, ...countries];
                this._countries$.next(countriesWithDefaultValues);
                return countriesWithDefaultValues;
              })
            );
        })
      );
    // console.log(this.countries);
    // if (this.countries.length) {
    //   return of(this.countries);
    // }
    // return this._http.get(this.url)
    //   .pipe(
    //     map((countries: ICountry[]) => {
    //       const noNumber: ICountry = {
    //         flag: 'https://icons-for-free.com/iconfiles/png/512/loupe+magnifying+glass+search+icon-1320196420501324296.png',
    //         callingCodes: [null],
    //         alpha2Code: 'AUTODETECT',
    //         name: 'автовыбор страны',
    //         nativeName: '',
    //         numericCode: null
    //       };
    //       const internationalNumber: ICountry = {
    //         flag: 'https://cdn3.iconfinder.com/data/icons/mobile-phone-7/500/mobile-phone-call_6-512.png',
    //         callingCodes: [null],
    //         alpha2Code: 'NO_COUNTRY',
    //         name: 'без страны',
    //         nativeName: '',
    //         numericCode: null
    //       };
    //       const countriesWithDefaultValues = [noNumber, internationalNumber, ...countries];
    //       this._countries$.next(countriesWithDefaultValues);
    //       return countriesWithDefaultValues;
    //     })
    //  );
  }
  get countries$(): Observable<ICountry[]> {
    return this._countries$.asObservable();
  }
}
