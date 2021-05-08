import { MessageService } from 'primeng/api';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagsComponent } from './components/flags/flags.component';
import { PhoneInputComponent } from './components/phone-input/phone-input.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SelectedCountryComponent } from './components/selected-country/selected-country.component';
import { TemplateCountryComponent } from './components/template-country/template-country.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    FlagsComponent,
    PhoneInputComponent,
    SelectedCountryComponent,
    TemplateCountryComponent,
  ],
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    RadioButtonModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    ButtonModule
  ],
  exports: [
    FlagsComponent,
    PhoneInputComponent,
    InputTextModule,
    ButtonModule,
    RadioButtonModule,
    FormsModule,
    TooltipModule,
    ToastModule
  ],
  providers: [
    MessageService
  ]
})
export class PhoneModule { }
