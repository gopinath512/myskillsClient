import { Component, ElementRef, OnInit, Renderer2, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TestService } from '../../services/tests/test.service';
import { Router } from '@angular/router';
import { TestViewModel } from '../../models/tests/test.model';
import { userToAssignTest } from '../../models/user/user.model';
import { AccountService } from '../../services/account.service';
import { QuestionViewModel } from '../../models/question/question.model';
import { ExamDetails } from '../../models/tests/examDetails';
import { TestResultService } from '../../services/testResult/test-result.service';
import { Permission } from '../../models/permission.model';
import { AlertService, DialogType, MessageSeverity } from '../../services/alert.service';
import { TestStatusViewModel } from '../../models/enums';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CreatetestsComponent } from './create/createtests.component';
import { ResultQuestion } from '../../models/testResult/result-question.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.scss']
})
export class TestsComponent implements OnInit {
  tests: any[] = [];
  columns: any[] = [];
  attemptIds: number[] = [];
  TestStatusViewModel = TestStatusViewModel;
  selectedAttemptId: number | null = null;
  completedTests: any[] = [];
  inProgressTests: any[] = [];
  selectedTestId: number;
  selectedTest: TestViewModel;
  resultQuestions: ResultQuestion[] = [];
  isEditingIndex: number | null = null;
  // activeTab: TestStatusViewModel = TestStatusViewModel.InProgress;

  searchQuery: string = ''; // Add this line for search functionality
  questionModel: QuestionViewModel
  @ViewChild('assignStudentsModalRef') private assignStudentsModalRef: ElementRef;
  @ViewChild('viewQuestionsModalRef') private viewQuestionsModalRef: ElementRef;
  @ViewChild('attemptModalRef') private attemptModalRef: ElementRef;

  @ViewChild('createtestsRef') testEditoruser: CreatetestsComponent;

  @ViewChild('testEditorModal', { static: true })
  editorModal: ModalDirective;

  testId: number | null = null;
  learnerId: string
  loadingIndicator: boolean;
  selectedRow: any[] = []; // Holds the currently selected row
  selectedRowIndex: number | null = null;
  isResume: boolean = false; // This will determine whether to resume the test

  upcomingTests: TestViewModel[] = [];
  filteredUpcomingTests: TestViewModel[] = [];
  filteredInProgressTests: TestViewModel[] = [];
  filteredCompletedTests: TestViewModel[] = [];


  unassignedStudents: userToAssignTest[] = [

  ];

  allStudents: userToAssignTest[] = [
    { id: '1', fullName: 'Jane Phillips', email: '', userName: '' },
    { id: '2', fullName: 'Jennifer Hurrell', email: '', userName: '' },
    { id: '3', fullName: 'Jonathan Potter', email: '', userName: '' },
    { id: '4', fullName: 'Lucy Pevensie', email: '', userName: '' }
  ];

  @ViewChild('attemptTemplate', { static: true })
  attemptTemplate: TemplateRef<any>;

  @ViewChild('assignTemplate', { static: true })
  assignTemplate: TemplateRef<any>;

  @ViewChild('rolesTemplate', { static: true })
  rolesTemplate: TemplateRef<any>;

  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate: TemplateRef<any>;

  defaultTabIndex: number = 1;
  activeTab: TestStatusViewModel = TestStatusViewModel.InProgress;

  selectedItem: any = null;

  assignedStudents: userToAssignTest[] = [];

  constructor(private changeDetectorRef: ChangeDetectorRef, private testService: TestService, private accountService: AccountService, private router: Router, private authService: AuthService, private renderer: Renderer2, private testResultService: TestResultService, private alertService: AlertService, private elRef: ElementRef) { }

  ngOnInit() {
    this.learnerId = this.authService.currentUser?.id;
    this.openTab(this.activeTab);
    this.columns = [
      { prop: 'title', name: 'Name' },
      { prop: 'grade', name: 'Year' },
      { prop: 'subject', name: 'Subject' },
      // { prop: 'assign', name: 'Assign Students', cellTemplate: this.assignTemplate }
      /* { name: 'Actions', cellTemplate: this.actionsTemplate }*/
    ];

    if (this.canTakeTest) {
      this.columns.push({
        prop: 'attemptCount',
        name: 'Attempts',
        cellTemplate: this.attemptTemplate,
      });
    } else {
      this.columns.push({
        prop: 'assign',
        name: 'Assign Students',
        cellTemplate: this.assignTemplate,
      });
    }


    this.columns.push({
      prop: 'Actions',
      name: 'Actions',
      cellTemplate: this.actionsTemplate,
    });

    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;


    this.openTab(TestStatusViewModel.InProgress);
    console.log('Tabbbbbb')
    //this.testService.filterTests(TestStatusViewModel.InProgress).subscribe({
    //  next: (data) => {
    //    // Reset categories each time tests are fetched
    //    this.upcomingTests = [];
    //    this.inProgressTests = [];
    //    this.completedTests = [];

    //    data.forEach(test => {
    //      // Assuming 'status' is the property in your TestViewModel
    //      // and it directly matches the values in TestStatusViewModel
    //      switch (test.status) {
    //        case TestStatusViewModel.Upcoming:
    //          this.upcomingTests.push(test);
    //          break;
    //        case TestStatusViewModel.InProgress:
    //          this.inProgressTests.push(test);
    //          break;
    //        case TestStatusViewModel.Completed:
    //          this.completedTests.push(test);
    //          break;
    //        default:
    //          // Handle any tests that don't match the expected statuses
    //          console.warn('Unknown test status:', test.status);
    //      }
    //      this.filterTests();
    //      this.prepareStudentLists();
    //      this.loadingIndicator = false;
    //    });

    //    this.loadingIndicator = false;
    //  },
    //  error: (error) => {
    //    console.error('Failed to load tests:', error);
    //    this.loadingIndicator = false;
    //  }
    //});

  }

  ngAfterViewInit(): void {
    this.updateActionButtons();
  }
  

  onRowSelect(item: any, rowIndex: number): void {
    this.selectedTest = item;  // Select the clicked row's test
    this.selectedRowIndex = rowIndex;
    console.log('Selected test:', item);
    console.log('Selected row index:', rowIndex);
  }
  
  // This method will handle the radio button change
  onRadioChange(item: any): void {
    this.selectedTest = item;
    console.log('Radio button selected:', item);
  }

  onAttemptSelected(): void {
    if (this.selectedItem) {
      console.log(`Attempt clicked for: ${this.selectedItem.title}`);
      this.showAttemptModal(this.selectedItem.id);
    }
  }
  
  onAssignSelected(): void {
    if (this.selectedItem) {
      console.log(`Assign clicked for: ${this.selectedItem.title}`);
      this.showAssignedUsers(this.selectedItem.id);
      // Logic for "Assign Students" action based on selectedItem
    }
  }

  refreshData() {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;


    this.openTab(TestStatusViewModel.InProgress);
    this.editorModal.hide();
  }

  prepareStudentLists() {
    // Initialize unassignedStudents by excluding those already assigned

    this.accountService.getUsersForAssign().subscribe(results => this.onDataLoadSuccessful(results), error => this.onDataLoadFailed(error));


    console.log(this.unassignedStudents);
  }

  hideAttemptModal() {
    // Logic to hide the modal
  }
  fetchAttemptIds(testid) {
    // const testId = 1; // Obtain this from your route or another sourc
    console.log("fetchAttemptIds");
    console.log(this.selectedTest);
    this.showAttemptModalRefModal();
    this.selectedTestId = testid;
    //this.testResultService.getNumberOfAttempts(testid, '').subscribe(attemptIds => {
    //  this.attemptIds = attemptIds;
    //  this.showAttemptModalRefModal();
    //  // this.selectedTest.id = testId;
    //});
  }

  navigateToTestResult(attemptId: number) {
    //this.testResultService.getTestResult(this.selectedTestId,attemptId).subscribe(result => {
    //  this.resultQuestions = result;
    //  // Optionally refresh part of the modal if needed
    //});

    this.testResultService.getTestResult(this.selectedTestId, attemptId, this.authService.currentUser?.id).subscribe({
      next: (data) => {
        this.resultQuestions = data;
        // You might need to refresh or trigger change detection manually if necessary
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => console.error('Failed to fetch attempt details', err)
    });
  }

  showAttemptModal(testId: number) {
    this.fetchAttemptIds(testId);
    // Code to display the modal goes here. You might need a separate method to show the modal depending on how it's implemented.
    //  this.showAttemptModalRefModal(); // This assumes you have a showModal method already defined for showing modals.

    // this.selectedTest.id = testId;
  }

  //navigateToTestResult(attemptId: number) {
  //  // Navigate to the TestResultComponent with parameters
  //  this.router.navigate(['/testResult', this.selectedTestId, attemptId]);
  //}

  onSelectAttempt(testId: number, attemptId: number) {
    this.selectedAttemptId = attemptId;
    // Now you can make another request to the backend to fetch data for this attempt
    this.testResultService.getTestResult(testId, attemptId, this.authService.currentUser?.id).subscribe(data => {
      // Process and display the fetched data
    });
  }

  updateAssignedStudents(assigned: userToAssignTest[]) {
    this.assignedStudents = assigned;

    this.prepareStudentLists(); // Refresh the available and assigned lists
  }

  addStudent(student: userToAssignTest) {
    // Add to the assigned list
    this.assignedStudents.push(student);

    // Remove from the unassigned list
    // this.unassignedStudents = this.unassignedStudents.filter(s => s.id !== student.id);

    this.unassignedStudents = this.unassignedStudents.filter(student =>
      !this.assignedStudents.some(assignedStudent => assignedStudent.id === student.id)
    );

    // If you need to update this on the server, call your service here
    // this.testService.assignStudentToTest(testId, student.id).subscribe(...);
  }

  removeStudent(student: userToAssignTest) {
    // Add back to the unassigned list
    this.unassignedStudents.push(student);

    // Remove from the assigned list
    this.assignedStudents = this.assignedStudents.filter(s => s.id !== student.id);

    // If you need to update this on the server, call your service here
    // this.testService.unassignStudentFromTest(testId, student.id).subscribe(...);
  }

  //filterTests() {
  //  this.inProgressTests = this.tests.filter(test => test.status !== 'Completed');
  //  this.completedTests = this.tests.filter(test => test.status === 'Completed');
  //  // Apply search filter if searchQuery is not empty
  //  if (this.searchQuery) {
  //    this.inProgressTests = this.inProgressTests.filter(test => test.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
  //    this.completedTests = this.completedTests.filter(test => test.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
  //  }
  //}

  // Example filter function
  filterTestsByQuery(query: string) {
    //if (!query) {
    //  return; // Skip filtering if the query is empty
    //}

    // Filter based on the active tab
    switch (this.activeTab) {
      case TestStatusViewModel.Upcoming:
        this.filteredUpcomingTests = this.upcomingTests.filter(test =>
          test.title.toLowerCase().includes(query.toLowerCase()) // Assuming there's a 'title' property to filter by
        );
        break;
      case TestStatusViewModel.InProgress:
        this.filteredInProgressTests = this.inProgressTests.filter(test =>
          test.title.toLowerCase().includes(query.toLowerCase())
        );
        break;
      case TestStatusViewModel.Completed:
        this.filteredCompletedTests = this.completedTests.filter(test =>
          test.title.toLowerCase().includes(query.toLowerCase())
        );
        break;
      default:
      // Handle any other cases or default behavior
    }
  }


  filterdetailsTestsByStatus(status) {
    switch (status) {
      case TestStatusViewModel.InProgress:
        return this.inProgressTests; // Assuming this is already filtered as shown in your example
      case TestStatusViewModel.Upcoming:
        return this.upcomingTests; // Assuming you have a similar logic to populate this
      case TestStatusViewModel.Completed:
        return this.completedTests; // Assuming this is already filtered as shown in your example
      default:
        return []; // Return an empty array if the status doesn't match any category
    }
  }

  // onTabChange(event: any): void {
  //   const selectedIndex = event.index;
  //   if (selectedIndex === 0) {
  //     this.activeTab = 'pending';
  //   } else if (selectedIndex === 1) {
  //     this.activeTab = 'inprogress';
  //   } else if (selectedIndex === 2) {
  //     this.activeTab = 'completed';
  //   }
  // }

  onTabChange(event: any): void {
    const tabLabel = event.tab.textLabel;  // Get the label (name) of the selected tab
    console.log('tab label -', tabLabel);
    console.log('tab label Event-', event);
    let status: TestStatusViewModel;
  
    // Map the selected tab label to the corresponding TestStatusViewModel
    switch (tabLabel) {
      case 'Pending':
        status = TestStatusViewModel.Upcoming;
        break;
      case 'In Progress':
        status = TestStatusViewModel.InProgress;
        break;
      case 'Completed':
        status = TestStatusViewModel.Completed;
        break;
      default:
        return; // If the tab label doesn't match, exit
    }
  
    // Set active tab
    this.activeTab = status;
    console.log('Active Tab', this.activeTab);
  
    // Show loading indicator
    this.loadingIndicator = true;
  
    // Call the service to fetch tests based on selected status
    this.testService.filterTests(status).subscribe({
      next: (data) => {
        // Clear current lists
        this.upcomingTests = [];
        this.inProgressTests = [];
        this.completedTests = [];
  
        // Populate the respective array based on selected status
        switch (status) {
          case TestStatusViewModel.Upcoming:
            this.upcomingTests = data;
            this.filteredUpcomingTests = [...data];
            break;
          case TestStatusViewModel.InProgress:
            this.inProgressTests = data;
            this.filteredInProgressTests = [...data];
            break;
          case TestStatusViewModel.Completed:
            this.completedTests = data;
            this.filteredCompletedTests = [...data];
            break;
        }
  
        // Prepare student lists or any other additional processing
        this.prepareStudentLists();
  
        // Stop the loading indicator after data is fetched
        this.loadingIndicator = false;
        this.alertService.stopLoadingMessage();
      },
      error: (error) => {
        // Handle error
        console.error('Error fetching tests:', error);
        this.loadingIndicator = false;
        this.alertService.stopLoadingMessage();
      }
    });
  }
  


  onSearchChanged(value: string) {
    this.searchQuery = value;
    this.filterTestsByQuery(this.searchQuery);
    // this.rows = this.rowsCache.filter(r => Utilities.searchArray(value, false, r.userName, r.fullName, r.email, r.phoneNumber, r.jobTitle, r.roles));
  }


  editTest(testId: number) {
    //this.isEditingIndex = index;
    console.log('on EDIT');
    console.log(this.selectedTestId);
    this.openTestEditor(testId);
    //this.router.navigate(['/createtests'], { queryParams: { testId: testId } });
  }

  //selectTab(tabName: string) {
  //  this.selectedTab = tabName;
  //  // Optionally, refresh the tests list or apply other logic here
  //}

  //onSearch(value: string) {
  //  this.searchQuery = value;
  //  this.filterTests(); // Re-filter tests based on the current search query
  //}

  removeTest(index: number) {
    this.alertService.showDialog('Are you sure you want to delete ?', DialogType.confirm, () => this.deleteUserHelper(index));


    //const isConfirmed = confirm('Are you sure you want to remove this test?');
    //if (isConfirmed) {
    //  // Call your service to remove the test
    //  this.testService.removeTest(index).subscribe(
    //    data => {

    //    },
    //    error => console.error(error)
    //  );
    //  this.isEditingIndex = null;
    //}

    // Add logic to remove a test, then refresh the lists
  }

  deleteUserHelper(index: number) {
    this.testService.removeTest(index).subscribe(
      data => {

      },
      error => console.error(error)
    );
    this.isEditingIndex = null;
  }

  saveTest(test, index: number) {
    console.log('Saving Test:', test);
    this.testService.updateTest(test, index).subscribe(
      data => {

      },
      error => console.error(error)
    );
    // Add logic to save the test, then reset editing state and refresh the lists
    this.isEditingIndex = null;
  }

  showAssignedUsers(test) {
    // this.prepareStudentLists();
    this.testService.getAssignedUsersForTest(test.id).subscribe(results => this.onDataLoadSuccessfulForShowAssignedUser(results, test), error => this.onDataLoadFailedForShowAssignedUser(error));


    // this.accountService.getUsersForAssign().subscribe(results => this.onDataLoadSuccessful(results[0]), error => this.onDataLoadFailed(error));
    console.log(this.selectedTest);
    console.log('Assigned users for test:', test);
    // Add logic to display assigned users
  }

  showModal() {
    this.renderer.addClass(this.assignStudentsModalRef.nativeElement, 'show');
    this.renderer.setStyle(this.assignStudentsModalRef.nativeElement, 'display', 'block');
    this.renderer.setAttribute(this.assignStudentsModalRef.nativeElement, 'aria-modal', 'true');
    this.renderer.setAttribute(this.assignStudentsModalRef.nativeElement, 'role', 'dialog');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  showAttemptModalRefModal() {
    this.renderer.addClass(this.attemptModalRef.nativeElement, 'show');
    this.renderer.setStyle(this.attemptModalRef.nativeElement, 'display', 'block');
    this.renderer.setAttribute(this.attemptModalRef.nativeElement, 'aria-modal', 'true');
    this.renderer.setAttribute(this.attemptModalRef.nativeElement, 'role', 'dialog');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  hideAttemptModalRefModal() {
    this.renderer.removeClass(this.attemptModalRef.nativeElement, 'show');
    this.renderer.removeStyle(this.attemptModalRef.nativeElement, 'display');
    this.renderer.removeStyle(document.body, 'overflow');
  }


  hideModal() {
    this.renderer.removeClass(this.assignStudentsModalRef.nativeElement, 'show');
    this.renderer.removeStyle(this.assignStudentsModalRef.nativeElement, 'display');
    this.renderer.removeStyle(document.body, 'overflow');
  }

  onDataLoadFailed(error: any) {

  }

  //onDataLoadSuccessfulForShowAssignedUser(result: any, test: any) {
  //  this.selectedTest = test;

  //}

  onDataLoadSuccessfulForShowAssignedUser(results: any, test: any) {
    this.assignedStudents = results.flatMap(result =>
      result.assignedToUserIds.map(userId => {
        // Find the student in allStudents matching the current userId
        const matchingStudent = this.allStudents.find(student => student.id === userId);

        // If a matching student is found, use their details; otherwise, use placeholders
        return {
          id: userId,
          fullName: matchingStudent ? matchingStudent.fullName : 'Name Placeholder',
          userName: matchingStudent ? matchingStudent.userName : 'UserName Placeholder',
          email: matchingStudent ? matchingStudent.email : 'Email Placeholder'
        };
      })
    );

    this.unassignedStudents = this.allStudents.filter(student =>
      !this.assignedStudents.some(assignedStudent => assignedStudent.id === student.id)
    );
    console.log('onDataLoadSuccessfulForShowAssignedUser');
    console.log(this.assignedStudents);

    this.selectedTest = test;
    this.showModal();
  }


  onDataLoadFailedForShowAssignedUser(result: any) {

  }

  onDataLoadSuccessful(result: any) {
    console.log(result);
    this.allStudents = result;
    console.log('gopinath');
    console.log(result);
    // this.unassignedStudents = this.allStudents.filter(s => !this.assignedStudents.includes(s));

    this.unassignedStudents = this.allStudents.filter(student =>
      !this.assignedStudents.some(assignedStudent => assignedStudent.id === student.id)
    );
  }

  navigateToCreateTest() {
    this.router.navigate(['/createtestsparent']);
    // setTimeout(() => this.createtestsComponent.resetComponentState(), 0);
    this.testId = null;
    //this.testEditoruser.resetComponentState();
    // this.editorModal.show();
    //setTimeout(() => {
    //  if (this.createtestsComponent) {
    //    this.createtestsComponent.resetComponentState();
    //  }
    //}, 0);
  }

  saveAssignments() {
    if (this.selectedTest?.id) {
      this.testService.saveAssignedStudents(this.selectedTest.id, this.assignedStudents).subscribe({
        next: (response) => {
          this.hideModal();
          // Handle the response, if necessary
          // this.closeModal();
        },
        error: (error) => {
          console.error('Error saving assignments:', error);
        }
      });
    }
  }

  viewQuestions(test) {

    this.testService.getQuestionsForTest(test.id).subscribe({
      next: (response) => {
        this.questionModel = response;
        // this.hideModal();
        this.showQuestionModal();

      },
      error: (error) => {
        console.error('Error saving assignments:', error);
      }
    });

    console.log('View questions for test:', test);
    // Logic to open modal with questions. For now, just log or show static content
  }

  showQuestionModal() {
    this.renderer.addClass(this.viewQuestionsModalRef.nativeElement, 'show');
    this.renderer.setStyle(this.viewQuestionsModalRef.nativeElement, 'display', 'block');
    this.renderer.setAttribute(this.viewQuestionsModalRef.nativeElement, 'aria-modal', 'true');
    this.renderer.setAttribute(this.viewQuestionsModalRef.nativeElement, 'role', 'dialog');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  hideQuestionModal() {
    this.renderer.removeClass(this.viewQuestionsModalRef.nativeElement, 'show');
    this.renderer.removeStyle(this.viewQuestionsModalRef.nativeElement, 'display');
    this.renderer.removeStyle(document.body, 'overflow');
  }


  //startNewTest(testId: number) {
  //  this.testService.getExamDetails(testId).subscribe({
  //    next: (response) => {
  //      var examDetails: ExamDetails;
  //      examDetails = response;
  //      this.testService.setExamDetails(examDetails);
  //      console.log('gopinath service message');
  //      console.log(examDetails);
  //      // this.router.navigate(['/testDetails'], { state: { examDetails } });
  //      this.router.navigate(['/test-taker']);
  //    },
  //    error: (error) => {
  //      console.error('Error saving assignments:', error);
  //    }
  //  });
  //}


  //onStartTest(testId: number, isResume: boolean): void {
  //  if (isResume) {
  //    // Code to handle resuming the test
  //    this.testResultService.resumeTest(testId);
  //    this.router.navigate(['/test-taker']);
  //  } else {
  //    // Code to handle starting a new test
  //    this.startNewTest(testId);
  //  }
  //}

  //onStartTest(testId: number, isResume: boolean, attemptId: number): void {
  //  if (isResume) {
  //    // Assume resumeTest method fetches necessary state to resume and sets it up for retrieval on the test-taker page
  //    this.testResultService.resumeTest(attemptId).subscribe({
  //      next: (response) => {
  //        // Assuming response contains necessary data to resume the test
  //        // Navigate to test-taker page with state indicating resume
  //        this.router.navigate(['/test-taker'], { state: { examDetails: response, isResume: true } });
  //      },
  //      error: (error) => console.error('Error resuming test:', error)
  //    });
  //  } else {
  //    this.testService.getExamDetails(testId).subscribe({
  //      next: (examDetails: ExamDetails) => {
  //        // Set exam details for new test start
  //        this.testService.setExamDetails(examDetails);
  //        // Navigate to test-taker page without resume state
  //        this.router.navigate(['/test-taker'], { state: { examDetails, isResume: false } });
  //      },
  //      error: (error) => console.error('Error starting new test:', error)
  //    });
  //  }
  //}

  onStartTest() { 
    let testId = this.selectedTest?.id
    let isResume = this.selectedTest?.isResume
    let attemptId = this.selectedTest?.attemptId
    if (isResume) {
      this.testResultService.resumeTest(attemptId).subscribe({
        next: (examDetails: ExamDetails) => {
          // Set the state indicating resume with received exam details
          this.testService.setTestState({ examDetails, isResume: true, attemptId });
          // Navigate to the test-taker page, no need to pass state through router here
          this.router.navigate(['/test-taker']);
        },
        error: (error) => console.error('Error resuming test:', error)
      });
    } else {
      this.testService.getExamDetails(testId).subscribe({
        next: (examDetails: ExamDetails) => {
          // Set the state for a new test start
          this.testService.setTestState({ examDetails, isResume: false });
          // Navigate to the test-taker page, again no need to pass state through router
          this.router.navigate(['/test-taker']);
        },
        error: (error) => console.error('Error starting new test:', error)
      });
    }
  }


  openTestEditor(testId?: number): void {
    this.testId = testId || null;
    console.log('testid data');
    console.log(testId);
    this.editorModal.show();
  }

  onTestEditorModalHidden(): void {
    // Handle the modal close event
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

  
  openTab(tabName: any) {
    this.activeTab = tabName;
    console.log(this.activeTab,'this.activeTab')
    this.resetActionButtons();

    // Show loading indicator
    this.loadingIndicator = true;
  
    // Call the service to fetch tests based on selected status
    this.testService.filterTests(tabName).subscribe({
      next: (data) => {
        // Clear current lists
        this.upcomingTests = [];
        this.inProgressTests = [];
        this.completedTests = [];
  
        // Populate the respective array based on selected status
        switch (tabName) {
          case TestStatusViewModel.Upcoming:
            this.upcomingTests = data;
            this.filteredUpcomingTests = [...data];
            break;
          case TestStatusViewModel.InProgress:
            this.inProgressTests = data;
            this.filteredInProgressTests = [...data];
            break;
          case TestStatusViewModel.Completed:
            this.completedTests = data;
            this.filteredCompletedTests = [...data];
            break;
        }
  
        // Prepare student lists or any other additional processing
        this.prepareStudentLists();
  
        // Stop the loading indicator after data is fetched
        this.loadingIndicator = false;
        this.alertService.stopLoadingMessage();
      },
      error: (error) => {
        // Handle error
        console.error('Error fetching tests:', error);
        this.loadingIndicator = false;
        this.alertService.stopLoadingMessage();
      }
    });
  }

  resetActionButtons() {
    this.elRef.nativeElement.querySelectorAll('.action-btn').forEach((btn: HTMLElement) => {
      btn.style.display = 'none';
    });
  }

  updateActionButtons(item?:any, action?:any) {

    this.selectedTest = item;
    console.log('Selected Test ID---------', this.selectedTest?.id);
    this.resetActionButtons();
    if (!this.selectedTest) return;

    const buttonMap: { [key: string]: string } = {
      start: 'startButton',
      resume: 'resumeButton',
      retry: 'retryButton'
    };
    if (buttonMap[action]) {
      this.showButton(buttonMap[action]);
    }
    if(this.activeTab === "InProgress" || this.activeTab === "Upcoming"){
      this.showButton('assignStudentsButton');
    }
    if(this.activeTab === "Upcoming"){
      this.showButton('deleteButton');
    }    

    this.showButton('viewButton');
  }

  showButton(buttonId: string) {
    const button = this.elRef.nativeElement.querySelector(`#${buttonId}`);
    if (button) {
      button.style.display = 'inline-block';
    }
  }

}
