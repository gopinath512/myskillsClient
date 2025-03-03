import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DifficultyLevel, QuestionType, FileType } from '../../models/enums';
import { ReferenceDataViewModel } from '../../models/ReferenceModel/reference.model';

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {

  private baseUrl = 'https://myskillslearning.com/api/ReferenceData'; // Replace with your actual API base URL

  constructor(private http: HttpClient) { }

  // GET: /api/ReferenceData/getTopics/{subjectId}
  getTopics(subjectId: number): Observable<ReferenceDataViewModel[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getTopics/${subjectId}`);
  }

  // GET: /api/ReferenceData/getSubjects/{gradeId}
  getSubjects(gradeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getSubjects/${gradeId}`);
  }

  // GET: /api/ReferenceData/getGrades
  getGrades(): Observable<ReferenceDataViewModel[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getGrades`);
  }

  getDifficultyLevels(): Observable<ReferenceDataViewModel[]> {
    return this.http.get<any[]>(`${this.baseUrl}/difficulty-levels`);

  }

  getQuestionTypes(): Observable<ReferenceDataViewModel[]> {
    return this.http.get<ReferenceDataViewModel[]>(`${this.baseUrl}/question-types`);
  }

  getFileTypes(): Observable<FileType[]> {
    return this.http.get<FileType[]>(`${this.baseUrl}/file-type`);
  }
}
