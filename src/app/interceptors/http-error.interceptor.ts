import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { AuthenticationService } from '../global-services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private notifierService: NotifierService, private authService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!(new RegExp('login|register').test(error.url))) {
          // if unauthorized, force log them out
          if (error.status === 401) {
            this.authService.logout();
          }
          // notify user of error
          const errorMessage = `Error: ${!!error.error ? error.error.message : error.message}`;
          this.notifierService.notify('error', errorMessage);
        }
        return throwError(error);
      })
    );
  }
}
