import crypto from 'crypto'
import jsonwebtoken from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { User } from '@models/user'
import { jwtObject } from '@models/jwtObject'
import { toGenPassword } from '@models/toGenPassword'

const pathToKey = path.join(__dirname, '..', '../keys-certificates/private.pem')
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8')

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword (password: string, hash: string, salt: string): boolean {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
  return hash === hashVerify
}

/**
 *
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */

function genPassword (password: string): toGenPassword {
  const salt = crypto.randomBytes(32).toString('hex')
  const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
  return {
    salt: salt,
    hash: genHash
  }
}

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT (user: User): jwtObject {
  const _id = user._id

  const expiresIn = '1d'

  const payload = {
    sub: _id,
    iat: Date.now()
  }

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' })

  return {
    token: 'Bearer ' + signedToken,
    expires: expiresIn
  }
}

export {
  validPassword,
  genPassword,
  issueJWT
}
