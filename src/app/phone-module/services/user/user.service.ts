/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IProfile } from '../../../models/profile.model';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly collectionName = 'test';
  constructor(
    private _http: HttpClient,
    private _fireStore: AngularFirestore
  ) { }

  queryGetFB(): Observable<any> {
    return this._fireStore.collection(this.collectionName).snapshotChanges()
      .pipe(
        catchError(e => {
          throwError(e);
          return of([]);
        }),
        map((snaps: any[]) => {
          if (Array.isArray(snaps)) {
            return snaps.map((snap: any) => {
              return snap.payload.doc.data();
            });
          }
          return [];
        })
      );

  }
  queryGetMock(): Observable<IProfile> {
    const profiles: IProfile = {
      id: 1245,
      name: 'Some profile name',
      email: 'profile@gmail.com',
      phones: [
        {
          id: 1,
          isNew: false,
          clientId: 15,
          countryCode: '380',
          countryId: 804,
          countryRegion: 'UA',
          phoneNumber: 380664400345,
          phoneNumberShort: '664400345',
          profileId: 1245,
          isMain: false
        },
        // {
        //   id: 2,
        //   isNew: false,
        //   clientId: 15,
        //   countryCode: '7',
        //   countryId: 398,
        //   countryRegion: 'KZ',
        //   phoneNumber: 77014486954,
        //   phoneNumberShort: '7014486954',
        //   profileId: 1245,
        //   isMain: true

        // },
        // {
        //   id: 3,
        //   isNew: false,
        //   clientId: 15,
        //   countryCode: '48',
        //   countryId: 616,
        //   countryRegion: 'PL',
        //   phoneNumber: 48602644790,
        //   phoneNumberShort: '602644790',
        //   profileId: 1245,
        //   isMain: false

        // },
        {
          id: 2,
          isNew: false,
          clientId: 15,
          countryCode: null,
          countryId: null,
          countryRegion: null,
          phoneNumber: 11111111,
          phoneNumberShort: '11111111',
          profileId: 1245,
          isMain: false
        }
      ]
    };
    return of(profiles);
  }
}
// +48 602 644 790

