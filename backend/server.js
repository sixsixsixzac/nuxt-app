import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import * as categoryController from './controllers/categoryController.js'
import * as productController from './controllers/productController.js'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const PORT = Number(process.env.PORT) || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt-app'

async function connectDb() {
  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB connected')
}

app.get('/categories', categoryController.list)
app.get('/products', productController.list)
app.delete('/products/:id', productController.remove)

async function start() {
  await connectDb()
  app.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start:', err)
  process.exit(1)
})
