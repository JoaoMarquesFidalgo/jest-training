import passport from 'passport'
import { Request, Response, NextFunction } from 'express'
import * as UserController from '@controllers/userController'
import * as utils from '@lib/utils'

const router = require('express').Router()

// https://localhost:3000/users/login
router.post('/login', (req: Request, res: Response, next: NextFunction): void => {
  UserController.findUser(req, res, next)
})

// https://localhost:3000/users/register
router.post('/register', (req: Request, res: Response): void => {
  UserController.registerUser(req, res)
})

// https://localhost:3000/users/protected
router.get('/protected', passport.authenticate('authentication-needed', { session: false }),
  (req: Request, res: Response): void => {
    res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' })
  })

// https://localhost:3000/users/auth/facebook
// This route goes thru the facebook middleware and checks if the facebook user already exists or new
// If already exists, returns the user, else creates a new one using facebook proprieties
router.get('/auth/facebook', passport.authenticate('facebook-auth', { scope: ['email'] }))

// https://localhost:3000/users/auth/facebook/callback?...&client_id=*****
// This callback is called after te previous route. It comes from Facebook and returns wether the user agreed or not with scope requested
// If the user accepts, it issues a JWT token, just like for normal authentication
router.get('/auth/facebook/callback', passport.authenticate('facebook-auth',
  { failureRedirect: '/failed-login' }), (req: Request, res: Response): void => {
  // Successful authentication, redirect home.
  const tokenObject = utils.issueJWT(req.user)
  res.redirect(`/users/facebook/?token=${tokenObject.token}&expires=${tokenObject.expires}`)
})

// This route exists for user experience, to redirect to a page with the info instead of printing
// the callback url
router.get('/facebook', function (req: Request, res: Response): void {
  // res.status(200).json({ success: true, msg: 'You are successfully authenticated with facebook!' })
  setTimeout(() => {
    res.redirect(`http://localhost:5500/index.html?token=${req.query.token}`)
  }, 200)
})

// https://localhost:3000/users/facebook-route
router.get('/facebook-route', passport.authenticate('facebook-authentication-needed'), function (req: Request, res: Response): void {
  res.status(200).json({ success: true, msg: 'You have access to facebook route!' })
})

module.exports = router
