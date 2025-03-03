import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { catchError, Observable, observable } from 'rxjs'
import { EndpointBase } from '../endpoint-base.service';
import { ConfigurationService } from '../configuration.service';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})

export class TestEndpoint extends EndpointBase {

  get createTestUrl() { return this.configurations.baseUrl + '/api/test/createTest'; }
  get updateTestUrl() { return this.configurations.baseUrl + '/api/test/update'; }
  get searchTestsUrl() { return this.configurations.baseUrl + '/api/test/tests'; }
  get searchTestUrl() { return this.configurations.baseUrl + '/api/test'; }
  get getTestsUrl() { return this.configurations.baseUrl + '/api/test'; }
  get getTestsByStatusUrl() { return this.configurations.baseUrl + '/api/test/getTestsByStatus'; }
  get removeTestsUrl() { return this.configurations.baseUrl + '/api/test'; }
  get assignTesttoUsersUrl() { return this.configurations.baseUrl + '/api/test/assignUsersToTest'; }
  get assignedUsersForTestUrl() { return this.configurations.baseUrl + '/api/test/assignUsersToTest'; }
  get getQuestionsForTestTestUrl() { return this.configurations.baseUrl + '/api/test/questions'; }
  get getExamDetailsuRL() { return this.configurations.baseUrl + '/api/test/examDetails'; }
  get getTestDetailsuRL() { return this.configurations.baseUrl + '/api/test/testDetails'; }
  get getGenerateTopics() { return this.configurations.baseUrl + '/api/test/generateTopics'; }

  constructor(private configurations: ConfigurationService, http: HttpClient, authService: AuthService) { super(http, authService); }

  createTestEndpoint<T>(questionObject: any): Observable<T> {
    console.log(this.createTestUrl);
    console.log(this.requestHeaders);
    console.log(JSON.stringify(questionObject));
    return this.http.post<T>(this.createTestUrl, JSON.stringify(questionObject), this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.createTestEndpoint(questionObject));
      }));
  }

  updateTestEndpoint<T>(questionObject: any, index: any): Observable<T> {
    return this.http.put<T>(this.updateTestUrl, JSON.stringify(questionObject), this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.updateTestEndpoint(questionObject, index));
      }));
  }

  getTestTopics<T>(request: any): Observable<T> {
    return this.http.post<T>(this.getGenerateTopics, JSON.stringify(request), this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getTestTopics(request));
      }));
  }

  searchTests<T>(criteria: any): Observable<T> {
    return this.http.post<T>(this.searchTestsUrl, JSON.stringify(criteria), this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.searchTests(criteria));
      }));
  }

  getTestById<T>(id: number): Observable<T> {
    // return this.http.get(`${this.searchByClassAndSubjectUrl}/search`, { params: { classId, subjectId } });
    const endpointUrl = `${this.searchTestUrl}/${id}`;
    return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getTestById(id));
      }));
  }

  getTests<T>(): Observable<T> {
    const endpointUrl = `${this.getTestsUrl}`;
    return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getTests());
      }));
  }

  filterTests<T>(status: any): Observable<T> {

    const endpointUrl = `${this.getTestsByStatusUrl}/${status}`;
    return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.filterTests(status));
      }));
  }

  removeTestEndpoint<T>(id: any): Observable<T> {
    const endpointUrl = `${this.removeTestsUrl}/${id}`;
    return this.http.delete<T>(endpointUrl, this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.removeTestEndpoint(id));
      }));
  }

  assignTesttoUsersEndpoint<T>(questionObject: any): Observable<T> {

    return this.http.post<T>(this.assignTesttoUsersUrl, JSON.stringify(questionObject), this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.assignTesttoUsersEndpoint(questionObject));
      }));
  }

  getAssignedUsersForTestEndpoint<T>(testId: any): Observable<T> {

    const endpointUrl = `${this.assignedUsersForTestUrl}/${testId}`;
    return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getAssignedUsersForTestEndpoint(testId));
      }));
  }

  getQuestionsForTestEndpoint<T>(testId: any): Observable<T> {

    const endpointUrl = `${this.getQuestionsForTestTestUrl}/${testId}`;
    return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
      catchError(error => {
        return this.handleError(error, () => this.getQuestionsForTestEndpoint(testId));
      }));
  }


  getExamDetails<T>(testId: number): Observable<T> {
    {


      const endpointUrl = `${this.getExamDetailsuRL}/${testId}`;
      return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
        catchError(error => {
          return this.handleError(error, () => this.getExamDetails(testId));
        }));
    }

  }

  getTestDetailsById<T>(testId: number): Observable<T> {
    {
      const endpointUrl = `${this.getTestDetailsuRL}/${testId}`;
      return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
        catchError(error => {
          return this.handleError(error, () => this.getExamDetails(testId));
        }));
    }

  }

}
