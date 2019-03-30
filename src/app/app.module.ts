import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './route-components/login/login.component';
import { DashboardComponent } from './route-components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CookieService } from 'ngx-cookie-service';
import { ProfileComponent } from './route-components/profile/profile.component';
import { HeaderComponent } from './utility-components/header/header.component';
import { CardComponent } from './utility-components/card/card.component';
import { SampleCreatorComponent } from './route-components/sample-creator/sample-creator.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSliderModule } from 'igniteui-angular';
import { CarouselComponent } from './utility-components/carousel/carousel.component';
import { CreditsComponent } from './route-components/credits/credits.component';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { NotifierModule } from 'angular-notifier';
import { notifierOptions } from './config/notifier';
import { UserCardComponent } from './utility-components/user-card/user-card.component';
import { UserPagesComponent } from './utility-components/user-pages/user-pages.component';
import { JwPaginationComponent } from 'jw-angular-pagination';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ProfileComponent,
    HeaderComponent,
    CardComponent,
    SampleCreatorComponent,
    CarouselComponent,
    CreditsComponent,
    UserCardComponent,
    UserPagesComponent,
    JwPaginationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    IgxSliderModule,
    NotifierModule.withConfig(notifierOptions)
  ],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
