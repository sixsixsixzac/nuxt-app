import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export async function list(req, res) {
  try {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT))
    const skip = Math.max(0, Number(req.query.skip) || 0)

    const [categories, countByCategoryId] = await Promise.all([
      Category.find().sort({ id: 1 }).lean(),
      Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }]).then((rows) =>
        Object.fromEntries(rows.map((r) => [r._id, r.count])),
      ),
    ])

    const combined = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        items: countByCategoryId[c.id] ?? 0,
      }))
      .sort((a, b) => b.items - a.items)

    const total = combined.length
    const result = combined.slice(skip, skip + limit)

    res.json({
      categories: result,
      total,
      skip,
      limit,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const existing = await Category.findOne({ $or: [{ name: slug }, { name }] }).lean()
    if (existing) {
      return res.status(400).json({ error: 'Category name already exists' })
    }
    const maxDoc = await Category.findOne().sort({ id: -1 }).select('id').lean()
    const nextId = (maxDoc?.id ?? 0) + 1
    const doc = await Category.create({ id: nextId, name: slug })
    const countByCategoryId = await Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }]).then((rows) =>
      Object.fromEntries(rows.map((r) => [r._id, r.count])),
    )
    res.status(201).json({
      id: doc.id,
      name: doc.name,
      items: countByCategoryId[doc.id] ?? 0,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category id' })
    }
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const existing = await Category.findOne({ $or: [{ name: slug }, { name }], id: { $ne: id } }).lean()
    if (existing) {
      return res.status(400).json({ error: 'Category name already exists' })
    }
    const category = await Category.findOneAndUpdate({ id }, { name: slug }, { new: true }).lean()
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    const countByCategoryId = await Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }]).then((rows) =>
      Object.fromEntries(rows.map((r) => [r._id, r.count])),
    )
    res.json({
      id: category.id,
      name: category.name,
      items: countByCategoryId[category.id] ?? 0,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function remove(req, res) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category id' })
    }
    const productCount = await Product.countDocuments({ categoryId: id })
    if (productCount > 0) {
      return res.status(400).json({ error: `Cannot delete category: ${productCount} product(s) use it` })
    }
    const category = await Category.findOneAndDelete({ id }).lean()
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json({ id: category.id, name: category.name, deleted: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
