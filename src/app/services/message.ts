import {Injectable} from '@angular/core'

export class Message {
  constructor(
    public content: string,
    public fromId: string,
    public toId: string,
    public sentTime: Date,
    public receiveTime: Date
  ) {}
}

let store: {[convId: string]: Message[]} = {
  'u1': [
      new Message(
        'dorarararara',
        'u1',
        'u2',
        new Date(1997, 7, 5),
        new Date(1998, 6, 12)
      )
  ]
}

window['msgStore'] = store

@Injectable()
export class MessageSource {
  getByConversation(convId: string): Message[] {
    return store[convId]
  }

  addToConversation(convId: string, m: Message) {
    store[convId] = store[convId] || []
    store[convId].push(m)
  }
}
