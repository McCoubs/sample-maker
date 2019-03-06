import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { AuthenticationService } from '../authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenResponse } from '../interfaces/authentication';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  returnUrl: string;
  loading = false;
  messages: Array<string>;
  loginAction = true;

  constructor(
      private authService: AuthenticationService,
      private userService: UserService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router
  ) {
    // setup form validators
    this.form = this.fb.group({
      email: ['', Validators.email],
      password: ['', Validators.required],
      name: ['']
    });
    this.messages = [];
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
      // login with given credentials
      this.authService.login(this.form.value).subscribe(
          (data: TokenResponse) => {
            // on success, set current user and direct to desired page
            this.userService.setCurrentUser(this.userService.parseJWTToken(data.token));
            this.userService.setJWTToken(data.token);
            this.router.navigateByUrl(this.returnUrl);
            this.loading = false;
            this.messages = [];
          },
          (error) => {
            // on error, display the given message
            this.messages.push(error['error']['message']);
            this.loading = false;
          }
      );
    }
  }

  register(): void {
    // valid form submission
    if (this.form.valid && !this.loading) {
      this.loading = true;
      // login with given credentials
      this.authService.register(this.form.value).subscribe(
          (data: TokenResponse) => {
            // on success, set current user and direct to desired page
            this.userService.setCurrentUser(this.userService.parseJWTToken(data.token));
            this.userService.setJWTToken(data.token);
            this.router.navigateByUrl(this.returnUrl);
            this.loading = false;
            this.messages = [];
          },
          (error) => {
            // on error, display the given message
            this.messages.push(error['error']['message']);
            this.loading = false;
          }
      );
    }
  }
}
