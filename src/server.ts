import cors from 'cors'
import express from 'express'
import fs from 'fs'
import https from 'https'
import passport from 'passport'
import path from 'path'

require('dotenv').config()

const app = express()

// require('@config/database')
require('@models/user')

require('@config/passport')(passport)

app.use(passport.initialize())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

app.use(require('@routes/routes'))

// Https
const options = {
  key: fs.readFileSync(path.join(__dirname, '..', './keys-certificates/privateHttpsKey.key')),
  cert: fs.readFileSync(path.join(__dirname, '..', './keys-certificates/certificateHttps.crt'))
}
const credentials = { key: options.key, cert: options.cert }
const httpsServer = https.createServer(credentials, app)
httpsServer.listen(process.env.DEV_PORT || 3000, () => console.log('listening on port 3000'))

export { app, httpsServer }
