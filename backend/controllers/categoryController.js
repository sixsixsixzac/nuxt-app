import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

function toIdKey(id) {
  if (id == null) return null
  if (typeof id === 'object' && typeof id.toString === 'function') return id.toString()
  return String(id)
}

function buildCountByCategoryObjectId(rows, categories) {
  const countByObjectId = {}
  for (const c of categories) {
    countByObjectId[toIdKey(c._id)] = 0
  }
  for (const r of rows) {
    if (r._id == null) continue
    let key
    if (typeof r._id === 'number') {
      const cat = categories.find((c) => c.id === r._id)
      key = cat ? toIdKey(cat._id) : null
    } else {
      key = toIdKey(r._id)
    }
    if (key != null) {
      countByObjectId[key] = (countByObjectId[key] ?? 0) + r.count
    }
  }
  return countByObjectId
}

export async function list(req, res) {
  try {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT))
    const skip = Math.max(0, Number(req.query.skip) || 0)

    const [categories, aggregateRows] = await Promise.all([
      Category.find().sort({ id: 1 }).lean(),
      Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }]),
    ])
    const countByCategoryId = buildCountByCategoryObjectId(aggregateRows, categories)

    const combined = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        items: countByCategoryId[toIdKey(c._id)] ?? 0,
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
    const aggregateRows = await Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }])
    const countByCategoryId = buildCountByCategoryObjectId(aggregateRows, [doc])
    res.status(201).json({
      id: doc.id,
      name: doc.name,
      items: countByCategoryId[toIdKey(doc._id)] ?? 0,
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
    const aggregateRows = await Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }])
    const countByCategoryId = buildCountByCategoryObjectId(aggregateRows, [category])
    res.json({
      id: category.id,
      name: category.name,
      items: countByCategoryId[toIdKey(category._id)] ?? 0,
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
    const transferToId = req.query.transferToCategoryId != null
      ? Number(req.query.transferToCategoryId)
      : null

    const category = await Category.findOne({ id }).lean()
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    if (transferToId != null && !Number.isNaN(transferToId)) {
      if (transferToId === id) {
        return res.status(400).json({ error: 'Cannot transfer to the same category' })
      }
      const target = await Category.findOne({ id: transferToId }).lean()
      if (!target) {
        return res.status(400).json({ error: 'Transfer target category not found' })
      }
      await Product.updateMany({ categoryId: category._id }, { $set: { categoryId: target._id } })
    } else {
      await Product.updateMany({ categoryId: category._id }, { $set: { categoryId: null } })
    }

    await Category.findOneAndDelete({ id })
    res.json({ id: category.id, name: category.name, deleted: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
