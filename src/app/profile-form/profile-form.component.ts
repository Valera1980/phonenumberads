import { IProfile } from './../models/profile.model';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IPhoneNumber } from '../phone/models/phone-model';
import { UserService } from '../phone/services/user/user.service';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent implements OnInit {
  form: FormGroup;
  profile: IProfile;
  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      name: [''],
      email: [''],
      phones: this._fb.array([])
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
      });
    this._userService.queryGetMock()
      .subscribe(prof => {
        // add user's phones to formArray
        this.profile = prof;
        this.addPhonesControls(prof);
        this._cd.markForCheck();
      });

  }
  createPhoneFormGroup(phone: IPhoneNumber): FormGroup {
    return this._fb.group({
      phoneNumber: {
        id: phone.id,
        isNew: phone.isNew,
        countryId: phone.countryId,
        countryCode: phone.countryCode,
        countryRegion: phone.countryRegion,
        phoneNumberShort: phone.phoneNumberShort,
        phoneNumber: phone.phoneNumber,
        profileId: phone.profileId,
        clientId: phone.clientId
      } as IPhoneNumber
    });
  }
  get phones(): FormArray {
    return this.form.get('phones') as FormArray;
  }
  addPhonesControls(prof: IProfile): void {
    for (const phone of prof.phones) {
      this.phones.push(this.createPhoneFormGroup(phone));
    }
  }
  eventDeletPhone(phoneId: number | string, index: number): void {
    // this.phones.removeAt(index);
    const phones = this.profile.phones.filter(p => p.id !== phoneId);
    this.profile = {
      id: this.profile.id,
      name: this.profile.name,
      email: this.profile.email,
      phones
    };
    while (this.phones.length) {
      this.phones.removeAt(0);
    }
    this.addPhonesControls(this.profile);
  }
}
