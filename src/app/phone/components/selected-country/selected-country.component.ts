import { ICountry } from './../../models/country';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { EnumPhoneStrategies } from '../../models/strategies';

@Component({
  selector: 'app-template-selected-country',
  templateUrl: './selected-country.component.html',
  styleUrls: ['./selected-country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedCountryComponent implements OnInit {

  @Input() country: ICountry;
  EnumPhoneStrategies = EnumPhoneStrategies;
  constructor() { }

  ngOnInit(): void {
  }
  getTooltip(): string {
    if (this.country.alpha2Code === 'AUTODETECT') {
      return 'автовыбор страны';
    }
    if (this.country.alpha2Code === 'NO_COUNTRY') {
      return 'без страны';
    }
    return `${this.country.name}
    ( ${this.country.nativeName} )`;
  }

}
