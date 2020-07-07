import { Request, Response } from 'express'

const router = require('express').Router()

router.get('/failed-login', (req: Request, res: Response): void => {
  res.status(200).json({ success: true, msg: 'Failed to login!' })
})

// Use the routes defined in `./users.js` for all activity to http://localhost:3000/users/
router.use('/users', require('./users'))

module.exports = router
