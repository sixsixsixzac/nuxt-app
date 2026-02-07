import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

async function loadCategoryMaps() {
  const categories = await Category.find().lean()
  const byObjectId = {}
  for (const c of categories) {
    const key = c._id.toString()
    byObjectId[key] = { name: c.name, id: c.id }
  }
  return byObjectId
}

async function resolveCategoryIdsToObjectIds(numericIds) {
  if (!numericIds.length) return []
  const categories = await Category.find({ id: { $in: numericIds } }).select('_id').lean()
  return categories.map((c) => c._id)
}

function parseCategoryIds(raw) {
  if (raw === undefined || raw === '') return []
  const values = Array.isArray(raw) ? raw : [raw]
  return values.map(Number).filter((n) => !Number.isNaN(n))
}

function parseSelectFields(select) {
  if (!select || typeof select !== 'string') return null
  const fields = select.split(',').map((s) => s.trim()).filter(Boolean)
  return fields.length > 0 ? fields.join(' ') : null
}

function toProductResponse(doc, categoryByObjectId, extra = {}) {
  const { _id, __v, ...rest } = doc
  const categoryIdKey = rest.categoryId != null ? (rest.categoryId.toString?.() ?? rest.categoryId) : null
  const categoryInfo = categoryIdKey ? categoryByObjectId[categoryIdKey] : null
  const categoryName = categoryInfo?.name ?? 'NONE'
  const categoryId = categoryInfo?.id ?? null

  return {
    ...rest,
    categoryId,
    category: categoryName,
    ...extra,
  }
}

export async function list(req, res) {
  try {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT))
    const skip = Math.max(0, Number(req.query.skip) || 0)
    const categoryIds = parseCategoryIds(req.query.categoryId)
    const categoryObjectIds = await resolveCategoryIdsToObjectIds(categoryIds)
    const selectFields = parseSelectFields(req.query.select)
    const searchQ = typeof req.query.q === 'string' ? req.query.q.trim() : ''

    const filter = {}
    if (categoryObjectIds.length > 0) filter.categoryId = { $in: categoryObjectIds }
    if (searchQ) {
      const re = new RegExp(searchQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [
        { title: re },
        { brand: re },
      ]
    }
    const total = await Product.countDocuments(filter)

    const query = Product.find(filter).sort({ id: 1 }).skip(skip).limit(limit).lean()
    if (selectFields) query.select(selectFields)

    const products = await query
    const categoryByObjectId = await loadCategoryMaps()

    res.json({
      products: products.map((p) => toProductResponse(p, categoryByObjectId)),
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
    const body = req.body || {}
    const categoryIdNum = Number(body.categoryId)
    if (!body.title || Number.isNaN(categoryIdNum) || Number.isNaN(Number(body.price))) {
      return res.status(400).json({ error: 'Missing or invalid title, categoryId, or price' })
    }
    const category = await Category.findOne({ id: categoryIdNum }).select('_id').lean()
    if (!category) {
      return res.status(400).json({ error: 'Invalid categoryId: category not found' })
    }
    const maxDoc = await Product.findOne().sort({ id: -1 }).select('id').lean()
    const nextId = (maxDoc?.id ?? 0) + 1
    const doc = {
      id: nextId,
      title: body.title ?? '',
      thumbnail: body.thumbnail ?? '',
      brand: body.brand ?? '',
      categoryId: category._id,
      price: Number(body.price),
      discountPercentage: body.discountPercentage != null ? Number(body.discountPercentage) : undefined,
      stock: body.stock != null ? Number(body.stock) : 0,
    }
    const product = await Product.create(doc)
    const categoryByObjectId = await loadCategoryMaps()
    res.status(201).json(toProductResponse(product.toObject(), categoryByObjectId))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product id' })
    }
    const body = req.body || {}
    let categoryIdValue = undefined
    if (body.categoryId != null) {
      const categoryIdNum = Number(body.categoryId)
      if (Number.isNaN(categoryIdNum)) {
        return res.status(400).json({ error: 'Invalid categoryId' })
      }
      const category = await Category.findOne({ id: categoryIdNum }).select('_id').lean()
      if (!category) {
        return res.status(400).json({ error: 'Invalid categoryId: category not found' })
      }
      categoryIdValue = category._id
    }
    const product = await Product.findOneAndUpdate(
      { id },
      {
        title: body.title ?? undefined,
        thumbnail: body.thumbnail,
        brand: body.brand,
        categoryId: categoryIdValue,
        price: body.price != null ? Number(body.price) : undefined,
        discountPercentage: body.discountPercentage != null ? Number(body.discountPercentage) : undefined,
        stock: body.stock != null ? Number(body.stock) : undefined,
      },
      { new: true, runValidators: true },
    ).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    const categoryByObjectId = await loadCategoryMaps()
    res.json(toProductResponse(product, categoryByObjectId))
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

    const categoryByObjectId = await loadCategoryMaps()
    const doc = product.toObject()

    res.json(
      toProductResponse(doc, categoryByObjectId, {
        isDeleted: true,
        deletedOn: new Date().toISOString(),
      }),
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
