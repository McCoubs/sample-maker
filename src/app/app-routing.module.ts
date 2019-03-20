import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './route-components/login/login.component';
import { DashboardComponent } from './route-components/dashboard/dashboard.component';
import { ProfileComponent} from './route-components/profile/profile.component';
import { AuthGuard} from './guards/auth.guard';
import { SampleCreatorComponent } from './route-components/sample-creator/sample-creator.component';

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
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'sample-creator',
    component: SampleCreatorComponent,
    canActivate: [AuthGuard]
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
