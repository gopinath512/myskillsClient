// =============================
// Email: info@ebenmonney.com
// www.ebenmonney.com/templates
// =============================

import { UserType } from "./enums";

export class User {
  // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
  constructor(id?: string, userName?: string, fullName?: string, email?: string, jobTitle?: string, phoneNumber?: string, roles?: string[], userType?: UserType,profileImage?:any) {

    this.id = id;
    this.userName = userName;
    this.fullName = fullName;
    this.profileImage = profileImage
    this.email = email;
    this.jobTitle = jobTitle;
    this.phoneNumber = phoneNumber;
    this.roles = roles;
    this.userType = userType
  }

  get friendlyName(): string {
    let name = this.fullName || this.userName;

    if (this.jobTitle) {
      name = this.jobTitle + ' ' + name;
    }

    return name;
  }


  public id: string;
  public userName: string;
  public fullName: string;
  public email: string;
  public gradeId: number;
  public emailConfirmed: boolean;
  public jobTitle: string;
  public phoneNumber: string;
  public isEnabled: boolean;
  public isLockedOut: boolean;
  public roles: string[];
  public userType?: UserType;
  public profileImage?:any
}
