import { MessageService } from 'primeng/api';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagsComponent } from './components/flags/flags.component';
import { PhoneInputComponent } from './components/phone-input/phone-input.component';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SelectedCountryComponent } from './components/selected-country/selected-country.component';
import { TemplateCountryComponent } from './components/template-country/template-country.component';


@NgModule({
  declarations: [
    FlagsComponent,
    PhoneInputComponent,
    SelectedCountryComponent,
    TemplateCountryComponent
  ],
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    RadioButtonModule,
    InputTextModule,
    TooltipModule,
    ToastModule
  ],
  exports: [
    FlagsComponent,
    PhoneInputComponent,
  ],
  providers: [
    MessageService
  ]
})
export class PhoneModule { }
