import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { AuthenticationService } from '../authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenResponse } from '../interfaces/authentication';
import { faEnvelope, faLock, faSignature, faExclamation } from '@fortawesome/free-solid-svg-icons';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // fontAwesome variables
  faEnvelope = faEnvelope;
  faLock = faLock;
  faSignature = faSignature;
  faExclamation = faExclamation;

  form: FormGroup;
  returnUrl: string;
  loading = false;
  message: string;
  loginAction = true;
  emailInvalid = false;
  passwordInvalid = false;

  constructor(
      private authService: AuthenticationService,
      private userService: UserService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router
  ) {
    // setup form validators
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['']
    });

    // debounce inputs to show/hide form errors
    this.form.valueChanges.pipe(debounceTime(500)).subscribe(form => {
      // invalid if invalid and dirty
      this.emailInvalid = this.form.controls.email.invalid && this.form.controls.email.dirty;
      this.passwordInvalid = this.form.controls.password.invalid && this.form.controls.password.dirty;
    });
  }

  ngOnInit(): void {
    // remove all stored session info
    this.authService.logout();
    // store the return url to redirect the user after proper login
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  login(): void {
    // valid form submission
    if (this.form.valid && !this.loading) {
      this.loading = true;
      this.message = null;
      // login with given credentials
      this.authService.login(this.form.value).subscribe(
          (data: TokenResponse) => {
            // on success, set current user and direct to desired page
            this.userService.setCurrentUser(this.userService.parseJWTToken(data.token));
            this.userService.setJWTToken(data.token);
            this.router.navigateByUrl(this.returnUrl);
            this.loading = false;
          },
          (error) => {
            // on error, display the given message
            this.message = error['error']['message'];
            this.loading = false;
          }
      );
    }
  }

  register(): void {
    // valid form submission
    if (this.form.valid && !this.loading) {
      this.loading = true;
      this.message = null;
      // login with given credentials
      this.authService.register(this.form.value).subscribe(
          (data: TokenResponse) => {
            // on success, set current user and direct to desired page
            this.userService.setCurrentUser(this.userService.parseJWTToken(data.token));
            this.userService.setJWTToken(data.token);
            this.router.navigateByUrl(this.returnUrl);
            this.loading = false;
          },
          (error) => {
            // on error, display the given message
            this.message = error['error']['message'];
            this.loading = false;
          }
      );
    }
  }
}
