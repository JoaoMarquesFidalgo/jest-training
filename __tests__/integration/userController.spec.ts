import { User } from '@models/user'
import { UserTest, UserTestModel } from '@models/UserTest'
import * as faker from 'faker/locale/pt_BR'
import mongoose from 'mongoose'
import request from 'supertest'

import { app, httpsServer } from '../../src/server'

require('dotenv').config({ path: '.env.test' })
let connection: typeof mongoose

// The first param is a description of what the test should do
// The second param is the test itself

/**
 *
 *
 *
 *
 */

describe('User Model', () => {
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

  beforeEach(async () => {
    const collections = await connection.connection.db.collections()
    if (collections.length > 0) {
      for (const collection of collections) {
        await collection.drop()
      }
    }
  })

  it('should create a user', async () => {
    const user: UserTest = {
      email: 'joao@gmail.com',
      passwordHashed: '1234',
      username: 'fidalgo'
    }
    const userTest = new UserTest(user)
    const savedUser = await UserTestModel.create(userTest)
    expect(savedUser._id).toBeDefined()
    expect(savedUser.email).toBe(user.email)
    expect(savedUser.passwordHashed).toBe(user.passwordHashed)
    expect(savedUser.username).toBe(user.username)
  })

  it('should insert user successfully, but the field not defined should be undefined', async () => {
    const user: UserTest = {
      email: 'joao@gmail.com',
      passwordHashed: '1234'
    }
    const userWithInvalidField = new UserTestModel(user)
    const savedUserWithInvalidField = await userWithInvalidField.save()
    expect(savedUserWithInvalidField._id).toBeDefined()
    expect(savedUserWithInvalidField.username).toBeUndefined()
  })

  it('should test if beforeEach works', async () => {
    const users = await UserTestModel.find().exec()
    expect(users.length).toBe(0)
  })
})

/**
 *
 *
 *
 *
 */

describe('Authentication', () => {
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
  it('should create a new user, and fail because no email was passed', async () => {
    const newUser = new User()
    const response = await request(app).post('/users/register').send({ newUser, password: faker.internet.password() })
    expect(response.status).toBe(400)
  })

  // SubTest 2
  it('should create a new user, and succeed', async () => {
    const newUser = {
      email: faker.internet.email(),
      password: faker.internet.password()
    }
    const response = await request(app).post('/users/register').send(newUser)
    expect(response.status).toBe(200)
    expect(response.body).toBeDefined()
    expect(response.body.user.email).toBe(newUser.email)
  })

  // SubTest 3
  it('should create a new user and login, fail because password is incorrect', async () => {
    const newUser = {
      email: faker.name.findName(),
      password: faker.internet.password()
    }
    await request(app).post('/users/register').send(newUser)

    newUser.password = faker.internet.password()

    const response = await request(app).post('/users/login').send(newUser)
    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })

  // SubTest 4
  it('should create a new user and login, and succeed', async () => {
    const newUser = {
      email: faker.name.findName(),
      password: faker.internet.password()
    }
    await request(app).post('/users/register').send(newUser)

    const response = await request(app).post('/users/login').send(newUser)
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
