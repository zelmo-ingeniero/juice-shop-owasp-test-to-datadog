/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { ComplaintService } from '../Services/complaint.service'
import { UserService } from '../Services/user.service'
import { Component, ElementRef, type OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FileUploader, FileUploadModule } from 'ng2-file-upload'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBomb } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatHint, MatError } from '@angular/material/form-field'
import { NgIf } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { FlexModule } from '@angular/flex-layout/flex'
import { MatIconModule } from '@angular/material/icon'

library.add(faBomb)

@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.scss'],
  standalone: true,
  imports: [FlexModule, MatCardModule, TranslateModule, NgIf, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, ReactiveFormsModule, MatHint, MatError, FileUploadModule, MatButtonModule, MatIconModule]
})
export class ComplaintComponent implements OnInit {
  public customerControl: UntypedFormControl = new UntypedFormControl({ value: '', disabled: true }, [])
  public messageControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.maxLength(160)])
  @ViewChild('fileControl', { static: true }) fileControl!: ElementRef // For controlling the DOM Element for file input.
  public fileUploadError: any = undefined // For controlling error handling related to file input.
  public uploader: FileUploader = new FileUploader({
    url: environment.hostServer + '/file-upload',
    authToken: `Bearer ${localStorage.getItem('token')}`,
    allowedMimeType: ['application/pdf', 'application/xml', 'text/xml', 'application/zip', 'application/x-zip-compressed', 'multipart/x-zip', 'application/yaml', 'application/x-yaml', 'text/yaml', 'text/x-yaml'],
    maxFileSize: 100000
  })

  public userEmail: any = undefined
  public complaint: any = undefined
  public confirmation: any

  constructor (private readonly userService: UserService, private readonly complaintService: ComplaintService, private readonly formSubmitService: FormSubmitService, private readonly translate: TranslateService) { }

  ngOnInit (): void {
    this.initComplaint()
    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      this.fileUploadError = filter
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Error due to : ${filter.name}`)
    }
    this.uploader.onAfterAddingFile = () => {
      this.fileUploadError = undefined
    }
    this.uploader.onSuccessItem = () => {
      this.saveComplaint()
      this.uploader.clearQueue()
    }
    this.formSubmitService.attachEnterKeyHandler('complaint-form', 'submitButton', () => { this.save() })
  }

  initComplaint () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.complaint = {}
      this.complaint.UserId = user.id
      this.userEmail = user.email
      this.customerControl.setValue(this.userEmail)
    }, (err) => {
      this.complaint = undefined
      console.log(err)
    })
  }

  save () {
    if (this.uploader.queue[0]) {
      this.uploader.queue[0].upload()
      this.fileControl.nativeElement.value = null
    } else {
      this.saveComplaint()
    }
  }

  saveComplaint () {
    this.complaint.message = this.messageControl.value
    this.complaintService.save(this.complaint).subscribe((savedComplaint: any) => {
      this.translate.get('CUSTOMER_SUPPORT_COMPLAINT_REPLY', { ref: savedComplaint.id }).subscribe((customerSupportReply) => {
        this.confirmation = customerSupportReply
      }, (translationId) => {
        this.confirmation = translationId
      })
      this.initComplaint()
      this.resetForm()
      this.fileUploadError = undefined
    }, (error) => error)
  }

  resetForm () {
    this.messageControl.setValue('')
    this.messageControl.markAsUntouched()
    this.messageControl.markAsPristine()
    this.fileControl.nativeElement.value = null
  }
}
