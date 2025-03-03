import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ExamDetails } from '../../models/tests/examDetails';
import { ActivatedRoute, Navigation, Router } from '@angular/router';
import { TestService } from '../../services/tests/test.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FormBuilder, FormGroup, FormArray, FormControl, NgForm } from '@angular/forms';
import { QuestionTypeId, QuestionViewModel } from '../../models/question/question.model';
import { Subscription, timer } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { TestResultService } from '../../services/testResult/test-result.service';
import { TestResponse } from '../../models/testResult/test-response.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var bootstrap: any;


@Component({
  selector: 'app-test-taker',
  templateUrl: './test-taker.component.html',
  styleUrls: ['./test-taker.component.scss']
})
export class TestTakerComponent implements OnInit {

  questionForm: FormGroup;
  Editor = ClassicEditor;
  timer: any;
  interval: any;
  startTime: number;
  pausedTime: number;
  isPaused: boolean = false;
  isSideNavOpen: boolean = true; 

  @ViewChild('submitSuccessModal', { static: true })
  submitSuccessModal: ModalDirective;
  editorConfig = {

    toolbar: [],
    // Your existing config
    isReadOnly: true, // Set read-only

    // Attempt to add custom CSS (this works for the content area, not the UI container)
    ckeditor5: {
      styles: `
      .ck-editor__editable {
        border: none !important; /* Attempt to remove border */
      }
    `
    }
  };
  testStarted = false;
  currentAttemptId: number;
  examDetails: ExamDetails | undefined;
  currentQuestionIndex = 0;
  isResuming = false;
  attemptId = 0;
  timeRemaining: number | undefined;
  private subscription: Subscription = new Subscription();


  constructor(private fb: FormBuilder, private testService: TestService, private testResultService: TestResultService, private router: Router) { }

  //ngOnInit(): void {
  //  this.getExamDetails();
  //}
  ngOnInit(): void {
    const state = this.testService.getTestState();
    if (state) {
      this.examDetails = state.examDetails;
      this.isResuming = state.isResume;
      this.currentAttemptId = state.attemptId;
      console.log('this.currentAttemptId');
      console.log(this.currentAttemptId);
      console.log(this.isResuming);
      if (this.isResuming) {
        this.resumeTest();
      } else {
        // this.startNewTest();
      }
    } else {
      // Handle scenario where no state is available
    }
  }


  submitQuiz(): void {
    const submission: TestResponse = {
      testAttemptId: this.currentAttemptId,
      testId: this.examDetails?.id,
      questionsResponses: this.examDetails.examQuestions.map(q => {
        // Filter options that are selected and map them to their ids
        const selectedOptions = q.options.filter(o => o.selected).map(o => o.id);
        return {
          questionId: q.id,
          selectedOptions: selectedOptions
        };
      })
    };


    //TestResponse
    // Assuming you have a method on your service to submit exam results
    this.testResultService.saveTestResponse(submission).subscribe({
      next: (response) => {
        // Handle successful submission
        console.log('Submission successful', response);
        this.showSuccessModal();
        // Optionally navigate to a different view or show a success message
      },
      error: (error) => {
        // Handle error case
        console.error('Submission failed', error);
      }
    });
  }


  showSuccessModal(): void {
    this.submitSuccessModal.show();
  }

  onRadioSelect(questionId: number, selectedOptionId: number): void {
    // Find the current question by its ID.
    const currentQuestion = this.examDetails?.examQuestions.find(q => q.id === questionId);

    // If the current question is found...
    if (currentQuestion) {
      // Iterate over each option in the current question.
      currentQuestion.options.forEach(option => {
        // Set 'selected' to true if the option's ID matches the selectedOptionId; false otherwise.
        option.selected = option.id === selectedOptionId;
      });
    }
  }

  startTest(testId): void {
    console.log('This is Duration');
    console.log(this.examDetails?.durationMinutes);
    this.testStarted = true;
    const pauseState = {
      LastQuestionIndex: this.currentQuestionIndex,
      CurrentAnswersJson: JSON.stringify(this.examDetails) // Assuming `this.answers` holds the current answers
    };

    this.testResultService.startTest(testId, pauseState).subscribe({
      next: (response) => {
        console.log('Start Test');
        console.log(response.attemptId);
        this.currentAttemptId = response.attemptId; // Store the attempt ID
        // Initialize or reset the test UI here
      },
      error: (error) => console.error('Error starting test:', error)
    });
    // Initialize timer and other necessary states
    const durationInSeconds = (this.examDetails?.durationMinutes || 0) * 60;
    this.startTimer(durationInSeconds);
  }


  getExamDetails() {
    // Assuming examDetailsService.currentExamDetails is already populated
    this.subscription.add(this.testService.currentExamDetails.subscribe(details => {
      this.examDetails = details;
      this.startTimer(details.durationMinutes);
    }));
  }

  //startTimer(durationSeconds: number) {
  //  this.startTime = Date.now();
  //  const updateTimer = () => {
  //    const elapsed = Date.now() - this.startTime;
  //    let timeLeft = durationSeconds * 1000 - elapsed;
  //    if (this.pausedTime) {
  //      timeLeft += this.pausedTime;
  //    }
  //    if (timeLeft < 0) timeLeft = 0;
  //    this.timeRemaining = Math.floor(timeLeft / 1000);
  //    if (timeLeft > 0) {
  //      setTimeout(updateTimer, 1000);
  //    }
  //  };
  //  updateTimer();
  //}


  //getExamDetailsinfo(testId:number) {

  //  this.testService.getExamDetails(testId).subscribe({
  //    next: (examDetails: ExamDetails) => {
  //      // Set the state for a new test start
  //      this.examDetails = examDetails;
  //      this.attemptId = examDetails.at
  //    },
  //    error: (error) => console.error('Error starting new test:', error)
  //  });
  //}

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  startTimer(seconds: number): void {
    if (this.subscription) {
      this.subscription.unsubscribe(); // Unsubscribe from any existing subscription to prevent memory leaks
    }

    this.subscription = new Subscription();

    this.subscription.add(
      timer(0, 1000).pipe(
        take(seconds + 1),
        map(() => --seconds),
        map((remainingSeconds) => {
          this.timeRemaining = remainingSeconds;
          return remainingSeconds;
        })
      ).subscribe({
        next: (timeLeft) => {
          if (timeLeft === 0) {
            // Time's up, submit the quiz automatically
            this.submitQuiz();
          }
        },
        error: (error) => console.error('Error with the timer:', error),
        // No need for a complete handler here since you're handling the end of timer in next()
      })
    );
  }




  nextQuestion() {
    if (this.currentQuestionIndex < (this.examDetails?.examQuestions.length ?? 0) - 1) {

      this.currentQuestionIndex++;
      console.log(this.examDetails?.examQuestions[this.currentQuestionIndex].text);
      // Update progress percentage
      const progress = this.getProgressPercentage();
      // ... Update the progress bar with the new progress
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      // Update progress percentage
      const progress = this.getProgressPercentage();
      // ... Update the progress bar with the new progress
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  highlightOption(event: MouseEvent): void {
    (event.currentTarget as HTMLElement).style.boxShadow = 'inset 0 0 0 0.25rem rgba(0, 123, 255, 0.25)';
  }

  unhighlightOption(event: MouseEvent): void {
    (event.currentTarget as HTMLElement).style.boxShadow = 'none';
  }

  getProgressPercentage(): string {
    // Calculate the number of answered questions based on whether any options are selected
    const answeredQuestions = this.examDetails.examQuestions.reduce((count, question) => {
      // Check if any options are selected for this question
      const isAnswered = question.options.some(option => option.selected);
      return count + (isAnswered ? 1 : 0);
    }, 0);

    // Calculate the percentage of answered questions
    const percentage = (answeredQuestions / this.examDetails.examQuestions.length) * 100;
    return `${percentage}%`;
  }

  //onResumeTest(testId: number): void {
  //  this.testService.resumeTest(testId).subscribe({
  //    next: (testState) => {
  //      // Use testState to set up the component state for resuming the test
  //    },
  //    error: (error) => {
  //      console.error('Failed to resume test', error);
  //      // Handle error, perhaps redirecting the user or showing a message
  //    }
  //  });
  //}

  goBackToDashboard(): void {
    // Navigate back to the dashboard. Adjust the path as necessary for your application.
    this.router.navigate(['/tests']);
  }

  goBackToModelDashboard(): void {
    this.submitSuccessModal.hide();
    // Navigate back to the dashboard. Adjust the path as necessary for your application.
    this.router.navigate(['/tests']);
  }

  pauseTest(): void {
    this.subscription.unsubscribe()
    const currentTime = Date.now();
    this.pausedTime = currentTime - this.startTime;
    this.examDetails.pausedTime = this.timeRemaining;
    this.isPaused = true;
    const pauseState = {
      LastQuestionIndex: this.currentQuestionIndex,
      CurrentAnswersJson: JSON.stringify(this.examDetails) // Assuming `this.answers` holds the current answers
    };
    
    this.testResultService.pauseTest(this.currentAttemptId, pauseState).subscribe({
      next: () => console.log('Test paused successfully.'),
      error: (error) => console.error('Error pausing test:', error)
    });
  }

  //resumeTest(): void {
  //  this.testResultService.resumeTest(this.currentAttemptId).subscribe({
  //    next: (data) => {
  //      this.currentQuestionIndex = data.lastQuestionIndex;
  //      this.examDetails = JSON.parse(data.currentAnswers); // Parse and set the answers to resume from
  //      // Additional logic to set the UI state based on resumed data
  //      this.testStarted = true;
  //      this.pausedTime = this.examDetails.pausedTime;
  //      this.startTime = Date.now() - this.pausedTime;
  //      this.startTime = Date.now() - this.pausedTime; // Adjust start time based on paused time
  //      this.startTimer(this.examDetails?.durationMinutes * 60 || 0);
  //    },
  //    error: (error) => console.error('Error resuming test:', error)
  //  });
  //}
  resumeTest(): void {
    this.isPaused = false;
    // Assuming this.testResultService.resumeTest fetches the paused state correctly
    this.testResultService.resumeTest(this.currentAttemptId).subscribe({
      next: (data) => {
        this.currentQuestionIndex = data.lastQuestionIndex;
        this.examDetails = JSON.parse(data.currentAnswers);
        // Ensure this.examDetails.pausedTime is correctly set before this point
        const remainingTimeSeconds = this.examDetails.pausedTime || 0;
        this.testStarted = true;
        // Now call startTimer with the remaining seconds
        this.startTimer(remainingTimeSeconds);
        // Other logic to resume test...
      },
      error: (error) => console.error('Error resuming test:', error)
    });
  }


  questionIsAnswered(question: QuestionViewModel): boolean {
    return question.options.some(option => option.selected);
  }

  // Add this method to your TestTakerComponent class
  get answeredQuestionsCount(): number {
    // Check if examDetails and its examQuestions are defined
    if (!this.examDetails || !this.examDetails.examQuestions) {
      return 0; // Return 0 if there are no details or questions
    }

    // Use Array's reduce() method to count how many questions have been answered
    return this.examDetails.examQuestions.reduce((count, question) => {
      // A question is answered if any of its options are selected
      const isAnswered = question.options.some(option => option.selected);
      return count + (isAnswered ? 1 : 0); // Increment count if the question is answered
    }, 0);
  }

  gotoQuestion(index: number): void {
    this.currentQuestionIndex = index;
    const offcanvasElement = document.getElementById('questionOffcanvas');
    if (offcanvasElement) {
      // Bootstrap 5
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }

      // For Bootstrap 4 or if you're not using bootstrap global object,
      // you might need a different approach, or ensure bootstrap is correctly imported.
    }
    // Close the offcanvas manually if needed, and update UI to reflect the current question
    // Possibly trigger any method that updates the UI based on the current question
  }

  finishTest(): void {
    // this.submitQuiz();
    // Logic to handle test completion
  }

  toggleSideNav() {
    this.isSideNavOpen = !this.isSideNavOpen;
  }
}
