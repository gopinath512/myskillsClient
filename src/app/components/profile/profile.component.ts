import { Component, NgZone, OnInit, ViewChild, Input, TemplateRef } from '@angular/core';

import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../services/utilities';
import { LocalStoreManager } from '../../services/local-store-manager.service';
import { DBkeys } from '../../services/db-keys';
import { User } from '../../models/user.model';
import { UserEdit } from '../../models/user-edit.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { ReferenceDataViewModel } from '../../models/ReferenceModel/reference.model';
import { ReferenceDataService } from '../../services/Reference/reference-data.service';
import { UserType } from '../../models/enums';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UserInfoComponent } from '../controls/user-info.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})

export class ProfileComponent implements OnInit {

  public isEditMode = false;
  public isNewUser = false;
  public isSaving = false;
  public isSendingEmail = false;
  public isChangePassword = false;
  public isEditingSelf = false;
  public userHasPassword = true;
  public showValidationErrors = false;
  public uniqueId: string = Utilities.uniqueId();
  public emailConfirmed: boolean;
  public user: User = new User();
  public userEdit: UserEdit;
  public formResetToggle = true;
  public changesSavedCallback: () => void;
  public changesFailedCallback: () => void;
  public changesCancelledCallback: () => void;

  public allRoles: Role[] = [];
  grades: ReferenceDataViewModel[] = [];
  columns: any[] = [];
  rows: User[] = [];
  rowsCache: User[] = [];
  editedUser: UserEdit;
  sourceUser: UserEdit;
  editingUserName: { name: string };
  loadingIndicator: boolean;

  @ViewChild('indexTemplate', { static: true })
  indexTemplate: TemplateRef<any>;

  @ViewChild('userNameTemplate', { static: true })
  userNameTemplate: TemplateRef<any>;

  @ViewChild('rolesTemplate', { static: true })
  rolesTemplate: TemplateRef<any>;

  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate: TemplateRef<any>;

  @ViewChild('editorModal', { static: true })
  editorModal: ModalDirective;


  @Input()
  isViewOnly: boolean;

  @Input()
  isGeneralEditor = false;

  @Input()
  isParentuser = false;

  @ViewChild('f')
  public form;

  // ViewChilds Required because ngIf hides template variables from global scope
  @ViewChild('userName')
  public userName;

  @ViewChild('userPassword')
  public userPassword;

  @ViewChild('email')
  public email;

  @ViewChild('currentPassword')
  public currentPassword;

  @ViewChild('newPassword')
  public newPassword;

  @ViewChild('confirmPassword')
  public confirmPassword;

  @ViewChild('roles')
  public roles;

  @ViewChild('userEditor', { static: true })
  userEditor: UserInfoComponent;

  constructor(private ngZone: NgZone, private alertService: AlertService, private accountService: AccountService, private localStorage: LocalStoreManager, private referenceDataService: ReferenceDataService) {
  }

  ngOnInit() {
    this.getGrades();
    if (!this.isGeneralEditor) {
      this.loadCurrentUserData();
    }
    this.loadData();
  }

  ngAfterViewInit() {

    this.userEditor.changesSavedCallback = () => {
      this.addNewUserToList();
      this.editorModal.hide();
    };

    this.userEditor.changesCancelledCallback = () => {
      this.editedUser = null;
      this.sourceUser = null;
      this.editorModal.hide();
    };
  }
  canSeeGrade() {
    // Use optional chaining to safely access userType and default to a fallback value if undefined
    const userType = this.user?.userType ?? null;
    console.log('userType');
    console.log(userType);
    console.log(userType === UserType.Learner);
    // Check if userType is either Parent or Learner
    if (userType === UserType.Learner) {
      return true;
    }

    // Return false if userType is not Parent or Learner, or if userType is null
    return false;
  }


  getGrades(): void {
    this.referenceDataService.getGrades()
      .subscribe(grades => {
        this.grades = grades;
        console.log(this.grades,'grades')
        // You can now work with the 'grades' array in your component
      });
  }

  private loadCurrentUserData() {
    this.alertService.startLoadingMessage();

    this.loadCurrentUserPasswordStatus();

    if (this.canViewAllRoles) {
      this.accountService.getUserAndRoles().subscribe(results => this.onCurrentUserDataLoadSuccessful(results[0], results[1]), error => this.onCurrentUserDataLoadFailed(error));
    } else {
      this.accountService.getUser().subscribe(user => this.onCurrentUserDataLoadSuccessful(user, user.roles.map(x => new Role(x))), error => this.onCurrentUserDataLoadFailed(error));
    }
  }

  private onCurrentUserDataLoadSuccessful(user: User, roles: Role[]) {
    this.alertService.stopLoadingMessage();
    this.user = user;
    this.allRoles = roles;
    this.emailConfirmed = this.user.emailConfirmed;

    const verificationEmailSent = this.localStorage.getDataObject<boolean>(this.getDBkey_VERIFICATION_EMAIL_SENT(this.user.id));

    if (!verificationEmailSent && !this.emailConfirmed) {
      const sendVerificationEmailWindowsFuncName = 'userinfo_sendVerificationEmail';
      window[sendVerificationEmailWindowsFuncName] = this.sendVerificationEmail.bind(this);

      const confirmEmailMsg = `Your account email has not been verified. <a href="javascript:;" onclick="window.${sendVerificationEmailWindowsFuncName}()">Click here to resend verification email</a>`;
      this.alertService.showStickyMessage('Email not verified!', confirmEmailMsg, MessageSeverity.info, null, () => window[sendVerificationEmailWindowsFuncName] = null);
    }
  }

  private onCurrentUserDataLoadFailed(error: any) {
    this.alertService.stopLoadingMessage();
    this.alertService.showStickyMessage('Load Error', `Unable to retrieve user data from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`,
      MessageSeverity.error, error);

    this.user = new User();
  }

  private loadCurrentUserPasswordStatus() {
    this.accountService.getUserHasPassword()
      .subscribe(hasPassword => {
        this.userHasPassword = hasPassword;
      },
        error => {
          this.alertService.showStickyMessage('Load Error', `Error retrieving user password status from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`,
            MessageSeverity.error, error);
        });
  }

  getGradeDescription(gradeKey: number): string {
    const grade = this.grades.find(g => g.key === gradeKey);
    return grade ? grade.description : 'Description not found';
  }

  sendVerificationEmail() {
    this.ngZone.run(() => {
      this.isSendingEmail = true;
      this.alertService.resetStickyMessage();
      this.alertService.startLoadingMessage('Sending verification email...');

      this.accountService.sendConfirmEmail()
        .subscribe(result => {
          this.isSendingEmail = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage('Verification Email Sent', 'Please check your email', MessageSeverity.success);
          this.localStorage.saveSyncedSessionData(true, this.getDBkey_VERIFICATION_EMAIL_SENT(this.user.id));
        },
          error => {
            this.isSendingEmail = false;
            this.alertService.stopLoadingMessage();
            this.alertService.showStickyMessage('Verification Email Not Sent', `Unable to send verification email.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
              MessageSeverity.error, error);
          });
    });
  }


  getRoleByName(name: string) {
    return this.allRoles.find((r) => r.name === name);
  }



  showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }


  deletePasswordFromUser(user: UserEdit | User) {
    const userEdit = user as UserEdit;

    delete userEdit.currentPassword;
    delete userEdit.newPassword;
    delete userEdit.confirmPassword;
  }


  edit() {
    if (!this.isGeneralEditor) {
      this.isEditingSelf = true;
      this.userEdit = new UserEdit();
      Object.assign(this.userEdit, this.user);
    } else {
      if (!this.userEdit) {
        this.userEdit = new UserEdit();
      }

      this.isEditingSelf = this.accountService.currentUser ? this.userEdit.id === this.accountService.currentUser.id : false;
    }

    // this.isEditMode = true;
    // this.showValidationErrors = true;
    // this.isChangePassword = false;
    console.log(this.userEdit,'this.userEdit')
    this.editingUserName = { name: this.userEdit.userName };
    this.sourceUser = this.userEdit;
    console.log(this.userEditor,this.userEdit, this.allRoles,this.editorModal,'this.userEditor')
    this.editedUser = this.userEditor.editUser(this.userEdit, this.allRoles);
    this.editorModal.show();
  }

   triggerFileInput(key) {
    if(key==="parent"){
      document.getElementById('upload-parent-image').click();
    }else{
      document.getElementById('upload-child-image').click();
    }
  }
  
   previewImage(event,key,childData?) {
    const input = event.target;
    const file = input.files[0];
    this.userEdit = new UserEdit();
    Object.assign(this.userEdit, this.user);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const profileImage = e.target.result;
        if(key === "parent"){
          this.userEdit['profileImage'] = profileImage; 
        }else if(key === "child"){
          let tempChildData = this.rows;
          tempChildData.forEach((child, index) => {
            if(child.id === childData.id){
              child['profileImage'] = profileImage;
            }
          })
          this.rows = tempChildData;
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  save() {
    this.isSaving = true;
    this.alertService.startLoadingMessage('Saving changes...');

    if (this.isNewUser) {
      if (this.isParentuser) {
        this.user.roles = []

        this.user.roles.push('learner');
      } else { delete this.user.gradeId; }
      this.accountService.newUser(this.userEdit).subscribe(user => this.saveSuccessHelper(user), error => this.saveFailedHelper(error));
    } else {
      if (this.isParentuser) {
        this.userEdit.isParent = true;
      }
      this.accountService.updateUser(this.userEdit).subscribe(response => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
    }
  }


  private saveSuccessHelper(user?: User) {
    this.testIsRoleUserCountChanged(this.user, this.userEdit);

    if (user) {
      Object.assign(this.userEdit, user);
    }

    this.isSaving = false;
    this.alertService.stopLoadingMessage();
    this.isChangePassword = false;
    this.showValidationErrors = false;

    this.deletePasswordFromUser(this.userEdit);
    Object.assign(this.user, this.userEdit);
    this.userEdit = new UserEdit();
    this.resetForm();


    if (this.isGeneralEditor) {
      if (this.isNewUser) {
        this.alertService.showMessage('Success', `User \"${this.user.userName}\" was created successfully`, MessageSeverity.success);
      } else if (!this.isEditingSelf) {
        this.alertService.showMessage('Success', `Changes to user \"${this.user.userName}\" was saved successfully`, MessageSeverity.success);
      }
    }

    if (this.isEditingSelf) {
      this.alertService.showMessage('Success', 'Changes to your User Profile was saved successfully', MessageSeverity.success);
      this.refreshLoggedInUser();
    }

    this.isEditMode = false;


    if (this.changesSavedCallback) {
      this.changesSavedCallback();
    }
  }


  private saveFailedHelper(error: any) {
    this.isSaving = false;
    this.alertService.stopLoadingMessage();
    this.alertService.showStickyMessage('Save Error', 'The below errors occured whilst saving your changes:', MessageSeverity.error, error);
    this.alertService.showStickyMessage(error, null, MessageSeverity.error);

    if (this.changesFailedCallback) {
      this.changesFailedCallback();
    }
  }



  private testIsRoleUserCountChanged(currentUser: User, editedUser: User) {

    const rolesAdded = this.isNewUser ? editedUser.roles : editedUser.roles.filter(role => currentUser.roles.indexOf(role) === -1);
    const rolesRemoved = this.isNewUser ? [] : currentUser.roles.filter(role => editedUser.roles.indexOf(role) === -1);

    const modifiedRoles = rolesAdded.concat(rolesRemoved);

    if (modifiedRoles.length) {
      setTimeout(() => this.accountService.onRolesUserCountChanged(modifiedRoles));
    }
  }



  cancel() {
    if (this.isGeneralEditor) {
      this.userEdit = this.user = new UserEdit();
    } else {
      this.userEdit = new UserEdit();
    }

    this.showValidationErrors = false;
    this.resetForm();

    this.alertService.showMessage('Cancelled', 'Operation cancelled by user', MessageSeverity.default);
    this.alertService.resetStickyMessage();

    if (!this.isGeneralEditor) {
      this.isEditMode = false;
    }

    if (this.changesCancelledCallback) {
      this.changesCancelledCallback();
    }
  }


  close() {
    this.userEdit = this.user = new UserEdit();
    this.showValidationErrors = false;
    this.resetForm();
    this.isEditMode = false;

    if (this.changesSavedCallback) {
      this.changesSavedCallback();
    }
  }



  private refreshLoggedInUser() {
    this.accountService.refreshLoggedInUser()
      .subscribe(user => {
        this.loadCurrentUserData();
      },
        error => {
          this.alertService.resetStickyMessage();
          this.alertService.showStickyMessage('Refresh failed', 'An error occured whilst refreshing logged in user information from the server', MessageSeverity.error, error);
        });
  }


  changePassword() {
    this.isChangePassword = true;
  }


  unlockUser() {
    this.isSaving = true;
    this.alertService.startLoadingMessage('Unblocking user...');


    this.accountService.unblockUser(this.userEdit.id)
      .subscribe(() => {
        this.isSaving = false;
        this.userEdit.isLockedOut = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showMessage('Success', 'User has been successfully unblocked', MessageSeverity.success);
      },
        error => {
          this.isSaving = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showStickyMessage('Unblock Error', 'The below errors occured whilst unblocking the user:', MessageSeverity.error, error);
          this.alertService.showStickyMessage(error, null, MessageSeverity.error);
        });
  }


  resetForm(replace = false) {
    this.isChangePassword = false;

    if (!replace) {
      this.form.reset();
    } else {
      this.formResetToggle = false;

      setTimeout(() => {
        this.formResetToggle = true;
      });
    }
  }


  newUser(allRoles: Role[]) {
    this.isGeneralEditor = true;
    this.isNewUser = true;

    this.allRoles = [...allRoles];
    this.user = this.userEdit = new UserEdit();
    this.userEdit.isEnabled = true;
    this.edit();

    return this.userEdit;
  }

  editUser(user: User, allRoles: Role[]) {
    if (user) {
      this.isGeneralEditor = true;
      this.isNewUser = false;

      this.setRoles(user, allRoles);
      this.user = new User();
      this.userEdit = new UserEdit();
      Object.assign(this.user, user);
      Object.assign(this.userEdit, user);
      this.edit();

      if (this.isEditingSelf) {
        this.loadCurrentUserPasswordStatus();
      }

      return this.userEdit;
    } else {
      return this.newUser(allRoles);
    }
  }


  displayUser(user: User, allRoles?: Role[]) {

    this.user = new User();
    Object.assign(this.user, user);
    this.deletePasswordFromUser(this.user);
    this.setRoles(user, allRoles);

    this.isEditMode = false;
  }



  private setRoles(user: User, allRoles?: Role[]) {

    this.allRoles = allRoles ? [...allRoles] : [];

    if (user.roles) {
      for (const ur of user.roles) {
        if (!this.allRoles.some(r => r.name === ur)) {
          this.allRoles.unshift(new Role(ur));
        }
      }
    }
  }

  private getDBkey_VERIFICATION_EMAIL_SENT(userId: string) {
    return `verification_email_sent:${userId}`;
  }

  addNewUserToList() {
    if (this.sourceUser) {
      Object.assign(this.sourceUser, this.editedUser);

      let sourceIndex = this.rowsCache.indexOf(this.sourceUser, 0);
      if (sourceIndex > -1) {
        Utilities.moveArrayItem(this.rowsCache, sourceIndex, 0);
      }

      sourceIndex = this.rows.indexOf(this.sourceUser, 0);
      if (sourceIndex > -1) {
        Utilities.moveArrayItem(this.rows, sourceIndex, 0);
      }

      this.editedUser = null;
      this.sourceUser = null;
    } else {
      const user = new User();
      Object.assign(user, this.editedUser);
      this.editedUser = null;

      let maxIndex = 0;
      for (const u of this.rowsCache) {
        if ((u as any).index > maxIndex) {
          maxIndex = (u as any).index;
        }
      }

      (user as any).index = maxIndex + 1;

      this.rowsCache.splice(0, 0, user);
      this.rows.splice(0, 0, user);
      this.rows = [...this.rows];
    }
  }


  loadData() {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;

    if (this.canViewRoles) {
      this.accountService.getUsersAndRoles().subscribe(results => this.onDataLoadSuccessful(results[0], results[1]), error => this.onDataLoadFailed(error));
    } else {
      this.accountService.getUsers().subscribe(users => this.onDataLoadSuccessful(users, this.accountService.currentUser.roles.map(x => new Role(x))), error => this.onDataLoadFailed(error));
    }
  }

  mapGrade(user){
    let gradeName = "";
    this.grades?.map((grade)=>{
      if(grade?.key === user?.gradeId){
        gradeName= grade?.value
      }
    })
    return gradeName;
  }

  onDataLoadSuccessful(users: User[], roles: Role[]) {
    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;

    users.forEach((user, index) => {
      (user as any).index = index + 1;
    });

    users?.forEach((user:any)=>{
      user['grade'] = this.mapGrade(user);
    })
    this.rowsCache = [...users];
    this.rows = users;
    this.allRoles = roles;
  }


  onDataLoadFailed(error: any) {
    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;

    this.alertService.showStickyMessage('Load Error', `Unable to retrieve users from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`,
      MessageSeverity.error, error);
  }


  onSearchChanged(value: string) {
    this.rows = this.rowsCache.filter(r => Utilities.searchArray(value, false, r.userName, r.fullName, r.email, r.phoneNumber, r.jobTitle, r.roles));
  }

  onEditorModalHidden() {
    this.editingUserName = null;
    this.userEditor.resetForm(true);
  }


  newChildUser() {
    this.editingUserName = null;
    this.sourceUser = null;
    this.editedUser = this.userEditor.newUser(this.allRoles);
    this.editorModal.show();
  }


  editChildUser(row: UserEdit) {
    this.editingUserName = { name: row.userName };
    this.sourceUser = row;
    console.log(this.userEditor,row, this.allRoles,this.editorModal,'this.userEditor')
    this.editedUser = this.userEditor.editUser(row, this.allRoles);
    this.editorModal.show();
  }


  deleteUser(row: UserEdit) {
    this.alertService.showDialog('Are you sure you want to delete \"' + row.userName + '\"?', DialogType.confirm, () => this.deleteUserHelper(row));
  }


  deleteUserHelper(row: UserEdit) {

    this.alertService.startLoadingMessage('Deleting...');
    this.loadingIndicator = true;

    this.accountService.deleteUser(row)
      .subscribe(results => {
        this.alertService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.rowsCache = this.rowsCache.filter(item => item !== row);
        this.rows = this.rows.filter(item => item !== row);
      },
        error => {
          this.alertService.stopLoadingMessage();
          this.loadingIndicator = false;

          this.alertService.showStickyMessage('Delete Error', `An error occured whilst deleting the user.\r\nError: "${Utilities.getHttpResponseMessages(error)}"`,
            MessageSeverity.error, error);
        });
  }



  get canViewRoles() {
    return this.accountService.userHasPermission(Permission.viewRolesPermission);
  }

  get canManageUsers() {
    return this.accountService.userHasPermission(Permission.manageUsersPermission);
  }

  get canViewAllRoles() {
    return this.accountService.userHasPermission(Permission.viewRolesPermission);
  }

  get canAssignRoles() {
    return this.accountService.userHasPermission(Permission.assignRolesPermission);
  }
}
