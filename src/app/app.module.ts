import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PhoneModule } from './phone-module/phone.module';
import { HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { ProfileFormComponent } from './profile-form/profile-form.component';

const firebaseConfig = {
  apiKey: 'AIzaSyAmfcnwI-1x5HrUGSX_KBXlZ--ZRCEC-GI',
  authDomain: 'phonecountriesconcepts.firebaseapp.com',
  databaseURL: 'https://phonecountriesconcepts-default-rtdb.firebaseio.com',
  projectId: 'phonecountriesconcepts',
  storageBucket: 'phonecountriesconcepts.appspot.com',
  messagingSenderId: '23633471402',
  appId: '1:23633471402:web:714ebdbc8c9678f00d6dd3'
};

@NgModule({
  declarations: [
    AppComponent,
    ProfileFormComponent
  ],
  imports: [
    BrowserModule,
    PhoneModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
