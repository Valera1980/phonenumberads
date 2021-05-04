import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IPhoneNumber } from '../phone/models/phone-model';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {
  form: FormGroup;
  constructor(
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      name: [''],
      email: [''],
      phone: this._fb.array([this.createPhone()])
      // phone: [{
      //   id: 1,
      //   clientId: 15,
      //   countryCode: '380',
      //   countryId: 0,
      //   countryRegion: 'UA',
      //   isNew: false,
      //   phoneNumber: 380664400345,
      //   phoneNumberShort: '664400345',
      //   profileId: 55565
      // } as IPhoneNumber, ]
    });

    this.form.valueChanges
    .subscribe(d => {
      console.log(d);
    })

  }
  createPhone(): FormGroup {
    return this._fb.group({
      id: 0,
      isNew: true,
      countryId: '804',
      countryCode: '380',
      countryRegion: 'UA',
      phoneNumberShort: '664400345',
      phoneNumber: 380664400345,
      profileId: 777,
      clientId: 15
    })
  }
  get phone(): FormControl {
    return this.form.get('phone') as FormControl; 
  }
}
