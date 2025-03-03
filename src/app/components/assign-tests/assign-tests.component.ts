import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TestViewModel } from '../../models/tests/test.model';
import { userToAssignTest } from '../../models/user/user.model';


@Component({
  selector: 'app-assign-tests',
  templateUrl: './assign-tests.component.html',
  styleUrls: ['./assign-tests.component.scss']
})
export class AssignTestsComponent {
  @Input() availableStudents: userToAssignTest[] = [];
  @Input() assignedStudents: userToAssignTest[] = [];
  @Input() test: TestViewModel;
  @Output() updateAssignedStudents = new EventEmitter<userToAssignTest[]>();

 
  selectedAvailable: userToAssignTest[] = [];
  selectedAssigned: userToAssignTest[] = [];

  assignSelected() {
    this.assignedStudents = [...this.assignedStudents, ...this.selectedAvailable];
    this.availableStudents = this.availableStudents.filter(user => !this.selectedAvailable.includes(user));
    this.selectedAvailable = [];
    this.updateAssignedStudents.emit(this.assignedStudents);
  }

  removeSelected() {
    this.availableStudents = [...this.availableStudents, ...this.selectedAssigned];
    this.assignedStudents = this.assignedStudents.filter(user => !this.selectedAssigned.includes(user));
    this.selectedAssigned = [];
    this.updateAssignedStudents.emit(this.assignedStudents);
  }

  // Function to handle "Add All"
  // assignAll() {
  //   this.assignedStudents = [...this.assignedStudents, ...this.availableStudents];
  //   this.availableStudents = [];
  //   this.updateAssignedStudents.emit(this.assignedStudents);
  // }

  // Function to handle "Remove All"
  // removeAll() {
  //   this.availableStudents = [...this.availableStudents, ...this.assignedStudents];
  //   this.assignedStudents = [];
  //   this.updateAssignedStudents.emit(this.assignedStudents);
  // }

  onCheckboxChange(student: any) {
    if (student.isSelected) {
      if (!this.assignedStudents.includes(student)) {
        this.assignedStudents.push(student);
      }
    } else {
      this.assignedStudents = this.assignedStudents.filter(s => s.id !== student.id);
    }
    console.log('Assigned Students:', this.assignedStudents);
  }

  toggleAssignment(student: any, isAssigning: boolean) {
    student.isSelected = !student.isSelected;
  
    if (isAssigning && student.isSelected) {
      if (!this.assignedStudents.some(s => s.id === student.id)) {
        this.assignedStudents.push(student);
        this.availableStudents = this.availableStudents.filter(s => s.id !== student.id);
      }
    } else if (!isAssigning && !student.isSelected) {
      if (!this.availableStudents.some(s => s.id === student.id)) {
        this.availableStudents.push(student);
        this.assignedStudents = this.assignedStudents.filter(s => s.id !== student.id);
      }
    }
  }
  
  assignAll() {
    // Move all available students to the assigned list
    this.assignedStudents = [
      ...this.assignedStudents, 
      ...this.availableStudents.map(student => ({ ...student, isSelected: false }))
    ];
  
    // Clear the available list
    this.availableStudents = [];
  
    // Emit the updated assigned students
    this.updateAssignedStudents.emit(this.assignedStudents);
  }
  
  
  removeAll() {
    // Move all assigned students back to the available list
    this.availableStudents = [
      ...this.availableStudents, 
      ...this.assignedStudents.map(student => ({ ...student, isSelected: false }))
    ];
  
    // Clear the assigned list
    this.assignedStudents = [];
  
    // Emit the updated assigned students
    this.updateAssignedStudents.emit(this.assignedStudents);
  }
}
