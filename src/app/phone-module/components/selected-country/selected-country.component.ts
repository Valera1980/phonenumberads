import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ICountry } from '@phone-module/models/country';
import { EnumPhoneStrategies } from '@phone-module/models/strategies';

@Component({
  selector: 'app-template-selected-country',
  templateUrl: './selected-country.component.html',
  styleUrls: ['./selected-country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedCountryComponent {

  @Input() country: ICountry;
  EnumPhoneStrategies = EnumPhoneStrategies;

  getTooltip(): string {
    if (this.country.alpha2Code === 'AUTODETECT') {
      return 'автовыбор страны';
    }
    if (this.country.alpha2Code === 'NO_COUNTRY') {
      return 'без страны';
    }
    return `${this.country.name} ( ${this.country.nativeName} )`;
  }
}
