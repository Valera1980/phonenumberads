import { Component, OnInit } from '@angular/core';
import { FlagsCountriesService } from './phone-module/services/flags-countries/flags-countries.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'phonenumberads'
  constructor(
    private _countryService: FlagsCountriesService
  ){}
  ngOnInit(): void {
    this._countryService.queryCountries().subscribe();
  }
}
