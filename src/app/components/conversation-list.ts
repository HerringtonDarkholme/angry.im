import {Component} from '@angular/core'
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated'
import {Conversation, ConversationSource} from '../services'

@Component({
  selector: 'conversation-list',
  template: require('./conversation-list.jade')(),
  directives: [...ROUTER_DIRECTIVES],
})
export class ConversationList {
  convs: {[k: string]: Conversation}
  constructor(private cs: ConversationSource) {
    this.convs = cs.getConversations()
  }
  keys() {
    return Object.keys(this.convs)
  }
}
