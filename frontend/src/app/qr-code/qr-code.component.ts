/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog'
import { Component, Inject, type OnInit } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { QrCodeModule } from 'ng-qrcode'
import { MatDivider } from '@angular/material/divider'
import { FlexModule } from '@angular/flex-layout/flex'

library.add(faArrowCircleLeft)

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  standalone: true,
  imports: [FlexModule, MatDivider, QrCodeModule, MatButtonModule, MatDialogClose, TranslateModule]
})
export class QrCodeComponent implements OnInit {
  public title!: string
  public url!: string
  public address!: string
  public data!: string
  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  ngOnInit (): void {
    this.title = this.dialogData.title
    this.url = this.dialogData.url
    this.address = this.dialogData.address
    this.data = this.dialogData.data
  }
}
