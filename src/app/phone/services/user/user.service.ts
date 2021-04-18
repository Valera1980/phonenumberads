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

  queryGet(): Observable<any> {
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
            })
          }
          return [];
        })
      )

  }
}
