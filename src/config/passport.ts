import fs from 'fs'
import path from 'path'
import { UserModel, User } from '@models/user'
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback, StrategyOptions } from 'passport-jwt'
import { FacebookObject } from '@models/facebookObject'
import { serializeUser, deserializeUser } from 'passport'
import { ObjectID } from 'mongodb'

const FacebookStrategy = require('passport-facebook').Strategy
const ObjectId = require('mongodb').ObjectID

require('dotenv').config()

// Go up one directory, then look for file name
const pathToKey = path.join(__dirname, '..', '../keys-certificates/public.pem')

// The verifying public key
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8')

// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256']
}

const facebookOptions = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_APP_CALLBACK,
  profileFields: ['id', 'name', 'email']
}

// server.ts will pass the global passport object here, and this function will configure it
module.exports =
(passport: {
  use: (strategyName: string, strategyType: JwtStrategy | typeof FacebookStrategy) => void | any
  serializeUser: typeof serializeUser,
  deserializeUser: typeof deserializeUser
}) => {
  // The JWT payload is passed into the verify callback
  passport.use('authentication-needed', new JwtStrategy(options, function (jwtPayload: any, done: VerifiedCallback): void {
    // Since we are here, the JWT is valid!
    // We will assign the `sub` property on the JWT to the database ID of user
    UserModel.findOne({ _id: new ObjectId(jwtPayload.sub) }, function (err: any, user: User) {
      if (err) {
        return done(err, false)
      }
      if (user) {
        // Since we are here, the JWT is valid and our user is valid, so we are authorized!
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
  }))

  passport.use('facebook-auth', new FacebookStrategy(facebookOptions,
    (accessToken: string, refreshToken: string, profile: FacebookObject, done: VerifiedCallback) => {
      UserModel.findOne({ facebookId: profile.id }, function (err, user) {
        if (err) {
          return done(err, false)
        }
        if (user) {
          // Checks if user was created from facebook
          return (user.facebookId) ? done(null, user) : done(null, false)
        } else {
          const newUser = new User()
          newUser._id = new ObjectId()
          newUser.email = profile.emails[0].value
          newUser.name = profile.name.givenName + ' ' + profile.name.familyName
          newUser.facebookId = profile.id
          UserModel.create(newUser).then((user) => {
            if (user) return done(null, user)
          }).catch((error) => {
            if (error) return done(null, false)
          })
        }
      })
    }
  ))

  passport.use('facebook-authentication-needed', new JwtStrategy(options, function (jwtPayload: any, done: VerifiedCallback): void {
    // Since we are here, the JWT is valid!
    // We will assign the `sub` property on the JWT to the database ID of user
    UserModel.findOne({ _id: new ObjectId(jwtPayload.sub) }, function (err: any, user: User) {
      if (err) {
        return done(err, false)
      }
      if (user && user.facebookId) {
        // Since we are here, the JWT is valid and our user is valid, so we are authorized!
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
  }))

  passport.serializeUser((user: User, done: VerifiedCallback): void => {
    done(null, user._id)
  })

  passport.deserializeUser((id: string, done: VerifiedCallback): void => {
    UserModel.findById(new ObjectID(id), function (err, user) {
      done(err, user)
    })
  })
}
