import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ReferenceDataService } from '../../../services/Reference/reference-data.service';
import { ReferenceDataViewModel } from '../../../models/ReferenceModel/reference.model';
import { TestViewModel, TopicDifficultyViewModel } from '../../../models/tests/test.model';
import { TestService } from '../../../services/tests/test.service';
import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
import { userToAssignTest } from '../../../models/user/user.model';
import { AccountService } from '../../../services/account.service';
import { TestAssignmentViewModel } from '../../../models/assignTest/testAssignment.model';
import { ActivatedRoute } from '@angular/router';
import { AlertService, MessageSeverity } from 'src/app/services/alert.service';
import { AppTranslationService } from 'src/app/services/app-translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createtestsparent',
  templateUrl: './createtests-parent.component.html',
  styleUrls: ['./createtests-parent.component.scss']
})
export class CreatetestsParentComponent implements OnChanges {
  isEditMode: boolean = false;
  @Input() testId: number | null = null;
  grades: ReferenceDataViewModel[] = [];
  subjects: ReferenceDataViewModel[] = [];
  topics: ReferenceDataViewModel[] = [];
  dificultylevels: ReferenceDataViewModel[] = [];
  testModel: TestViewModel = new TestViewModel();
  @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
  gradeSubjects: ReferenceDataViewModel[] = [];
  isFormSubmitted = false;
  currentDate: Date;
  unassignedStudentsOptions:any=[];
  showModal :boolean = false;
  selectTopics:any=[];
  // Pre-populated for example, fetch these from your backend in the real application
  availableGrades: ReferenceDataViewModel[] = [
    // ... populate with real data ...
  ];
  allStudents: userToAssignTest[] = [];
  unassignedStudents: userToAssignTest[] = [

  ];
  @Output() refreshNeeded = new EventEmitter<void>();

  assignedStudents: "";

  user = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    mobileNumber: '',
    password: ''
  };

  difficultyLevel: string = '';
  testType: string = '';
  selectedSubject: any = null;

  constructor(private testService: TestService, private referenceDataService: ReferenceDataService, private accountService: AccountService, private route: ActivatedRoute, private alertService: AlertService, private translationService: AppTranslationService, private router: Router) {
    // Initialize selectedSubject with the first subject's data if needed
    if (this.subjects.length > 0) {
      this.selectedSubject = this.subjects[0];
    }
  }

  testTypes = [
    { key: 'easy', value: 'Easy' },
    { key: 'medium', value: 'Medium' },
    { key: 'difficult', value: 'Difficult' }
  ];


  testTypeCounts = {
    easy: 0,
    medium: 0,
    difficult: 0,
  };



  // Adjust the question count
  adjustQuestionCount(topic: any, level: string, change: number) {
    const newCount = topic[level] + change;
    console.log(newCount,'newCount')
    // Ensure the count stays within valid limits
    if (newCount >= 0 ) {
      topic[level] = newCount;
      topic.totalSelected =
        topic.easy + topic.medium + topic.hard;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.testId) {
      const currentTestId = changes.testId.currentValue;
      if (currentTestId) {
        // Load the test details
        this.isEditMode = true;
        this.loadTestDetails(currentTestId);
      }
      else { this.resetComponentState(); }
    }
    this.getGrades();
    this.getDificultylevels();
    this.prepareStudentLists();
    //this.getQuestionTypes();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // Returns date in yyyy-mm-dd format
  }

  handleFormSuccess() {
    this.resetModelAndCloseModal();
    if (this.wizardForm) {
      this.wizardForm.reset();
    }
    this.refreshNeeded.emit(); // Signal the parent component to refresh
  }

  resetModelAndCloseModal() {
    this.testModel = new TestViewModel(); // Reset the model to its initial state
    // Code to close the modal goes here. This depends on how your modal is implemented.
  }

  ngOnInit(): void {
   if (this.testId) {
     this.isEditMode = true;
     this.loadTestDetails(this.testId);
   }
   this.getGrades();
   this.getDificultylevels();
   this.prepareStudentLists();


   this.testId = this.route.snapshot.params['testId'];


   this.route.queryParams.subscribe(params => {
    this.testId = params['testId'];

    if (this.testId) {
      this.isEditMode = true;
      this.loadTestDetails(this.testId);
    }
    this.getGrades();
    this.getDificultylevels();
    this.prepareStudentLists();
    // You can now use this.testId to load the test details for editing
   });

   if (this.testId) {
    this.isEditMode = true;
    this.loadTestDetails(this.testId);
   }
   this.getGrades();
   this.getDificultylevels();
   this.prepareStudentLists();
  //  this.getQuestionTypes();
  }

  loadTestDetails(testId: number): void {
    if (this.wizardForm) {
      this.wizardForm.reset();
    }
    this.testService.getTestDetailsById(testId).subscribe((testDetails) => {
      this.testModel = testDetails;
      this.showAssignedUsers(testDetails);
      this.onGradeChangeEdit(this.testModel);
    });
  }

  resetComponentState() {
    this.isEditMode = false;
    this.testId = null;
    // Reset other necessary fields and states as needed
    this.testModel = new TestViewModel();
    this.topics = [];
    this.assignedStudents = "";
    if (this.wizardForm) {
      this.wizardForm.reset();
    }
    // Any other initialization logic
  }

  prepareStudentLists() {
    // Initialize unassignedStudents by excluding those already assigned

    this.accountService.getUsersForAssign().subscribe(results => this.onDataLoadSuccessful(results), error => this.onDataLoadFailed(error));
  }

  getFormattedDate(date: any): string {
    // Ensure 'date' is truly a Date object and is valid before calling toISOString
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    } else {
      console.warn('getFormattedDate called with an argument that is not a Date object:', date);
      // Provide a fallback or handle the error as appropriate for your application
      // Returning an empty string as a safe default if 'date' is not valid
      return '';
    }
  }

  formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  findSubjectById(subjectId: number): string | undefined {
    // Assuming 'grades' is an array of ReferenceDataViewModel objects available in your component
    // return this.subjects.find(subject => subject.key === subjectId);


    const subjectObj = this.subjects.find(subject => subject.key === subjectId);

    // Return the 'value' property if the grade object is found
    return subjectObj ? subjectObj.value : undefined;
  }

  findGradeValueByKey(gradeKey: number): string | undefined {
    // Find the grade object with the matching key
    const gradeObj = this.grades.find(grade => grade.key === gradeKey);

    // Return the 'value' property if the grade object is found
    return gradeObj ? gradeObj.value : undefined;
  }

  onDataLoadSuccessful(result: any) {
    this.allStudents = result;
    // this.unassignedStudents = this.allStudents.filter(s => !this.assignedStudents.includes(s));

    // this.unassignedStudents = this.allStudents.filter(student =>
    //   !this.assignedStudents.some(assignedStudent => assignedStudent.id === student.id)
    // );
    
    this.unassignedStudentsOptions = this.allStudents?.map((student)=>{
      return({key:student?.id, value:student?.fullName})
    })

    console.log('Unassigned Students', this.unassignedStudentsOptions);
  }

  onDataLoadFailed(error: any) {

  }

  updateAssignedStudents(assigned) {
    this.assignedStudents = assigned;
    //  this.prepareStudentLists(); // Refresh the available and assigned lists
  }
  getGrades(): void {
    this.referenceDataService.getGrades()
      .subscribe(grades => {
        this.grades = grades;
        // You can now work with the 'grades' array in your component
      });
  }

  getDificultylevels() {
    this.referenceDataService.getDifficultyLevels()
      .subscribe(difficultyLevels => {
        this.dificultylevels = difficultyLevels;
        // You can now work with the 'grades' array in your component
      });
  }

  // Step 1 methods
  updateTestDetails(): void {
    // Update test details like duration, number of questions, etc.
  }

  // Step 2 methods
  toggleFinalScore(): void {
    this.testModel.showFinalScore = !this.testModel.showFinalScore;
  }

  toggleFinalResult(): void {
    this.testModel.showFinalResult = !this.testModel.showFinalResult;
  }

  selectSubject(subjectId: number): void {
    // Logic to handle subject selection and load topics
    // Assuming subjects are pre-loaded or fetched from a service
  }

  addTopic(topicDifficulty: TopicDifficultyViewModel): void {
    this.testModel.topics.push(topicDifficulty);
  }

  // Step 4 methods
  assignTest(): void {
    // Logic to assign the test
  }

  // Step 5 methods
  publishTest(): void {
    this.testModel.isPublished = !this.testModel.isPublished;
  }

  onGradeChange(selectedGrade): void {
    this.testModel.grade = this.findGradeValueByKey(selectedGrade);

    this.referenceDataService.getSubjects(selectedGrade)
      .subscribe(subjects => {
        this.subjects = subjects;
        // You can now work with the 'grades' array in your component
      });
  }



  onGradeChangeEdit(selectedGrade): void {
    this.testModel.grade = this.findGradeValueByKey(selectedGrade.gradeId);

    this.referenceDataService.getSubjects(selectedGrade.gradeId)
      .subscribe(subjects => {
        this.subjects = subjects;
        if (this.isEditMode) {
          this.onLoadSubjectChange(this.testModel.subjectId)
        }

        this.testModel.topics = selectedGrade.topics;
        // You can now work with the 'grades' array in your component
      });
  }

  onSubjectChange(selectedsubject: number): void {
    this.testModel.subject = this.findSubjectById(selectedsubject);
    this.referenceDataService.getTopics(selectedsubject)
      .subscribe(topics => {
        this.topics = topics;
        // this.testModel.topics = selectedGrade.topics;
        // You can now work with the 'grades' array in your component
      });
  }

  onLoadSubjectChange(selectedSubject: number): void {
    this.testModel.subject = this.findSubjectById(selectedSubject);
    this.referenceDataService.getTopics(selectedSubject)
      .subscribe(topics => {
        // Map through all topics to add a 'selected' property
        this.topics = topics.map(topic => {
          // Check if this topic is among those already selected in the testModel
          const isSelected = this.testModel.topics.some(selectedTopic => selectedTopic.topicId === topic.key);

          // Return the topic with an additional 'selected' property indicating its selection status
          return {
            ...topic,
            selected: isSelected,
            difficulty: isSelected ? this.testModel.topics.find(selectedTopic => selectedTopic.topicId === topic.key).difficulty : ''
          };
        });
      });
  }


  onSubmit(form: any) {
    console.log(this.user,
    this.difficultyLevel,
    this.testType,
    this.selectedSubject)
    if (this.isEditMode) {
      // Call the update method in your service
      this.testService.updateTest(this.testModel, this.testId).subscribe(
        success => {/* Handle success */ },
        error => {/* Handle error */ }
      );
    } else {
      // Existing logic for creating a new test
      this.testService.saveTest(this.testModel).subscribe(
        success => {/* Handle success */ },
        error => {/* Handle error */ }
      );
    }
  }

  getTopics(){
    let payload={
        "classId": Number(this.testModel?.gradeId),
        "subjectId": Number(this.testModel?.subjectId),
        "testType": this.testType,
        "difficultyLevel": this.difficultyLevel,
        "studentId": 0
    }
    this.testService.generateTopics(payload).subscribe(response=>{
      this.selectTopics = response;
      this.showModal = true;
    }
     
    );
  }

  handleModal(action){
    if(action === 'hide'){
      this.showModal = false;
    }else  if(action === 'show'){
      this.getTopics()
    }
    console.log(this.showModal,'showModal')
  }


  setDifficulty(topic, level) {
    // Toggle the difficulty off if the same level is clicked again
    if (topic.hard === level) {
      topic.hard = '';
      topic.selected = false; // Mark as not selected
    } else {
      topic.hard = level;
      topic.selected = true; // Mark as selected
    }

    // Check if the topic already exists in the test model's topics
    const existingTopicIndex = this.testModel.topics.findIndex(t => t.topicId === topic.key);

    if (existingTopicIndex > -1) {
      // Update existing topic's difficulty and selection status
      this.testModel.topics[existingTopicIndex].difficulty = topic.difficulty;
      this.testModel.topics[existingTopicIndex].selected = topic.selected;
    } else {
      // Add new topic if it's selected (i.e., difficulty is not empty)
      if (topic.difficulty !== '') {
        this.testModel.topics.push({
          topicId: topic.key,
          difficulty: topic.difficulty,
          selected: topic.selected // Include selected property
        });
      }
    }

    // Force update to trigger Angular change detection
    this.testModel.topics = [...this.testModel.topics];
  }



  finishFunction() {
    let payload = {
        "title": this.testModel?.title,
        "classId": Number(this.testModel?.gradeId),
        "subjectId": Number(this.testModel?.subjectId),
        "description": 'description',
        "testType": this.testType,
        "difficultyLevel": this.difficultyLevel,
        "selectedTopics": this.testModel.topics,
        "assignedStudentId": this.assignedStudents
    }

    if (!this.isEditMode) {
      // this.testModel.testAssignmentViewModel = testAssignment;
      this.testService.saveTest(payload)
        .subscribe(difficultyLevels => {
          this.handleFormSuccess();
          this.alertService.showStickyMessage(
            'Success',
            'Test created successfully.',
            MessageSeverity.success
          );
          this.router.navigate(['dashboard-parent']);
          // You can now work with the 'grades' array in your component
        });
    } else {
      // this.testModel.testAssignmentViewModel = testAssignment;
      this.testService.updateTest(this.testModel, this.testId)
        .subscribe(difficultyLevels => {
          this.handleFormSuccess();
          // You can now work with the 'grades' array in your component
        });
    }

  }

  isAtLeastOneTopicSelected(): boolean {
    return this.testModel.topics.some(topic =>  topic.difficulty);
  }


  showAssignedUsers(test) {
    // this.prepareStudentLists();
    this.testService.getAssignedUsersForTest(test.id).subscribe(results => this.onDataLoadSuccessfulForShowAssignedUser(results, test), error => this.onDataLoadFailedForShowAssignedUser(error));
    console.log('Assigned users for test:', test);
    // Add logic to display assigned users
  }

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

    // this.unassignedStudents = this.allStudents.filter(student =>
    //   !this.assignedStudents.some(assignedStudent => assignedStudent.id === student.id)
    // );
  }

  onDataLoadFailedForShowAssignedUser(result: any) {

  }

  assignQuestions() {
    console.log('Assigned Questions:', this.selectTopics);
    let tempSelectedTopics = this.selectTopics?.map((topic)=>{
      return( {
        "topicId": topic?.topicId,
        "easy": topic?.easy,
        "medium": topic?.medium,
        "hard": topic?.hard
      })
    })
    this.testModel.topics = tempSelectedTopics;
    this.showModal = false;
    // Implement your logic here
  }

  openModal(): void {
    // Any custom logic before opening the modal
  }
}
