/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TwoFactorAuthService } from '../Services/two-factor-auth-service'
import { CookieService } from 'ngy-cookie'
import { UserService } from '../Services/user.service'
import { Router } from '@angular/router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltip } from '@angular/material/tooltip'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatSuffix, MatHint, MatError } from '@angular/material/form-field'
import { NgIf } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'
import { FlexModule } from '@angular/flex-layout/flex'

library.add(faUnlockAlt)

interface TokenEnterFormFields {
  token: string
}

@Component({
  selector: 'app-two-factor-auth-enter',
  templateUrl: './two-factor-auth-enter.component.html',
  styleUrls: ['./two-factor-auth-enter.component.scss'],
  standalone: true,
  imports: [FlexModule, MatCardModule, TranslateModule, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatLabel, MatInputModule, MatIconModule, MatSuffix, MatTooltip, MatHint, MatError, MatButtonModule]
})
export class TwoFactorAuthEnterComponent {
  public twoFactorForm: UntypedFormGroup = new UntypedFormGroup({
    token: new UntypedFormControl('', [Validators.minLength(6), Validators.maxLength(6), Validators.required, Validators.pattern('^[\\d]{6}$')])
  })

  public errored: boolean = false

  constructor (
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly cookieService: CookieService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly ngZone: NgZone
  ) { }

  verify () {
    const fields: TokenEnterFormFields = this.twoFactorForm.value

    this.twoFactorAuthService.verify(fields.token).subscribe((authentication) => {
      localStorage.setItem('token', authentication.token)
      const expires = new Date()
      expires.setHours(expires.getHours() + 8)
      this.cookieService.put('token', authentication.token, { expires })
      sessionStorage.setItem('bid', authentication.bid?.toString())
      /* Use userService to notifiy if user has logged in */
      /* this.userService.isLoggedIn = true; */
      this.userService.isLoggedIn.next(true)
      this.ngZone.run(async () => await this.router.navigate(['/search']))
    }, (error) => {
      this.errored = true
      setTimeout(() => {
        this.errored = false
      }, 5 * 1000)
      return error
    })
  }
}
