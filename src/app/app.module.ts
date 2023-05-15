import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { MoncomponentComponent } from './moncomponent/moncomponent.component';
import { BpmnStePServiceService } from './bpmn-ste-pservice.service';

@NgModule({
  declarations: [
    AppComponent,
    MoncomponentComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule
  ],
  providers: [BpmnStePServiceService],
  bootstrap: [AppComponent],
  exports:[
    ComponentsModule
  ]
})
export class AppModule { }
