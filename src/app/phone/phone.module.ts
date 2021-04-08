import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagsComponent } from './components/flags/flags.component';
import { PhoneInputComponent } from './components/phone-input/phone-input.component';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FlagsComponent,
    PhoneInputComponent
  ],
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule
  ],
  exports: [
    FlagsComponent,
    PhoneInputComponent
  ]
})
export class PhoneModule { }
