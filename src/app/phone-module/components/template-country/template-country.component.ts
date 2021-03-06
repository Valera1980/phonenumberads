/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SelectItem } from 'primeng/api';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnumPhoneStrategies } from '@phone-module/models/strategies';

@Component({
  selector: 'app-template-country',
  templateUrl: './template-country.component.html',
  styleUrls: ['./template-country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCountryComponent {

  @Input() country: SelectItem;
  EnumPhoneStrategies = EnumPhoneStrategies;

 
  getLabel(country: SelectItem): string {
    if (country.value === 'AUTODETECT') {
      return 'автовыбор страны';
    }
    if (country.value === 'NO_COUNTRY') {
      return 'без страны';
    }
    return country.label;
  }
}
