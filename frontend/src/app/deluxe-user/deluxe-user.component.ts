/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, type OnInit } from '@angular/core'
import { UserService } from '../Services/user.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationService } from '../Services/configuration.service'
import { SocketIoService } from '../Services/socket-io.service'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'
import { NgIf } from '@angular/common'

@Component({
  selector: 'app-deluxe-user',
  templateUrl: './deluxe-user.component.html',
  styleUrls: ['./deluxe-user.component.scss'],
  standalone: true,
  imports: [NgIf, MatCardModule, TranslateModule, MatButtonModule, MatIconModule]
})

export class DeluxeUserComponent implements OnInit {
  public membershipCost: number = 0
  public error?: string = undefined
  public applicationName = 'OWASP Juice Shop'
  public logoSrc: string = 'assets/public/images/JuiceShop_Logo.png'

  public SHOWCASES = [
    {
      icon: 'slideshow',
      name: 'LABEL_DEALS_OFFERS',
      description: 'DESCRIPTION_DEALS_OFFERS'
    },
    {
      icon: 'directions_car',
      name: 'LABEL_FREE_FAST_DELIVERY',
      description: 'DESCRIPTION_FREE_FAST_DELIVERY'
    },
    {
      icon: 'add',
      name: 'LABEL_UNLIMITED_PURCHASE',
      description: 'DESCRIPTION_UNLIMITED_PURCHASE'
    }
  ] as const

  constructor (private readonly router: Router, private readonly userService: UserService, private readonly configurationService: ConfigurationService, private readonly route: ActivatedRoute, private readonly ngZone: NgZone, private readonly io: SocketIoService) {
  }

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      const decalParam: string = this.route.snapshot.queryParams.testDecal // "Forgotten" test parameter to play with different stickers on the delivery box image
      if (config?.application) {
        if (config.application.name) {
          this.applicationName = config.application.name
        }
        if (config.application.logo) {
          let logo: string = config.application.logo

          if (logo.substring(0, 4) === 'http') {
            logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
          }
          this.logoSrc = `assets/public/images/${decalParam || logo}`
        }
      }
      if (decalParam) {
        this.ngZone.runOutsideAngular(() => {
          this.io.socket().emit('verifySvgInjectionChallenge', decalParam)
        })
      }
    }, (err) => { console.log(err) })
    this.userService.deluxeStatus().subscribe((res) => {
      this.membershipCost = res.membershipCost
    }, (err) => {
      this.error = err.error.error
    })
  }

  upgradeToDeluxe () {
    this.ngZone.run(async () => await this.router.navigate(['/payment', 'deluxe']))
  }
}
