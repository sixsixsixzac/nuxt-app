import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { Product } from './models/Product.js'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const PORT = Number(process.env.PORT) || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt-app'

async function connectDb() {
  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB connected')
}

app.get('/products', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
    const skip = Math.max(0, Number(req.query.skip) || 0)
    const select = req.query.select

    const query = Product.find().sort({ id: 1 })
    const total = await Product.countDocuments()

    if (select && String(select).trim()) {
      const fields = String(select).split(',').map((s) => s.trim()).filter(Boolean)
      if (fields.length) query.select(fields.join(' '))
    }

    const products = await query.skip(skip).limit(limit).lean()

    res.json({
      products: products.map((p) => {
        const { _id, __v, ...rest } = p
        return rest
      }),
      total,
      skip,
      limit,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product id' })
    }

    const product = await Product.findOneAndDelete({ id })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const doc = product.toObject()
    const { _id, __v, ...rest } = doc

    res.json({
      ...rest,
      isDeleted: true,
      deletedOn: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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
