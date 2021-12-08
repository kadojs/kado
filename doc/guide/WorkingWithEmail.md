# Working with Email

Kado makes sending a receiving email easy. The Kado approach is to stay out
of the way and make it easy for the developer to use an Email package of choice.

The Email system in Kado utilizes the Connect.js class to allow for multiple
email clients. A developer can configure email clients as needed to facilitate
program operations.

Here is an example using EmailJS.

First, there needs to be a class to create an EmailEngine in order for use
with the Email Connect system.

`lib/EmailJS.js`
```js
'use strict'
const ejs = require('emailjs')
const Email = require('kado/lib/Email')
const SMTPClient = ejs.SMTPClient
const PromiseMore = require('kado/lib/PromiseMore')
const config = require('../config')
class EmailJS extends Email.EmailEngine {
  constructor (options = {}) {
    super()
    if (config.email.enabled) {
      this.engine = new SMTPClient({
        user: options.user,
        password: options.password,
        host: options.host,
        ssl: options.ssl,
        tls: options.tls
      })
    }
  }

  send (message) {
    if (!config.email.enabled) return true
    return PromiseMore.make(this.engine, this.engine.send, message)
  }
}
EmailJS.ejs = ejs
EmailJS.Email = Email
module.exports = EmailJS
```

Also, some configuration is needed, typically stored in `config.js`.

```js
module.exports = {
 email: {
  enabled: false,
  user: 'apiuser',
  password: 'apipassword',
  host: 'emailhost',
  port: 25,
  ssl: false,
  tls: false,
  from: 'from@example.com',
  cc: 'copy@example.com',
  replyTo: 'reply@example.com',
  defaultFrom: 'person@example.com',
  defaultSubject: 'Email from Example'
 }
}
```

Next, in the `lib/App.js` declaration, references to the Email engine need to
 be added like so.

```js
const Application = require('kado/lib/Application')
const EmailJS = require('./EmailJS')
// ...
app.log.addEngine('console', log)
// add email engine
app.email.addEngine('email', new EmailJS(cfg.email))
```

As you can see after the email engine is added during application startup. It
can be used anywhere in the application.

Let's see an example.

```js
const config = {
  email: {
    enabled: true,
    from: 'test@example.com',
    to: 'example@example.com',
    cc: null
  }
}
const emailSubject = 'A new message'
const emailText = 'Some message'
const emailHtml = '<p>Some message</p>'
const emailJS = app.email.getEngine('email')
const emailMessageParams = {
  text: emailText,
  from: config.email.from,
  to: client.email,
  cc: config.email.cc,
  subject: emailSubject,
  attachment: [
    { data: emailHtml, alternative: true }
  ]
}
// when email is not configured, messages will print to the console this way
if (config.email.enabled) {
  await emailJS.send(emailMessageParams)
} else {
  console.log(emailMessageParams)
}
```
As you can see here, using email in Kado is very easy. More email engines can
be added to accommodate larger setups.

In our next guide, we will explain how to parse incoming email.
