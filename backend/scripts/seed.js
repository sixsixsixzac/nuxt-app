import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

import mongoose from 'mongoose'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt-app'

const CATEGORY_LIST = [
  'beauty',
  'fragrances',
  'furniture',
  'groceries',
  'home-decoration',
  'kitchen-accessories',
  'laptops',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'mobile-accessories',
  'motorcycle',
  'skin-care',
  'smartphones',
  'sports-accessories',
  'sunglasses',
  'tablets',
  'tops',
  'vehicle',
  'womens-bags',
  'womens-dresses',
  'womens-jewellery',
  'womens-shoes',
  'womens-watches',
]

function slugify(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .trim()
}

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB connected')

  await Category.deleteMany({})
  const categoriesToInsert = CATEGORY_LIST.map((name, index) => ({
    id: index + 1,
    name,
  }))
  await Category.insertMany(categoriesToInsert)
  console.log(`Seeded ${categoriesToInsert.length} categories`)

  const categories = await Category.find().sort({ id: 1 }).lean()

  const nameToObjectId = Object.fromEntries(categories.map((c) => [c.name, c._id]))
  const fallbackId = nameToObjectId['tops'] ?? categories[0]?._id

  const res = await fetch('https://dummyjson.com/products?limit=100')
  const data = await res.json()

  const products = data.products.map((p) => {
    const slug = slugify(p.category ?? '')
    const categoryId = nameToObjectId[slug] ?? fallbackId
    return {
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail ?? '',
      brand: p.brand ?? '',
      categoryId,
      price: p.price,
      discountPercentage: p.discountPercentage,
      stock: p.stock ?? 0,
    }
  })

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
