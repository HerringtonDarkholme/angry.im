import {Component} from '@angular/core'
import {RouteParams} from '@angular/router-deprecated'
import {Message, MessageSource} from '../services'
import {MessageInput} from './message-input'

@Component({
  selector: 'conversation-view',
  template: require('./conversation-view.jade')(),
  providers: [MessageSource],
  directives: [MessageInput]
})
export class ConversationView {
  convId: string
  messages: Message[]
  constructor(param: RouteParams, private ms: MessageSource) {
    this.convId = param.get('id')
    this.messages = ms.getByConversation(this.convId)
  }
}
