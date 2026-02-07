import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

import mongoose from 'mongoose'
import { Product } from '../models/Product.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt-app'

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB connected')

  const res = await fetch('https://dummyjson.com/products?limit=100')
  const data = await res.json()

  const products = data.products.map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail ?? '',
    brand: p.brand ?? '',
    category: p.category ?? '',
    price: p.price,
    discountPercentage: p.discountPercentage,
    rating: p.rating ?? 0,
    stock: p.stock ?? 0,
  }))

  await Product.deleteMany({})
  await Product.insertMany(products)
  console.log(`Seeded ${products.length} products`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
