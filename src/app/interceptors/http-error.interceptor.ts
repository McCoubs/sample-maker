import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private notifierService: NotifierService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // pass request on, handling error first and notifying user
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!(new RegExp('login|reister').test(error.url))) {
          const errorMessage = `Error: ${!!error.error ? error.error.message : error.message}`;
          this.notifierService.notify('error', errorMessage);
        }
        return throwError(error);
      })
    );
  }
}
