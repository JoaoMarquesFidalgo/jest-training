import mongoose from 'mongoose'

require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})

const connectionTo = process.env.DB_STRING
// const prodConnection = process.env.DB_STRING_PROD;

mongoose.connect(connectionTo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
  console.log('Database connected')
})

export { mongoose }
