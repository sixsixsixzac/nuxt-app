import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

import mongoose from 'mongoose'
import { Category } from '../models/Category.js'

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

async function seedCategories() {
  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB connected')

  const categories = CATEGORY_LIST.map((name, index) => ({
    id: index + 1,
    name,
  }))

  await Category.deleteMany({})
  await Category.insertMany(categories)
  console.log(`Seeded ${categories.length} categories`)

  await mongoose.disconnect()
  process.exit(0)
}

seedCategories().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
