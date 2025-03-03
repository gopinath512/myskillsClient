import { TestAssignmentViewModel } from "../assignTest/testAssignment.model";
import { TestStatusViewModel } from "../enums";

//export class TestViewModel {
//  id: number = 0;
//  title: string = ''; // Renamed from testName to title for consistency with the .NET model
//  subjectId: number;
//  subjectName: string = ''; // Assuming you need the name, renamed from subject to subjectName
//  gradeName: string = ''; // Renamed from grade to gradeName for clarity
//  topics: TopicDifficultyViewModel[] = [];
//  noOfQuestions?: number; // Optional
//  gradeId?: number; // Optional
//  examDate: Date;
//  timeDuation?: string; // Now properly marked as optional
//  description: string = '';
//  showFinalScore: boolean = false;
//  showFinalResult: boolean = false; // Added to align with TestOptions
//  messageOnSubmit: string = ''; // Added to align with TestOptions
//  mandatoryAttendAllQuestions: boolean = false; // Added to align with TestOptions
//  passFeedBack?: string; // Optional, aligning with CustomMessage
//  failFeedBack?: string; // Optional, aligning with CustomMessage
//  maxAttempts: number = 0;
//  totalQuestions: number = 0;
//  isPublished: boolean = false;
//  passPercentage: number;
//  //  testAssignmentViewModel: TestAssignmentViewModel;
//}

export interface TopicDifficultyViewModel {
  topicId: number;
  difficulty: 'easy' | 'medium' | 'difficult' | ''; // Unchanged
  selected: boolean;
}



export class TestViewModel {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  testType: string;
  grade?: string; // Now nullable, indicating it's optional
  gradeId: number;
  subject?: string; // Also optional
  examStartDate?: string; // Optional in TypeScript to match the C# nullable DateTime
  examEndDate?: string; // Optional in TypeScript to match the C# nullable DateTime
  noOfQuestions?: number; // Optional
  totalQuestions: number;
  timeDuration: number; // Corrected typo from "Duation" to "Duration"
  maxAttempts: number;
  showFinalScore: boolean;
  showFinalResult: boolean;
  isPublished: boolean;
  isResume: boolean;
  attemptId: number;
  messageOnSubmit: string;
  mandatoryAttendAllQuestions: boolean;
  // Assuming TestAssignmentViewModel and TopicDifficultyViewModel are already defined in TypeScript
  // If TestAssignmentViewModel is not required to be always present, it can also be optional.
  testAssignmentViewModel?: TestAssignmentViewModel; // Uncomment and make optional if needed
  topics: TopicDifficultyViewModel[] = []; // Default to an empty array

  // Additional properties for UI
  status: TestStatusViewModel; // Keeping the case consistent with TypeScript conventions
  passFeedback: string;
  failFeedback: string;
  passPercentage?: number; // Optional to align with C# nullable int

  // Constructors in TypeScript can initialize properties directly
  constructor() {
    // Default values for properties that need them can be set here
    this.id = 0;
    this.title = '';
    this.description = '';
    this.examStartDate = '';
    this.examEndDate = '';
    // Initialize other properties as needed...
    this.totalQuestions = 0;
    this.timeDuration = 0;
    this.maxAttempts = 0;
    this.attemptId = 0;
    this.showFinalScore = false;
    this.showFinalResult = false;
    this.isPublished = false;
    this.isResume = false;
    this.messageOnSubmit = '';
    this.mandatoryAttendAllQuestions = false;
    this.status = TestStatusViewModel.InProgress;
    this.passFeedback = '';
    this.failFeedback = '';
    // Topics array is already initialized above
  }
}
