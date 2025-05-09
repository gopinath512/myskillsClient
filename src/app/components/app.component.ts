// =============================
// Email: info@ebenmonney.com
// www.ebenmonney.com/templates
// =============================

import { Component, OnInit, OnDestroy, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastaService, ToastaConfig, ToastOptions, ToastData } from 'ngx-toasta';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AlertService, AlertDialog, DialogType, AlertCommand, MessageSeverity } from '../services/alert.service';
import { NotificationService } from '../services/notification.service';
import { AppTranslationService } from '../services/app-translation.service';
import { AccountService } from '../services/account.service';
import { LocalStoreManager } from '../services/local-store-manager.service';
import { AppTitleService } from '../services/app-title.service';
import { AuthService } from '../services/auth.service';
import { ConfigurationService } from '../services/configuration.service';
import { Permission } from '../models/permission.model';
import { LoginComponent } from '../components/login/login.component';
import { filter } from 'rxjs/operators';

const alertify: any = require('../assets/scripts/alertify.js');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  showHeader = true;
  isAppLoaded: boolean;
  isUserLoggedIn: boolean;
  shouldShowLoginModal: boolean;
  newNotificationCount = 0;
  appTitle = '';

  stickyToasties: number[] = [];

  dataLoadingConsecutiveFailures = 0;
  notificationsLoadingSubscription: any;

  @ViewChildren('loginModal,loginControl')
  modalLoginControls: QueryList<any>;

  loginModal: ModalDirective;
  loginControl: LoginComponent;

  gT = (key: string | Array<string>, interpolateParams?: object) => this.translationService.getTranslation(key, interpolateParams);

  get notificationsTitle() {
    if (this.newNotificationCount) {
      return `${this.gT('app.Notifications')} (${this.newNotificationCount} ${this.gT('app.New')})`;
    } else {
      return this.gT('app.Notifications');
    }
  }


  constructor(
    storageManager: LocalStoreManager,
    private toastaService: ToastaService,
    private toastaConfig: ToastaConfig,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private appTitleService: AppTitleService,
    private authService: AuthService,
    private translationService: AppTranslationService,
    public configurations: ConfigurationService,
    public router: Router) {

    storageManager.initialiseStorageSyncListener();

    this.toastaConfig.theme = 'bootstrap';
    this.toastaConfig.position = 'top-right';
    this.toastaConfig.limit = 100;
    this.toastaConfig.showClose = true;
    this.toastaConfig.showDuration = false;

    this.appTitleService.appName = this.appTitle;

    //if (this.isUserLoggedIn && this.canNavigateToParentDashboard) {
    //  console.log('navigated to parent')
    //  this.router.navigate(['/parentdashboard']);
    //}
    //// Navigate based on the user's role
    ////if (userRole === 'parent') {
    ////  this.router.navigate(['/parent-dashboard']);
    ////} else if (userRole === 'learner') {
    ////  this.router.navigate(['/learner-dashboard']);
    ////} else if (userRole === 'admin') {
    ////  this.router.navigate(['/admin-dashboard']);
    ////} else {
    ////  // Handle other roles or scenarios
    ////}

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {let root = this.router.routerState.snapshot.root;
      while (root.firstChild) root = root.firstChild;
      if (root.data['hideHeader']) {
        document.body.classList.add('hide-header');
      } else {
        document.body.classList.remove('hide-header');
      }
    });
  
  
}


ngAfterViewInit() {

  this.modalLoginControls.changes.subscribe((controls: QueryList<any>) => {
    controls.forEach(control => {
      if (control) {
        if (control instanceof LoginComponent) {
          this.loginControl = control;
          this.loginControl.modalClosedCallback = () => this.loginModal.hide();
        } else {
          this.loginModal = control;
          this.loginModal.show();
        }
      }
    });
  });
}

  get canNavigateToParentDashboard() {
  return this.accountService.currentUser.roles.includes('parent'); // eg. viewProductsPermission
}

onLoginModalShown() {
  this.alertService.showStickyMessage(this.gT('app.alerts.SessionExpired'), this.gT('app.alerts.SessionExpiredLoginAgain'), MessageSeverity.info);
}


onLoginModalHidden() {
  this.alertService.resetStickyMessage();
  this.loginControl.reset();
  this.shouldShowLoginModal = false;

  if (this.authService.isSessionExpired) {
    this.alertService.showStickyMessage(this.gT('app.alerts.SessionExpired'), this.gT('app.alerts.SessionExpiredLoginToRenewSession'), MessageSeverity.warn);
  }
}


onLoginModalHide() {
  this.alertService.resetStickyMessage();
}

isActive(route: string): boolean {
  return this.router.url === route;
}

ngOnInit() {
  this.isUserLoggedIn = this.authService.isLoggedIn;

  // Extra sec to display preboot loaded information
  setTimeout(() => this.isAppLoaded = true, 1000);

  setTimeout(() => {
    if (this.isUserLoggedIn) {
      this.alertService.resetStickyMessage();

      // if (!this.authService.isSessionExpired)
      this.alertService.showMessage(this.gT('app.alerts.Login'), this.gT('app.alerts.WelcomeBack', { username: this.userName }), MessageSeverity.default);
      // else
      //  this.alertService.showStickyMessage(this.gT("app.alerts.SessionExpired"), this.gT("app.alerts.SessionExpiredLoginAgain"), MessageSeverity.warn);
    }
  }, 2000);


  this.alertService.getDialogEvent().subscribe(alert => this.showDialog(alert));
  this.alertService.getMessageEvent().subscribe(message => this.showToast(message));

  this.authService.reLoginDelegate = () => this.shouldShowLoginModal = true;

  this.authService.getLoginStatusEvent().subscribe(isLoggedIn => {
    this.isUserLoggedIn = isLoggedIn;


    if (this.isUserLoggedIn) {
      this.initNotificationsLoading();

    } else {
      this.unsubscribeNotifications();
    }

    setTimeout(() => {
      if (!this.isUserLoggedIn) {
        this.alertService.showMessage(this.gT('app.alerts.SessionEnded'), '', MessageSeverity.default);
      }
    }, 500);
  });
}


ngOnDestroy() {
  this.unsubscribeNotifications();
}


  private unsubscribeNotifications() {
  if (this.notificationsLoadingSubscription) {
    this.notificationsLoadingSubscription.unsubscribe();
  }
}



initNotificationsLoading() {

  this.notificationsLoadingSubscription = this.notificationService.getNewNotificationsPeriodically()
    .subscribe(notifications => {
      this.dataLoadingConsecutiveFailures = 0;
      this.newNotificationCount = notifications.filter(n => !n.isRead).length;
    },
      error => {
        this.alertService.logError(error);

        if (this.dataLoadingConsecutiveFailures++ < 20) {
          setTimeout(() => this.initNotificationsLoading(), 5000);
        } else {
          this.alertService.showStickyMessage(this.gT('app.alerts.LoadingError'), this.gT('app.alerts.LoadingNewNotificationsFailed'), MessageSeverity.error);
        }
      });
}


markNotificationsAsRead() {

  const recentNotifications = this.notificationService.recentNotifications;

  if (recentNotifications.length) {
    this.notificationService.readUnreadNotification(recentNotifications.map(n => n.id), true)
      .subscribe(response => {
        for (const n of recentNotifications) {
          n.isRead = true;
        }

        this.newNotificationCount = recentNotifications.filter(n => !n.isRead).length;
      },
        error => {
          this.alertService.logError(error);
          this.alertService.showMessage(this.gT('app.alerts.NotificationError'), this.gT('app.alerts.MarkingReadNotificationsFailed'), MessageSeverity.error);

        });
  }
}



showDialog(dialog: AlertDialog) {

  alertify.set({
    labels: {
      ok: dialog.okLabel || this.gT('app.alerts.OK'),
      cancel: dialog.cancelLabel || this.gT('app.alerts.Cancel')
    }
  });

  switch (dialog.type) {
    case DialogType.alert:
      alertify.alert(dialog.message);

      break;
    case DialogType.confirm:
      alertify
        .confirm(dialog.message, (e) => {
          if (e) {
            dialog.okCallback();
          } else {
            if (dialog.cancelCallback) {
              dialog.cancelCallback();
            }
          }
        });

      break;
    case DialogType.prompt:
      alertify
        .prompt(dialog.message, (e, val) => {
          if (e) {
            dialog.okCallback(val);
          } else {
            if (dialog.cancelCallback) {
              dialog.cancelCallback();
            }
          }
        }, dialog.defaultValue);

      break;
  }
}



showToast(alert: AlertCommand) {

  if (alert.operation === 'clear') {
    for (const id of this.stickyToasties.slice(0)) {
      this.toastaService.clear(id);
    }

    return;
  }

  const toastOptions: ToastOptions = {
    title: alert.message.summary,
    msg: alert.message.detail,
  };


  if (alert.operation === 'add_sticky') {
    toastOptions.timeout = 0;

    toastOptions.onAdd = (toast: ToastData) => {
      this.stickyToasties.push(toast.id);
    };

    toastOptions.onRemove = (toast: ToastData) => {
      const index = this.stickyToasties.indexOf(toast.id, 0);

      if (index > -1) {
        this.stickyToasties.splice(index, 1);
      }

      if (alert.onRemove) {
        alert.onRemove();
      }

      toast.onAdd = null;
      toast.onRemove = null;
    };
  } else {
    toastOptions.timeout = 4000;
  }


  switch (alert.message.severity) {
    case MessageSeverity.default: this.toastaService.default(toastOptions); break;
    case MessageSeverity.info: this.toastaService.info(toastOptions); break;
    case MessageSeverity.success: this.toastaService.success(toastOptions); break;
    case MessageSeverity.error: this.toastaService.error(toastOptions); break;
    case MessageSeverity.warn: this.toastaService.warning(toastOptions); break;
    case MessageSeverity.wait: this.toastaService.wait(toastOptions); break;
  }
}



logout() {
  this.authService.logout();
  this.authService.redirectLogoutUser();
}


getYear() {
  return new Date().getUTCFullYear();
}


  get userName(): string {
  return this.authService.currentUser ? this.authService.currentUser.userName : '';
}


  get fullName(): string {
  return this.authService.currentUser ? this.authService.currentUser.fullName : '';
}



  get canViewCustomers() {
  return this.accountService.userHasPermission(Permission.viewUsersPermission); // eg. viewCustomersPermission
}

  get canViewProducts() {
  return this.accountService.userHasPermission(Permission.viewUsersPermission); // eg. viewProductsPermission
}

  get canViewOrders() {
  return true; // eg. viewOrdersPermission
}

  // Test Management Permissions
  get canTakeTest() {
  return this.accountService.userHasPermission(Permission.takeTestPermission);
}

  get canViewTestResults() {
  return this.accountService.userHasPermission(Permission.viewTestResultsPermission);
}

  get canCreateTest() {
  return this.accountService.userHasPermission(Permission.createTestPermission);
}

  get canViewTests() {
  return this.accountService.userHasPermission(Permission.viewTestsPermission);
}

  get canEditTests() {
  return this.accountService.userHasPermission(Permission.editTestsPermission);
}

  get canDeleteTests() {
  return this.accountService.userHasPermission(Permission.deleteTestsPermission);
}

  // Question Management Permissions
  get canCreateQuestion() {
  return this.accountService.userHasPermission(Permission.createQuestionPermission);
}

  get canViewQuestion() {
  return this.accountService.userHasPermission(Permission.viewQuestionPermission);
}

  get canEditQuestion() {
  return this.accountService.userHasPermission(Permission.editQuestionPermission);
}

  get canDeleteQuestion() {
  return this.accountService.userHasPermission(Permission.deleteQuestionPermission);
}

}
