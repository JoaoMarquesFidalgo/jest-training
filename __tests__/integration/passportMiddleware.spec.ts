import { issueJWT } from '@lib/utils'
import { User } from '@models/user'
import * as faker from 'faker/locale/pt_BR'
import { ObjectId } from 'mongodb'
// import { UserTest, UserTestModel } from '@models/UserTest'
import mongoose from 'mongoose'
import request from 'supertest'

import { app, httpsServer } from '../../src/server'

require('dotenv').config({ path: '.env.test' })
let connection: typeof mongoose

describe('protected route authentication', () => {
  beforeAll(async () => {
    connection = await mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  })

  afterAll(async () => {
    connection.disconnect()
  })

  beforeEach(async () => {
    const collections = await connection.connection.db.collections()
    if (collections.length > 0) {
      for (const collection of collections) {
        await collection.drop()
      }
    }
  })

  afterEach(async () => {
    if (httpsServer.listening) {
      httpsServer.close()
    }
  })

  // SubTest 1
  it('should access protected route and be unauthorized because no jwt was passed', async () => {
    const response = await request(app).get('/users/protected')
    expect(response.status).toBe(401)
  })

  // Subtest 2
  it('should access protected route and be unauthorized because random jwt was passed', async () => {
    const user: User = {
      _id: new ObjectId(),
      email: faker.internet.email()
    }
    const jwtToken = issueJWT(user)
    const response = await request(app).get('/users/protected').set('Authorization', jwtToken.token)
    expect(response.status).toBe(401)
  })

  // SubTest 3
  it('should access protected route and succeed with valid jwt', async () => {
    const newUser: User = {
      email: faker.name.findName(),
      password: faker.internet.password()
    }
    let response = await request(app).post('/users/register').send(newUser)
    expect(response.status).toBe(200)

    response = await request(app).post('/users/login').send(newUser)
    expect(response.status).toBe(200)

    response = await request(app).get('/users/protected').set('Authorization', response.body.token)
    expect(response.status).toBe(200)
  })
})

describe('facebook route authentication', () => {
  beforeAll(async () => {
    connection = await mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  })

  afterAll(async () => {
    connection.disconnect()
  })

  beforeEach(async () => {
    const collections = await connection.connection.db.collections()
    if (collections.length > 0) {
      for (const collection of collections) {
        await collection.drop()
      }
    }
  })

  afterEach(async () => {
    if (httpsServer.listening) {
      httpsServer.close()
    }
  })

  it('should access facebook route and fail because user does not have facebookId', async () => {
    const newUser: User = {
      email: faker.name.findName(),
      password: faker.internet.password()
    }
    let response = await request(app).post('/users/register').send(newUser)
    expect(response.status).toBe(200)

    response = await request(app).post('/users/login').send(newUser)
    expect(response.status).toBe(200)

    response = await request(app).get('/users/facebook-route').set('Authorization', response.body.token)
    expect(response.status).toBe(401)
  })
})
