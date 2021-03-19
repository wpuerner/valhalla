import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ServerStatusComponent } from './server-status/server-status.component';
import { HttpClientModule } from '@angular/common/http';
import { StateButtonComponent } from './state-button/state-button.component';

@NgModule({
  declarations: [
    AppComponent,
    ServerStatusComponent,
    StateButtonComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
