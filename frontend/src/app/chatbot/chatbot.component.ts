/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChatbotService } from '../Services/chatbot.service'
import { UserService } from '../Services/user.service'
import { Component, type OnDestroy, type OnInit } from '@angular/core'
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBomb } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { CookieService } from 'ngy-cookie'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field'
import { NgFor, NgIf } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { FlexModule } from '@angular/flex-layout/flex'

library.add(faBomb)

enum MessageSources {
  user = 'user',
  bot = 'bot'
}

interface ChatMessage {
  author: MessageSources.user | MessageSources.bot
  body: string
}

interface MessageActions {
  response: string
  namequery: string
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  standalone: true,
  imports: [FlexModule, MatCardModule, NgFor, NgIf, MatFormFieldModule, MatLabel, TranslateModule, MatInputModule, FormsModule, ReactiveFormsModule]
})
export class ChatbotComponent implements OnInit, OnDestroy {
  public messageControl: UntypedFormControl = new UntypedFormControl()
  public messages: ChatMessage[] = []
  public juicyImageSrc: string = 'assets/public/images/ChatbotAvatar.png'
  public profileImageSrc: string = 'assets/public/images/uploads/default.svg'
  public messageActions: MessageActions = {
    response: 'query',
    namequery: 'setname'
  }

  public currentAction: string = this.messageActions.response

  private chatScrollDownTimeoutId: ReturnType<typeof setTimeout> | null = null

  constructor (private readonly userService: UserService, private readonly chatbotService: ChatbotService, private readonly cookieService: CookieService, private readonly formSubmitService: FormSubmitService, private readonly translate: TranslateService) { }

  ngOnDestroy (): void {
    if (this.chatScrollDownTimeoutId) {
      clearTimeout(this.chatScrollDownTimeoutId)
    }
  }

  ngOnInit (): void {
    this.chatbotService.getChatbotStatus().subscribe((response) => {
      this.messages.push({
        author: MessageSources.bot,
        body: response.body
      })
      if (response.action) {
        this.currentAction = this.messageActions[response.action]
      }
    })

    this.userService.whoAmI().subscribe((user: any) => {
      this.profileImageSrc = user.profileImage
    }, (err) => {
      console.log(err)
    })
  }

  handleResponse (response) {
    this.messages.push({
      author: MessageSources.bot,
      body: response.body
    })
    this.currentAction = this.messageActions[response.action]
    if (response.token) {
      localStorage.setItem('token', response.token)
      const expires = new Date()
      expires.setHours(expires.getHours() + 8)
      this.cookieService.put('token', response.token, { expires })
    }
  }

  sendMessage () {
    const messageBody = this.messageControl.value
    if (messageBody) {
      this.messages.push({
        author: MessageSources.user,
        body: messageBody
      })
      this.messageControl.setValue('')
      this.chatbotService.getChatbotStatus().subscribe((response) => {
        if (!response.status && !response.action) {
          this.messages.push({
            author: MessageSources.bot,
            body: response.body
          })
        } else {
          this.chatbotService.getResponse(this.currentAction, messageBody).subscribe((response) => {
            this.handleResponse(response)
          })
        }
        this.chatScrollDownTimeoutId = setTimeout(() => {
          const chat = document.getElementById('chat-window')
          chat.scrollTop = chat.scrollHeight
          this.chatScrollDownTimeoutId = null
        }, 250)
      })
    }
  }
}
