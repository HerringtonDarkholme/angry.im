import {Injectable, ChangeDetectorRef} from '@angular/core'
import {ConversationSource} from './conversation'
import {Message, MessageSource} from './message'
import {UserSource} from './user'

@Injectable()
export class Client {
  constructor(
    private cs: ConversationSource,
    private ms: MessageSource,
    private us: UserSource,
    private cd: ChangeDetectorRef

  ) {
  }

  receiveNewMessage(m) {
    let msg = new Message(
      m.content,
      m.from,
      m.to,
      m.sentTime,
      new Date()
    )
    Promise.all([
      this.cs.ensureLoaded(m.from),
      this.us.ensureLoaded(m.from)
    ]).then((all) => {
      this.ms.addToConversation(m.from, msg)
      this.cd.markForCheck()
      this.cd.detectChanges()
      console.log('we')
    })
  }
}
