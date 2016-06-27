import {Injectable} from '@angular/core'

export class Conversation {
  constructor(
    public title: string,
    public userId: string,
    public lastMsg: string,
    public unreadNum: number,
    public thumbnailSrc: string
  ) {}
}

type Conversations = {[userId: string]: Conversation}

let mockTitles = ['Phantom Blood', 'Battle Tendency', 'Stardust Crusaders', ' Diamond Is Unbreakable', ' Vento Aureo', ' Stone Ocean', ' Steel Ball Run', ' JoJolion']

function getRandom(mocks) {
  let i = ~~(Math.random() * mocks.length)
  return mocks[i]
}

var store: Conversations = {
  u1: new Conversation(
    'daimond is unbreakable' ,
    'u1',
    'dorarararara',
    1,
    'http://www.neowing.co.jp/pictures/s/01/15/WHV-1000597883.jpg?v=2'
  )
}
window['convStore'] = store

@Injectable()
export class ConversationSource {
  getConversations(): Conversations {
    return store
  }

  addConversation(c: Conversation) {
    store[c.userId] = c
  }

  ensureLoaded(userId: string): Promise<Conversation> {
    if (store[userId]) {
      return Promise.resolve(store[userId])
    }
    return new Promise((resolve, reject) => {
      let conv = new Conversation(
        getRandom(mockTitles), userId, '', 0, ''
      )
      resolve(store[userId] = conv)
      console.log(store)
    })
  }
}
