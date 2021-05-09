import { IErrorStatus, TErrorSeverity } from './../models/error.status.model';
import { IPhoneNumber } from '../phone-module/models/phone-model';
import { IProfile } from './../models/profile.model';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../phone-module/services/user/user.service';
import { map } from 'rxjs/operators';
import { unwrapPhones } from '../phone-module/utils/unwrap.phones';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { MessageService } from 'primeng/api';
import { IProfileForm } from '../models/profile-form-data.model';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // анимация применяется при добавлении/удалении нового телефона 
  animations: [
    trigger('phoneAnim', [
      transition('void => *', [
        animate(1000, keyframes([
          style({ opacity: 0, transform: 'translateY(-5px)', offset: 0 }),
          style({ opacity: 0, transform: 'scale(1.3)', offset: 0 }),
          style({ opacity: 0.8, transform: 'translateY(5px)', offset: 0.3 }),
          style({ opacity: 1, transform: 'translateY(0)', offset: 0.8 })
        ]))
      ]),
      transition('* => void', [
        animate('0.3s', style({ opacity: 0, transform: 'scale(.6)' }))
      ])
    ])
  ]
})
export class ProfileFormComponent implements OnInit {
  state = 'some';
  form: FormGroup;
  profile: IProfile;
  isMain: number | string | null;
  currentAnimatedId: string | number;
  phoneErrors: IErrorStatus[] = [];
  phoneErrorsMsg = '';
  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _cd: ChangeDetectorRef,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      name: [''],
      email: [''],
      phones: this._fb.array([])
    });

    this.form.valueChanges
      .pipe(
        map((data: IProfileForm) => {
          return { ...data, ...{ phones: unwrapPhones(data.phones) } };
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
        clientId: phone.clientId,
        isMain: phone.isMain
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
    this.currentAnimatedId = phoneId;
    setTimeout(() => {

      const phones = this.profile.phones.filter(p => p.id !== phoneId);
      this.profile = {
        id: this.profile.id,
        name: this.profile.name,
        email: this.profile.email,
        phones
      };

      //TODO remove after test
      // while (this.phones.length) {
      this.phones.removeAt(index);
      this.isMain = this.getIsMain(phones);
      this._cd.markForCheck();
    });
    // }
    // this.addPhonesControls(this.profile);
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
    };
    this.currentAnimatedId = newEmptyPhone.id;
    phones.push(newEmptyPhone);
    this.profile = {
      id: this.profile.id,
      name: this.profile.name,
      email: this.profile.email,
      phones
    };
    this.phones.push(this._fb.group({
      phoneNumber: newEmptyPhone
    }));
  }
  getIsMain(phones: IPhoneNumber[]): number | string | null {
    if (phones.length === 0) {
      return null;
    }
    if (phones.length === 1) {
      return phones[0].id;
    }
    if (!phones.find(p => p.isMain === true)) { // если нет ни одного главного -  ставим первый
      return phones[0].id;
    }
    return phones.find(p => p.isMain === true)?.id;
  }
  eventValidationStatus(err: IErrorStatus): void {
    this.phoneErrors = this.phoneErrors.filter(e => err.status !== true ||  e.id !== err.id );
    if(err.status === false){
      this.phoneErrors.push(err);
    }
  }
  isPhoneErrors(): boolean {
    return this.phoneErrors.length > 0 && this.phoneErrors.some(e => e.status === false);
  }
  selectIsMain(): void {
    const phones = this.profile.phones
      .map(p => p)
      .map(p => ({ ...p, ...{ isMain: this.isMain === p.id } }));
    this.profile = {
      id: this.profile.id,
      name: this.profile.name,
      email: this.profile.email,
      phones
    };
    // console.log(this.profile.phones);
  }
  buildPhoneErrorsMessage(startWith = '***', delim = ';'): string {
    if (this.phoneErrors.length > 0) {
      return this.phoneErrors
        .filter(err => err.status === false)
        .reduce((acc: string, current: IErrorStatus) => {
          return acc += current.message + delim;
        }, startWith);
    }
    return '';
  }
  showToastMessage(msg: string, severity: TErrorSeverity): void {
    this._messageService.add({ severity, detail: msg });
  }
  save(): void {
    if (!this.isPhoneErrors()) {
      this.phoneErrorsMsg = '';
      this.showToastMessage('Телеф номера валидны', 'success');
      return;
    }
    this.phoneErrorsMsg = this.buildPhoneErrorsMessage();
    this.showToastMessage(this.phoneErrorsMsg, 'error');
  }
}
