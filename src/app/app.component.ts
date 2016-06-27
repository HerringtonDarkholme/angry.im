import { Component, provide, Injector} from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import {
  MessageSource,
  ConversationSource,
  UserSource,
  Client
} from './services'
import {ConversationView} from './components/conversation-view'
import {ConversationList} from './components/conversation-list'

const APP_PROVIDERS = [
    provide(MessageSource, {useClass: MessageSource}),
    provide(UserSource, {useClass: UserSource}),
    provide(ConversationSource, {useClass: ConversationSource}),
    provide(Client, {useClass: Client}),
]

@Component({
  selector: 'app',
  template: require('./app.component.jade')(),
  styles: [require('./app.component.styl')],
  providers: APP_PROVIDERS,
  directives: [...ROUTER_DIRECTIVES, ConversationList],
})
@RouteConfig([
  {path: '/chat/:id', name: 'Messages', component: ConversationView}
])
export class AppComponent {
  constructor(c: Client, inj: Injector) {
    window['client'] = c
    window['inj'] = inj
  }
}
