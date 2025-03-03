import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultQuestion } from '../../../models/testResult/result-question.model';
import { AuthService } from '../../../services/auth.service';
import { TestResultService } from '../../../services/testResult/test-result.service';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss']
})
export class TestResultComponent implements OnInit {
  @Input() testId: number;
  @Input() attemptId: number;
  @Input() currentUser: string;
  resultQuestion: ResultQuestion[] = [];
  // Flag to track whether all accordions are open
  allOpen: boolean = true;
  constructor(private route: ActivatedRoute, private testResultService: TestResultService, private authService: AuthService) { }

  ngOnInit() {
    // Retrieve the route parameters
    //this.route.params.subscribe(params => {
    //  this.testId = 2005; //+params['testId'];
    //  this.attemptId = 1;;// +params['attemptId'];
    //  // Now you can use testId and attemptId to load the test result data
    //  this.loadTestResultData();
    //});
    this.loadTestResultData();
  }

  removeHtmlTags(content: string): string {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent || div.innerText || '';
  }

  loadTestResultData() {
    // Use this.testId and this.attemptId to load your data
    // this.testId = 2005;
    // this.attemptId = 1;
    if (this.testId && this.attemptId) {
      this.testResultService.getTestResult(this.testId, this.attemptId, this.currentUser).subscribe(result => {
        // Handle the result
        this.resultQuestion = result;
      });
    }
  }


   // Toggle all accordions
   toggleAllAccordions(): void {
    this.allOpen = !this.allOpen;
    this.resultQuestion.forEach((_, index) => {
      const element = document.getElementById(`collapse${index}`);
      if (element) {
        if (this.allOpen) {
          element.classList.add('show');
        } else {
          element.classList.remove('show');
        }
      }
    });
  }

  // Update accordion state dynamically
  updateAccordionState(): void {
    const openCount = this.resultQuestion.filter((_, index) => {
      const element = document.getElementById(`collapse${index}`);
      return element && element.classList.contains('show');
    }).length;

    this.allOpen = openCount === this.resultQuestion.length;
  }
}
