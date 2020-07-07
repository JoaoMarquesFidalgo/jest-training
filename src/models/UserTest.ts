import { getModelForClass, prop } from '@typegoose/typegoose'
import * as mongoose from 'mongoose'

// import { IModelOptions } from '@typegoose/typegoose/lib/types'
type ObjectId = mongoose.Types.ObjectId;

export class UserTest {
  @prop()
  public username?: string;

  @prop({ required: true })
  public email: string;

  @prop()
  public passwordHashed?: string;

  constructor (userTest: UserTest) {
    this.username = userTest.username
    this.email = userTest.email
    this.passwordHashed = userTest.passwordHashed
  }
}

export const UserTestModel = getModelForClass(UserTest)
