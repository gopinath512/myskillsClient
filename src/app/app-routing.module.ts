// =============================
// Email: info@ebenmonney.com
// www.ebenmonney.com/templates
// =============================

import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { RegisterComponent } from './components/account/register/register.component';
import { ConfirmEmailComponent } from './components/account/confirm-email/confirm-email.component';
import { RecoverPasswordComponent } from './components/account/recover-password/recover-password.component';
import { ResetPasswordComponent } from './components/account/reset-password/reset-password.component';
import { HomeComponent } from './components/home/home.component';
import { CustomersComponent } from './components/customers/customers.component';
import { ProductsComponent } from './components/products/products.component';
import { OrdersComponent } from './components/orders/orders.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AboutComponent } from './components/about/about.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { Utilities } from './services/utilities';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateQuestionComponent } from './components/question/create.question.component';
import { DashboardParentComponent } from './components/dashboard/parent/dashboard.parent.component';
import { DashboardLearnerComponent } from './components/dashboard/lerner/dashboard.learner.component';
import { QuestionComponent } from './components/question/home/question.component';
import { TestsComponent } from './components/tests/tests.component';
import { CreatetestsComponent } from './components/tests/create/createtests.component';
import { TestTakerComponent } from './components/test-taker/test-taker.component';
import { TestResultComponent } from './components/tests/test-result/test-result.component';
import { UserType } from './models/enums';
import { QuestionGeneratorComponent } from './components/admin/question-generator/question-generator.component';
import { CreatetestsParentComponent } from './components/tests/createTestParent/createtests-parent.component';
import { ProfileComponent } from './components/profile/profile.component';


@Injectable()
export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
  parse(url: string): UrlTree {
    const possibleSeparators = /[?;#]/;
    const indexOfSeparator = url.search(possibleSeparators);
    let processedUrl: string;

    if (indexOfSeparator > -1) {
      const separator = url.charAt(indexOfSeparator);
      const urlParts = Utilities.splitInTwo(url, separator);
      urlParts.firstPart = urlParts.firstPart.toLowerCase();

      processedUrl = urlParts.firstPart + separator + urlParts.secondPart;
    } else {
      processedUrl = url.toLowerCase();
    }

    return super.parse(processedUrl);
  }
}


const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: '', component: HomeComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: 'dashboard-parent', component: DashboardParentComponent, canActivate: [AuthGuard], data: { requiredUserType: UserType.Parent } },
  { path: 'dashboard-learner', component: DashboardLearnerComponent, canActivate: [AuthGuard], data: { requiredUserType: UserType.Learner } },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard', userType: 'Admin' } },

  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: 'google-login', component: AuthCallbackComponent, data: { title: 'Google Login' } },
  { path: 'facebook-login', component: AuthCallbackComponent, data: { title: 'Facebook Login' } },
  { path: 'twitter-login', component: AuthCallbackComponent, data: { title: 'Twitter Login' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Register' } },
  { path: 'confirmemail', component: ConfirmEmailComponent, data: { title: 'Confirm Email' } },
  { path: 'recoverpassword', component: RecoverPasswordComponent, data: { title: 'Recover Password' } },
  { path: 'resetpassword', component: ResetPasswordComponent, data: { title: 'Reset Password' } },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard], data: { title: 'Customers' } },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard], data: { title: 'Products' } },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard], data: { title: 'Orders' } },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { title: 'Settings' } },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { title: 'Profile' } },
  { path: 'createquestion', component: CreateQuestionComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: 'createtests', component: CreatetestsComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: 'createtestsparent', component: CreatetestsParentComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: 'question', component: QuestionComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: 'tests', component: TestsComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: 'about', component: AboutComponent, data: { title: 'About Us' } },
  { path: 'home', redirectTo: '/', pathMatch: 'full' },
  { path: 'learner/:id', component: DashboardLearnerComponent, canActivate: [AuthGuard], data: { title: 'Dashboard' } },
  { path: 'test-taker', component: TestTakerComponent, canActivate: [AuthGuard], data: { title: 'TestTakerComponent', hideHeader: true } },
  { path: 'testResult/:testId/:attemptId', component: TestResultComponent, canActivate: [AuthGuard], data: { title: 'Test Result' } },
  { path: 'generatequestion', component: QuestionGeneratorComponent, canActivate: [AuthGuard], data: { title: 'Home' } },
  { path: '**', component: NotFoundComponent, data: { title: 'Page Not Found' } }

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AuthService,
    AuthGuard,
    { provide: UrlSerializer, useClass: LowerCaseUrlSerializer }]
})
export class AppRoutingModule { }
