import * as utils from '@lib/utils'
import { jwtObject } from '@models/jwtObject'
import { toGenPassword } from '@models/toGenPassword'
import { User } from '@models/user'
import * as faker from 'faker/locale/pt_BR'
import { ObjectId } from 'mongodb'

describe('utils', () => {
  it('should generate an hash and salt from password', () => {
    const password = faker.name.firstName()

    // eslint-disable-next-line new-cap
    const generatedPassword = new toGenPassword()
    const passwordFromUtils: toGenPassword = utils.genPassword(password)
    generatedPassword.hash = passwordFromUtils.hash
    generatedPassword.salt = passwordFromUtils.salt
    expect(generatedPassword.salt).toBeDefined()
    expect(generatedPassword.salt).toEqual(generatedPassword.salt)
    expect(generatedPassword.hash).toBeDefined()
    expect(generatedPassword.hash).toEqual(generatedPassword.hash)
  })

  it('should generate two hash and salt from password and compare, being different from one another', () => {
    const password = faker.internet.password()
    const generatedPassword = utils.genPassword(password)
    expect(generatedPassword.salt).toBeDefined()
    expect(generatedPassword.hash).toBeDefined()
    const secondGeneratedPassword = utils.genPassword(password)
    expect(secondGeneratedPassword.salt).toBeDefined()
    expect(secondGeneratedPassword.hash).toBeDefined()
    expect(generatedPassword).not.toEqual(secondGeneratedPassword)
  })

  it('should generate an hash and salt from password and compare the password', () => {
    const password = faker.internet.password()
    const generatedPassword = utils.genPassword(password)
    expect(generatedPassword.salt).toBeDefined()
    expect(generatedPassword.hash).toBeDefined()
    const compared = utils.validPassword(password, generatedPassword.hash, generatedPassword.salt)
    expect(compared).toBe(true)
  })

  it('should generate an hash and salt from password and fail to compare with another password', () => {
    const password = faker.internet.password()
    const secondPassword = faker.internet.password()
    const generatedPassword = utils.genPassword(password)
    expect(generatedPassword.salt).toBeDefined()
    expect(generatedPassword.hash).toBeDefined()
    const compared = utils.validPassword(secondPassword, generatedPassword.hash, generatedPassword.salt)
    expect(compared).toBe(false)
  })

  it('should generate a JWT token', () => {
    const user: User = {
      _id: new ObjectId(),
      email: faker.internet.email()
    }
    // eslint-disable-next-line new-cap
    const jwtToken: jwtObject = new jwtObject()
    const receivedJwt = utils.issueJWT(user)
    jwtToken.expires = receivedJwt.expires
    jwtToken.token = receivedJwt.token
    expect(jwtToken.token).toBeDefined()
    expect(jwtToken.expires).toBe('1d')
  })
})
