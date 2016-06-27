import {Component, Input, HostListener} from '@angular/core'
import {NgModel} from '@angular/common'
import {Message, MessageSource} from '../services'

@Component({
  selector: 'message-input',
  template: require('./message-input.jade')(),
  directives: [NgModel]
})
export class MessageInput {
  @Input() convId: string
  text: string
  constructor(private ms: MessageSource) {}

  @HostListener('keydown.enter')
  sendMessage() {
    let t = this.text
    let msg = new Message(
      t, 'u2', 'u1', new Date, undefined
    )
    this.ms.addToConversation(this.convId, msg)
    this.text = ''
  }
}
