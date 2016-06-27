import {Injectable} from '@angular/core'

export class User {
  constructor(
    public id: string,
    public name: string,
    public imgSrc: string
  ) {}
}

type Users = {[uId: string]: User}

let mockNames = ['Jonathan Joestar', 'Dio Brando', 'Robert E. O. Speedwagon', 'Will A. Zeppeli', 'Joseph Joestar', 'Caesar Zeppeli', 'Jotaro Kujo', 'Mohammed Avdol', 'Noriaki Kakyoin', 'Jean Pierre Polnareff', 'Boston terrier', 'Josuke Higashikata', 'Yoshikage Kira', 'Giorno Giovanna', 'Diavolo', 'Jolyne Cujoh', 'Enrico Pucci', 'Gyro Zeppeli', 'Neapolitan', 'Johnny Joestar']

let mockSrcs = ['http://vignette1.wikia.nocookie.net/jjba/images/2/23/JonathanAv.png/revision/latest/scale-to-width-down/120?cb=20160414202520', 'http://vignette2.wikia.nocookie.net/jjba/images/f/f0/DioBrandoAv.png/revision/latest/scale-to-width-down/120?cb=20160414203830', 'http://vignette2.wikia.nocookie.net/jjba/images/7/7a/BaronZepelliAv.png/revision/latest/scale-to-width-down/120?cb=20160414204117', 'http://vignette1.wikia.nocookie.net/jjba/images/4/4a/SpeedwagonPhantomBlood….png/revision/latest/scale-to-width-down/120?cb=20160414204406&format=webp', 'http://vignette3.wikia.nocookie.net/jjba/images/2/29/ErinaPendletonAv.png/revision/latest/scale-to-width-down/120?cb=20160414204456&format=webp', 'http://vignette2.wikia.nocookie.net/jjba/images/1/13/JosephAv.png/revision/latest/scale-to-width-down/120?cb=20160414212207&format=webp', 'http://vignette3.wikia.nocookie.net/jjba/images/b/be/CaesarMangaAv.png/revision/latest/scale-to-width-down/120?cb=20160414212337&format=webp', 'http://vignette2.wikia.nocookie.net/jjba/images/0/0b/LisaLisaAv.png/revision/latest/scale-to-width-down/120?cb=20160414212417&format=webp', 'http://vignette2.wikia.nocookie.net/jjba/images/1/15/RudolVonStroheimAv.png/revision/latest/scale-to-width-down/120?cb=20160426165423&format=webp', 'http://vignette1.wikia.nocookie.net/jjba/images/6/67/SpeedwagonBattleTenden….png/revision/latest/scale-to-width-down/120?cb=20160414212621&format=webp', 'http://vignette3.wikia.nocookie.net/jjba/images/6/60/Jotaro1Av.png/revision/latest/scale-to-width-down/120?cb=20150621154813&format=webp', 'http://vignette1.wikia.nocookie.net/jjba/images/c/ca/Joseph2Av.png/revision/latest/scale-to-width-down/120?cb=20140503182220&format=webp', 'http://vignette2.wikia.nocookie.net/jjba/images/e/ec/AvdolAv.png/revision/latest/scale-to-width-down/120?cb=20140503182248&format=webp', 'http://vignette2.wikia.nocookie.net/jjba/images/c/c5/KakyoinAv.png/revision/latest/scale-to-width-down/120?cb=20140503182303&format=webp', 'http://vignette4.wikia.nocookie.net/jjba/images/f/fe/JeanAv.png/revision/latest/scale-to-width-down/120?cb=20140503182116&format=webp', 'http://vignette3.wikia.nocookie.net/jjba/images/e/e4/JosukePic2.png/revision/latest?cb=20160413085206&format=webp', 'http://vignette1.wikia.nocookie.net/jjba/images/8/8b/KoichiAv.png/revision/latest/scale-to-width-down/120?cb=20150621142827&format=webp', 'http://vignette1.wikia.nocookie.net/jjba/images/1/13/OkuyasuAv.png/revision/latest/scale-to-width-down/120?cb=20150621142201&format=webp', 'http://vignette1.wikia.nocookie.net/jjba/images/7/75/RohanAv.png/revision/latest/scale-to-width-down/120?cb=20150614133112&format=webp', 'http://vignette4.wikia.nocookie.net/jjba/images/2/22/Jotaro_Part4_Av.png/revision/latest?cb=20150613134935&format=webp' ]

function getRandom(mocks) {
  let i = ~~(Math.random() * mocks.length)
  return mocks[i]
}

var store: Users = {
    u1: new User(
      'u0', 'crazy diamond',
      'https://cdn-img.fimfiction.net/user/c1oo-1431830582-160473-256'
    )
}

window['userStore'] = store

@Injectable()
export class UserSource {
  getById(id: string): User {
    return store[id]
  }

  addNew(u: User) {
    store[u.id] = u
  }
  ensureLoaded(uId: string): Promise<User> {
    if (store[uId]) return Promise.resolve(store[uId])
    return new Promise((resolve, reject) => {
      let user = new User(
        uId, getRandom(mockNames), getRandom(mockSrcs)
      )
      resolve(store[uId] = user)
      console.log(store)
    })
  }
}
