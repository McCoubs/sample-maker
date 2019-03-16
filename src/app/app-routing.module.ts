import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard} from './auth.guard';
import { SampleCreatorComponent } from './sample-creator/sample-creator.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-creator',
    component: SampleCreatorComponent
    // TODO: canActivate: [AuthGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: '**',
    // TODO: make 404 page
    component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
