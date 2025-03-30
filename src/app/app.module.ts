// =============================
// Email: info@ebenmonney.com
// www.ebenmonney.com/templates
// =============================

import { NgModule, ErrorHandler, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop'

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ToastaModule } from 'ngx-toasta';
import { NgSelectModule } from '@ng-select/ng-select';
import { TagInputModule } from 'ngx-chips';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppErrorHandler } from './app-error.handler';
import { AppTitleService } from './services/app-title.service';
import { AppTranslationService, TranslateLanguageLoader } from './services/app-translation.service';
import { ConfigurationService } from './services/configuration.service';
import { AlertService } from './services/alert.service';
import { ThemeManager } from './services/theme-manager';
import { LocalStoreManager } from './services/local-store-manager.service';
import { OidcHelperService } from './services/oidc-helper.service';
import { NotificationService } from './services/notification.service';
import { NotificationEndpoint } from './services/notification-endpoint.service';
import { AccountService } from './services/account.service';
import { ReferenceDataService } from './services/Reference/reference-data.service';
import { AccountEndpoint } from './services/account-endpoint.service';
import { QuestionEndpoint } from './services/question/question-endpoint.service';
import { QuestionService } from './services/question/question.service';
import { TestService } from './services/tests/test.service';


import { EqualValidator } from './directives/equal-validator.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { BootstrapTabDirective } from './directives/bootstrap-tab.directive';
import { GroupByPipe } from './pipes/group-by.pipe';

import { AppComponent } from './components/app.component';
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

import { BannerDemoComponent } from './components/controls/banner-demo.component';
import { TodoDemoComponent } from './components/controls/todo-demo.component';
import { StatisticsDemoComponent } from './components/controls/statistics-demo.component';
import { NotificationsViewerComponent } from './components/controls/notifications-viewer.component';
import { SearchBoxComponent } from './components/controls/search-box.component';
import { UserInfoComponent } from './components/controls/user-info.component';
import { UserPreferencesComponent } from './components/controls/user-preferences.component';
import { UsersManagementComponent } from './components/controls/users-management.component';
import { RolesManagementComponent } from './components/controls/roles-management.component';
import { RoleEditorComponent } from './components/controls/role-editor.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateQuestionComponent } from './components/question/create.question.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DashboardParentComponent } from './components/dashboard/parent/dashboard.parent.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardLearnerComponent } from './components/dashboard/lerner/dashboard.learner.component';
import { OptionControlComponent } from './components/controls/shared/option-control/option-control.component';
import { QuestionComponent } from './components/question/home/question.component';
import { TestsComponent } from './components/tests/tests.component';
import { CreatetestsComponent } from './components/tests/create/createtests.component';
import { QuestionSearchComponent } from './components/question/search/question.search.component';
import { AssignTestsComponent } from './components/assign-tests/assign-tests.component';
import { ViewQuestionsComponent } from './components/controls/shared/view-questions/view-questions.component';

import { ArchwizardModule } from 'angular-archwizard';
import { TestTakerComponent } from './components/test-taker/test-taker.component';
import { TestResultComponent } from './components/tests/test-result/test-result.component';
import { TestStatisticsComponent } from './components/controls/parent/test-statistics/test-statistics.component';
import { TestOverallReportComponent } from './components/controls/parent/test-overall-report/test-overall-report.component';
import { UserTestReportComponent } from './components/controls/learner/user-test-report/user-test-report.component';
import { SubjectAnalysisReportComponent } from './components/controls/learner/subject-analysis-report/subject-analysis-report.component';
import { UserSubjectCoverageStatsComponent } from './components/controls/learner/user-subject-coverage-stats/user-subject-coverage-stats.component';
import { TopicDifficultyAnalysisReportComponent } from './components/controls/learner/topic-difficulty-analysis-report/topic-difficulty-analysis-report.component';
import { QuestionGeneratorComponent } from './components/admin/question-generator/question-generator.component';
import { TestInprogressReportComponentComponent } from './components/controls/parent/test-inprogress-report.component/test-inprogress-report.component.component';
import { RecentActivitiesComponent } from './components/controls/parent/recent-activities/recent-activities.component';
import { PerformanceSummaryComponent } from './components/controls/parent/performance-summary/performance-summary.component';
import { ChildOverviewComponent } from './components/controls/parent/child-overview/child-overview.component';
import { TestAttemptComponent } from './components/controls/shared/test-attempt/test-attempt.component';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms'; 
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CreatetestsParentComponent } from './components/tests/createTestParent/createtests-parent.component';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [
    AppComponent,
    LoginComponent,
    AuthCallbackComponent,
    RegisterComponent,
    ConfirmEmailComponent,
    RecoverPasswordComponent,
    ResetPasswordComponent,
    HomeComponent,
    CustomersComponent,
    ProductsComponent,
    OrdersComponent,
    SettingsComponent,
    UsersManagementComponent, UserInfoComponent, UserPreferencesComponent,
    RolesManagementComponent, RoleEditorComponent,
    AboutComponent,
    NotFoundComponent,
    NotificationsViewerComponent,
    SearchBoxComponent,
    StatisticsDemoComponent, TodoDemoComponent, BannerDemoComponent,
    EqualValidator,
    AutofocusDirective,
    BootstrapTabDirective,
    GroupByPipe,
    DashboardComponent,
    CreateQuestionComponent,
    DashboardParentComponent,
    DashboardLearnerComponent,
    OptionControlComponent,
    QuestionComponent,
    TestsComponent,
    CreatetestsComponent,
    CreatetestsParentComponent,
    QuestionSearchComponent,
    AssignTestsComponent,
    ViewQuestionsComponent,
    TestTakerComponent,
    TestResultComponent,
    TestStatisticsComponent,
    TestOverallReportComponent,
    UserTestReportComponent,
    SubjectAnalysisReportComponent,
    UserSubjectCoverageStatsComponent,
    TopicDifficultyAnalysisReportComponent,
    QuestionGeneratorComponent,
    TestInprogressReportComponentComponent,
    RecentActivitiesComponent,
    PerformanceSummaryComponent,
    ChildOverviewComponent,
    TestAttemptComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    DragDropModule,
    AppRoutingModule,
    CKEditorModule,
    ArchwizardModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLanguageLoader
      }
    }),
    NgxDatatableModule,
    OAuthModule.forRoot(),
    ToastaModule.forRoot(),
    NgSelectModule,
    TagInputModule,
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    NgChartsModule,
    NgbModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    MatButtonModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatExpansionModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatCheckboxModule
  ],
  providers: [
    { provide: ErrorHandler, useClass: AppErrorHandler },
    AlertService,
    ThemeManager,
    ConfigurationService,
    AppTitleService,
    AppTranslationService,
    NotificationService,
    NotificationEndpoint,
    AccountService,
    AccountEndpoint,
    LocalStoreManager,
    OidcHelperService,
    ReferenceDataService,
    QuestionEndpoint,
    QuestionService,
    TestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
