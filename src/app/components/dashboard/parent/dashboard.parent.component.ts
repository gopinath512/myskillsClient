import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AlertService, DialogType, MessageSeverity } from '../../../services/alert.service';
import { AppTranslationService } from '../../../services/app-translation.service';
import { AccountService } from '../../../services/account.service';
import { Utilities } from '../../../services/utilities';
import { User } from '../../../models/user.model';
import { Role } from '../../../models/role.model';
import { Permission } from '../../../models/permission.model';
import { UserEdit } from '../../../models/user-edit.model';
import { UserInfoComponent } from '../../controls/user-info.component';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfigurationService } from '../../../services/configuration.service';
import { AuthService } from '../../../services/auth.service';
import { ReferenceDataService } from '../../../services/Reference/reference-data.service';
interface WidgetIndex { element: string, index: number }
import { fadeInOut } from '../../../services/animations';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ReferenceDataViewModel } from '../../../models/ReferenceModel/reference.model';

@Component({
  selector: 'app-dashboard.parent',
  templateUrl: './dashboard.parent.component.html',
  styleUrls: ['./dashboard.parent.component.scss'],
  animations: [fadeInOut]
})
export class DashboardParentComponent implements OnInit {

  columns: any[] = [];
  rows: User[] = [];
  rowsCache: User[] = [];
  editedUser: UserEdit;
  sourceUser: UserEdit;
  editingUserName: { name: string };
  loadingIndicator: boolean;
  startDate: Date;
  endDate: Date;
  parentChildReport: any;
  childrenPerformanceReport: any;
  recommendationsForChild: any;
  recentActivitiesForChild: any;
  inProgressTestsOfChild: any;
  grades: ReferenceDataViewModel[] = [];
  isChildCheckCompleted = false;
  expandedChildIds: Set<string> = new Set();

  allRoles: Role[] = [];
  readonly DBKeyWidgetsOrder = 'home-component.widgets_order';

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

  @ViewChild('userEditor', { static: true })
  userEditor: UserInfoComponent;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Labels and Data
  completePercent = 70;
  inProgressPercent = 30;
  completeLabel = 'Complete';
  inProgressLabel = 'In Progress';

  // Chart Options
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    // 👇👇 this casting shuts up TypeScript
  };

  doughnutChartColors = [
    {
      backgroundColor: ['#4caf50', '#f44336'], // Green for completed, red for incomplete
    }
  ];

  donutData = [
    {
      "name": "Critical",
      "value": 40
    },
    {
      "name": "Incomplete",
      "value": 60
    }
  ];

  // Control variable for "View More" functionality
  showMoreActivities = false;
  currentTestDetails = {};

  constructor(private authService: AuthService,private alertService: AlertService, private translationService: AppTranslationService, private accountService: AccountService, private router: Router, public configurations: ConfigurationService,  private referenceDataService: ReferenceDataService) {
  }



  ngOnInit() {

    const gT = (key: string) => this.translationService.getTranslation(key);

    this.columns = [
      { prop: 'index', name: '#', width: 40, cellTemplate: this.indexTemplate, canAutoResize: false },
      /*  { prop: 'jobTitle', name: gT('users.management.Title'), width: 50 },*/
      { prop: 'userName', name: gT('users.management.UserName'), width: 90, cellTemplate: this.userNameTemplate, cellClicked: (row) => this.onUserNameClick.bind(this) },

      { prop: 'fullName', name: gT('users.management.FullName'), width: 120 },
      { prop: 'email', name: gT('users.management.Email'), width: 140 },
      /*{ prop: 'roles', name: gT('users.management.Roles'), width: 120, cellTemplate: this.rolesTemplate },*/
      /*{ prop: 'phoneNumber', name: gT('users.management.PhoneNumber'), width: 100 }*/
    ];

    if (this.canManageUsers) {
      this.columns.push({ name: '', width: 160, cellTemplate: this.actionsTemplate, resizeable: false, canAutoResize: false, sortable: false, draggable: false });
    }

    this.loadData();
    this.parentReport();
    this.childrenPerformance();
    this.recommendations();
    this.getGrades();
    this.recentActivities();
    this.inProgressTests();
  }

  toggleChild(childId: string): void {
    if (this.expandedChildIds.has(childId)) {
      this.expandedChildIds.delete(childId);
    } else {
      this.expandedChildIds.add(childId);
    }
  }
  
  isExpanded(childId: string): boolean {
    return this.expandedChildIds.has(childId);
  }

  hasRecommendations(child: any): boolean {
    return child.subjects?.some(subject =>
      (subject.high && subject.high.length > 0) ||
      (subject.medium && subject.medium.length > 0) ||
      (subject.low && subject.low.length > 0)
    );
  }

  getGrades(): void {
    this.referenceDataService.getGrades()
      .subscribe(grades => {
        this.grades = grades;
        // You can now work with the 'grades' array in your component
      });
  }

  childGrade(child) {
    if (this.grades && child && child.gradeId) {
      return this.grades.find(item => item.key == child?.gradeId)?.description;
    }
    // return this.grades.find(item => item.key == child?.gradeId)?.description;
    return '-';
  }

  drop(event: CdkDragDrop<HTMLDivElement>) {
    const el = event.item.element.nativeElement;
    const parentEle = event.container.element.nativeElement;
    const anchorEle = parentEle.children[event.currentIndex];

    const widgetIndexes = new Array<WidgetIndex>(parentEle.children.length);

    for (var i = 0; i < parentEle.children.length; i++) {
      widgetIndexes[i] = { element: parentEle.children[i].id, index: i };
    }

    moveItemInArray(widgetIndexes, event.previousIndex, event.currentIndex)

    for (var i = 0; i < widgetIndexes.length; i++) {
      widgetIndexes[i].index = i;
    }

    if (event.currentIndex < event.previousIndex)
      parentEle.insertBefore(el, anchorEle);
    else
      parentEle.insertBefore(el, anchorEle.nextElementSibling);

    this.saveWidgetIndexes(widgetIndexes);
  }

  ngAfterViewInit() {

   this.userEditor.changesSavedCallback = () => {
     this.addNewUserToList();
     this.editorModal.hide();
     this.parentReport();              // Reload parent-child summary
     this.childrenPerformance();
     
   };

   this.userEditor.changesCancelledCallback = () => {
     this.editedUser = null;
     this.sourceUser = null;
     this.editorModal.hide();
   };
  }
  saveWidgetIndexes(indexes: WidgetIndex[]) {
    this.configurations
      .saveConfiguration(indexes, `${this.DBKeyWidgetsOrder}:${this.authService.currentUser?.id}`);
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

  parentReport(): void {
    this.accountService.getParentReport()
      .subscribe(parentReport => {
        this.parentChildReport = parentReport;
      });
  }

  childrenPerformance(): void {
    this.accountService.getChildrenPerformanceReport()
      .subscribe(childrenPerformance => {
        this.childrenPerformanceReport = childrenPerformance;
      });
  }

  recommendations(): void {
    this.accountService.getRecommendations()
      .subscribe(recommendations => {
        this.recommendationsForChild = recommendations;
      });
  }

  recentActivities(): void {
    this.accountService.getRecentActivities()
      .subscribe(recentActivities => {
        this.recentActivitiesForChild = recentActivities;
        console.log(this.recentActivities, "recentActivities")
      });
  }

  inProgressTests(): void {
    this.accountService.getInProgressTests()
      .subscribe(inProgressTests => {
        this.inProgressTestsOfChild = inProgressTests;
      });
  }

  get testProgressData() {
    if (this.parentChildReport?.testsCreated == 0) {
      return '-';
    }
    return `${this.parentChildReport?.testsInProgress} / ${this.parentChildReport?.testsCreated}`;    
  }

  testStatus(subjectData) {
    if (!subjectData && !subjectData?.topicsAttempted && !subjectData?.totalTopics) {
      return 'No data available';
    }

    return `${subjectData?.topicsAttempted}/${subjectData.totalTopics}`
  }

  getBadgeClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-success';
      case 'intermediate':
        return 'bg-warning';
      case 'advanced':
        return 'bg-danger';
      default:
        return 'bg-secondary'; // fallback
    }
  }

  createTest() {
    this.router.navigate(['/createtestsparent']);
  }

  onDataLoadSuccessful(users: User[], roles: Role[]) {
    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;

    users.forEach((user, index) => {
      (user as any).index = index + 1;
    });

    this.rowsCache = [...users];
    this.rows = users;

    this.allRoles = roles;
    this.isChildCheckCompleted = true;
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


  newUser() {
    this.editingUserName = null;
    this.sourceUser = null;
    this.editedUser = this.userEditor.newUser(this.allRoles);
    this.editorModal.show();
  }


  editUser(row: UserEdit) {
    this.editingUserName = { name: row.userName };
    this.sourceUser = row;
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



  get canAssignRoles() {
    return this.accountService.userHasPermission(Permission.assignRolesPermission);
  }

  get canViewRoles() {
    return this.accountService.userHasPermission(Permission.viewRolesPermission);
  }

  get canManageUsers() {
    return this.accountService.userHasPermission(Permission.manageUsersPermission);
  }

  get canParentUsers() {
    return this.accountService.userHasPermission(Permission.manageUsersPermission);
  }

  get userName(): string {
    return this.authService.currentUser ? this.authService.currentUser.userName : '';
  }

  get isChildAvailable() {
    // return (this?.rows?.length > 0) ? false : true ;
    if (!this.isChildCheckCompleted) return null; // render nothing
    return this.rows.length === 0;
  }

  onUserNameClick(event: any, row: any) {
    // Extract the ID from the clicked row, assuming there is a 'id' property in your data
    const userId = row.id;
    console.log('hellow');
    // Navigate to the learner page with the ID as a parameter
    this.router.navigate(['/lernerdashboard', userId]);
  }


  // Method to view test details
  viewTestDetails(activity) {
    // Retrieve the test details based on the testId or other identifier
    // Here, we're using hardcoded data for simplicity
    if (activity.testId === 1) {
      this.currentTestDetails = {
        testName: 'Math Test',
        score: 85,
        completedOn: activity.activityDate,
        answers: [
          {
            question: 'What is 2 + 2?',
            yourAnswer: '4',
            correctAnswer: '4'
          },
          {
            question: 'What is 3 * 3?',
            yourAnswer: '9',
            correctAnswer: '9'
          }
        ]
      };
    } else if (activity.testId === 2) {
      this.currentTestDetails = {
        testName: 'Science Test',
        score: 90,
        completedOn: activity.activityDate,
        answers: [
          {
            question: 'What is the chemical symbol for water?',
            yourAnswer: 'H2O',
            correctAnswer: 'H2O'
          },
          {
            question: 'What is the speed of light?',
            yourAnswer: '299,792,458 m/s',
            correctAnswer: '299,792,458 m/s'
          }
        ]
      };
    }

    // Trigger modal to display test details
   // $('#testDetailsModal').modal('show'); // Use jQuery to open the modal
  }

  newChildUser() {
    this.editingUserName = null;
    this.sourceUser = null;
    this.editedUser = this.userEditor.newUser(this.allRoles);
    this.editorModal.show();
  }
}
