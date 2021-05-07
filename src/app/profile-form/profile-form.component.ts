import { IPhoneNumber } from './../phone/models/phone-model';
import { IProfile } from './../models/profile.model';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../phone/services/user/user.service';
import { map } from 'rxjs/operators';
import { unwrapPhones } from '../phone/utils/unwrap.phones';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent implements OnInit {
  form: FormGroup;
  profile: IProfile;
  isMain: number | string | null;
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
    });

    this.form.valueChanges
      .pipe(
        map(data => {
          return { ...data, ...{ phones: unwrapPhones(data.phones) } }
        })
      )
      .subscribe(d => {
        console.log(d);
      });
    this._userService.queryGetMock()
      .subscribe(prof => {
        // add user's phones to formArray
        this.profile = prof;
        this.addPhonesControls(prof);
        this.isMain = this.getIsMain(this.profile.phones);
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
  addPhone(): void {
    const phones = this.profile.phones.map(p => p);
    const newEmptyPhone: IPhoneNumber = {
      id: new Date().getUTCMilliseconds(),
      clientId: 15,
      phoneNumber: null,
      countryCode: null,
      countryId: null,
      countryRegion: null,
      isNew: true,
      phoneNumberShort: '',
      profileId: this.profile.id,
      isMain: false
    }
    phones.push(newEmptyPhone);
    this.profile = {
      id: this.profile.id,
      name: this.profile.name,
      email: this.profile.email,
      phones
    };
    this.phones.push(this._fb.group({
      phoneNumber: newEmptyPhone
    }))
  }
  getIsMain(phones: IPhoneNumber[]): number | string | null {
    if (phones.length === 0) {
      return null;
    }
    if (phones.length === 1) {
      return phones[0].id;
    }
    return phones.find(p => p.isMain === true)?.id;
  }
}
