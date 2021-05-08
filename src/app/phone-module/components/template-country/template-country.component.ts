import { SelectItem } from 'primeng/api';
import { EnumPhoneStrategies } from '../../models/strategies';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-country',
  templateUrl: './template-country.component.html',
  styleUrls: ['./template-country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCountryComponent implements OnInit {

  @Input() country: SelectItem;
  EnumPhoneStrategies = EnumPhoneStrategies;
  constructor() { }

  ngOnInit(): void {
  }
  getLabel(country: any): string {
    if (country.value === 'AUTODETECT') {
      return 'автовыбор страны';
    }
    if (country.value === 'NO_COUNTRY') {
      return 'без страны';
    }
    return `${country.label} ( ${country.nativeName} )`;
  }
}
