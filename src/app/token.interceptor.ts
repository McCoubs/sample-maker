// Angular
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.userService.getJWTToken();
    // insert auth header if token non-null
    if (token) {
      request = request.clone({
        setHeaders: {
          authorization: `Bearer ${token}`
        }
      });
    }
    // pass onto next interceptor of the chain
    return next.handle(request);
  }
}
