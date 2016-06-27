# angular2-webpack

A complete, yet simple, starter for Angular 2 using Webpack.


[Is Angular 2 Ready Yet?](http://splintercode.github.io/is-angular-2-ready/)

### Quick start

> Clone/Download the repo then edit `app.ts` inside [`/src/app/app.ts`](/src/app/app.ts)

how to install
```bash
PHANTOMJS_CDNURL=https://npm.taobao.org/dist/phantomjs npm install
```

### Dirty Fix
After installing node_modules dependencies, You may need to manually remove `require` related statements in `BigInt/src/BigInt.js` so that webpack does not complain.

### design

Using rxjs is intended. It provide a way to centralize logic.
Here I present several alternatives' pros and cons.

redux style:
---
Flux arch's state of art

approach: `view` dipatches `action`, `reducer` processes `action` and change `store`, `store` updates `view`

pros:
* dead simple data flow
* reducer can be as synchronous as possible
* easier to debug

cons:
* in virtue every reducer is a hard code into application
* no higher order composition
* logic is scattered across dumb view, smart view, and reducer
* control flow is inverted (https://github.com/Swizec/react-particles-experiment)


CPS style:
---
aka callback based observer pattern.

approach:
Every event is handled manually.

pros:
* No stroke win a trick. A chinese proverb like 'silence makes big money'
* intuitive

cos:
* state must be explicitly shared between components
* no high order composition, not even logic reuse
* concrete command couples with concrete events

To sum up, observer pattern is not scalable. Code soonly becomes unnamable chaos

reactive style:
---
rxjs, rxjava, rxscala, rxandroid, rxswift, rxpy, rxgo, rxwhateveryounameit

approach:
event and logic is encapsulated in asynchronous stream. (yes, logic is in stream too, in the form of closure)

pros:
* very expressive and concise
* observer without inversion of control
* fine tuned scheduler control with one line of code

cons:
* unintuitive
* all operators take a hidden parameter, namely, time.
* too many operators to learn


Choose Crypto
----

It seems web cryptography is the ideal library, but it lacks AES256-IGE.
https://medium.com/@encryb/comparing-performance-of-javascript-cryptography-libraries-42fb138116f3#.5jwcjgmem

http://www.slideshare.net/kevinhakanson/developers-guide-to-javascript-and-web-cryptography


