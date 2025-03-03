import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TestAssignmentViewModel } from '../../models/assignTest/testAssignment.model';
import { TestStatusViewModel } from '../../models/enums';
import { ExamDetails } from '../../models/tests/examDetails';
import { TestViewModel } from '../../models/tests/test.model';
import { userToAssignTest } from '../../models/user/user.model';
import { AuthService } from '../auth.service';
import { TestEndpoint } from './test-endpoint.service';


@Injectable({
  providedIn: 'root'
})
export class TestService {

  private examDetailsSource = new BehaviorSubject<ExamDetails | null>(null);
  private testDetailsSource = new BehaviorSubject<{ testId: number, attemptNumber: number }>({ testId: null, attemptNumber: null });
  private examStateSource = new BehaviorSubject<{ examDetails: ExamDetails, isResume: boolean, attemptId?: number }>(null);
  currentExamDetails = this.examDetailsSource.asObservable();
  testDetails$ = this.testDetailsSource.asObservable();

  private tests = [
    { name: 'ASDASD', year: 5, subject: 'Math', assignedStudents: [] },
    { name: 'gfdf', year: 5, subject: 'Math', assignedStudents: [] }
  ];

  constructor(
    private authService: AuthService,
    private testEndpoint: TestEndpoint) {
  }


  getTest(id: number) {
    return this.testEndpoint.getTestById<TestViewModel>(id);
  }

  getTests() {
    return this.testEndpoint.getTests<any[]>();
  }

  /*resumeTest(testId: number) { return this.testEndpoint.getAssignedUsersForTestEndpoint<any>(testid); }*/

  filterTests(status: TestStatusViewModel) {
    return this.testEndpoint.filterTests<any[]>(status);
  }

  saveTest(testViewModel) {
    return this.testEndpoint.createTestEndpoint<TestViewModel>(testViewModel);
  }

  updateTest(testViewModel: TestViewModel, index: number) {
    return this.testEndpoint.updateTestEndpoint<TestViewModel>(testViewModel, index);
    // Add logic to save the test
    // console.log('Test saved:', test);
  }

  removeTest(index: number) {
    return this.testEndpoint.removeTestEndpoint<TestViewModel>(index);
    this.tests.splice(index, 1);
  }

  generateTopics(request){
    return this.testEndpoint.getTestTopics(request);
  }


  saveAssignedStudents(testid: number, userToAssignTest: userToAssignTest[]) {

    const testAssignment: TestAssignmentViewModel = {
      id: 0, // Set this if needed, otherwise it's set to 0
      testId: testid,
      assignedToUserIds: userToAssignTest.map(user => user.id),

    };
    console.log(testAssignment);
    return this.testEndpoint.assignTesttoUsersEndpoint<any>(testAssignment);
  }


  getAssignedUsersForTest(testid: number) {

    return this.testEndpoint.getAssignedUsersForTestEndpoint<any>(testid);
  }

  getQuestionsForTest(testid: number) {

    return this.testEndpoint.getQuestionsForTestEndpoint<any>(testid);
  }

  getExamDetails(testid: number) {
    // this.setExamDetails(this.testEndpoint.getExamDetails<ExamDetails>(testid));
    return this.testEndpoint.getExamDetails<ExamDetails>(testid);
  }

  getTestDetailsById(testid: number) {
    // this.setExamDetails(this.testEndpoint.getExamDetails<ExamDetails>(testid));
    return this.testEndpoint.getTestDetailsById<TestViewModel>(testid);
  }


  //setExamDetails(details: ExamDetails) {
  //  this.examDetailsSource.next(details);
  //}

  setTestState(state: { examDetails: ExamDetails, isResume: boolean, attemptId?: number }): void {
    this.examStateSource.next(state);
  }

  clearTestState(): void {
    this.examStateSource.next(null);
  }

  setTestDetailsBasedOnVersion(testId: number, attemptNumber: number) {
    this.testDetailsSource.next({ testId, attemptNumber });
  }

  getTestState(): { examDetails: ExamDetails, isResume: boolean, attemptId?: number } | null {
    return this.examStateSource.getValue();
  }

}
