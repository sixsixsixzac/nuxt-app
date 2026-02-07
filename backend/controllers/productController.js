import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'

async function getCategoryByIdMap() {
  const categories = await Category.find().lean()
  return Object.fromEntries(categories.map((c) => [c.id, c.name]))
}

export async function list(req, res) {
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
    const categoryById = await getCategoryByIdMap()

    res.json({
      products: products.map((p) => {
        const { _id, __v, ...rest } = p
        return {
          ...rest,
          category: categoryById[rest.categoryId] ?? '',
        }
      }),
      total,
      skip,
      limit,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function remove(req, res) {
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
    const categoryById = await getCategoryByIdMap()

    res.json({
      ...rest,
      category: categoryById[rest.categoryId] ?? '',
      isDeleted: true,
      deletedOn: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
