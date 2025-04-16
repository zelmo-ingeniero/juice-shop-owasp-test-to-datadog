/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ProductReviewEditComponent } from '../product-review-edit/product-review-edit.component'
import { UserService } from '../Services/user.service'
import { ProductReviewService } from '../Services/product-review.service'
import { Component, Inject, type OnDestroy, type OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft, faCrown, faPaperPlane, faThumbsUp, faUserEdit } from '@fortawesome/free-solid-svg-icons'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { type Review } from '../Models/review.model'
import { type Product } from '../Models/product.model'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatHint } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion'
import { MatButtonModule, MatIconButton } from '@angular/material/button'
import { MatDivider } from '@angular/material/divider'
import { MatTooltip } from '@angular/material/tooltip'
import { NgIf, NgFor, AsyncPipe } from '@angular/common'
import { FlexModule } from '@angular/flex-layout/flex'

library.add(faPaperPlane, faArrowCircleLeft, faUserEdit, faThumbsUp, faCrown)

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  standalone: true,
  imports: [MatDialogContent, FlexModule, NgIf, MatTooltip, MatDivider, MatButtonModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, TranslateModule, NgFor, MatIconButton, MatIconModule, MatFormFieldModule, MatLabel, MatHint, MatInputModule, FormsModule, ReactiveFormsModule, MatDialogActions, MatDialogClose, AsyncPipe]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  public author: string = 'Anonymous'
  public reviews$: any
  public userSubscription: any
  public reviewControl: UntypedFormControl = new UntypedFormControl('', [Validators.maxLength(160)])
  constructor (private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { productData: Product }, private readonly productReviewService: ProductReviewService,
    private readonly userService: UserService, private readonly snackBar: MatSnackBar, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit (): void {
    this.data.productData.points = Math.round(this.data.productData.price / 10)
    this.reviews$ = this.productReviewService.get(this.data.productData.id)
    this.userSubscription = this.userService.whoAmI().subscribe((user: any) => {
      if (user?.email) {
        this.author = user.email
      } else {
        this.author = 'Anonymous'
      }
    }, (err) => { console.log(err) })
  }

  ngOnDestroy () {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  addReview (textPut: HTMLTextAreaElement) {
    const review = { message: textPut.value, author: this.author }

    textPut.value = ''
    this.productReviewService.create(this.data.productData.id, review).subscribe(() => {
      this.reviews$ = this.productReviewService.get(this.data.productData.id)
    }, (err) => { console.log(err) })
    this.snackBarHelperService.open('CONFIRM_REVIEW_SAVED')
  }

  editReview (review: Review) {
    this.dialog.open(ProductReviewEditComponent, {
      width: '500px',
      height: 'max-content',
      data: {
        reviewData: review
      }
    }).afterClosed().subscribe(() => (this.reviews$ = this.productReviewService.get(this.data.productData.id)))
  }

  likeReview (review: Review) {
    this.productReviewService.like(review._id).subscribe(() => {
      console.log('Liked ' + review._id)
    })
    setTimeout(() => (this.reviews$ = this.productReviewService.get(this.data.productData.id)), 200)
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }
}
