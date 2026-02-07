import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

async function loadCategoryNameMap() {
  const categories = await Category.find().lean()
  return Object.fromEntries(categories.map((c) => [c.id, c.name]))
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

function toProductResponse(doc, categoryNameByCategoryId, extra = {}) {
  const { _id, __v, ...rest } = doc
  const categoryId = rest.categoryId
  const categoryName = categoryNameByCategoryId[categoryId] ?? 'NONE'

  return {
    ...rest,
    category: categoryName,
    ...extra,
  }
}

export async function list(req, res) {
  try {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT))
    const skip = Math.max(0, Number(req.query.skip) || 0)
    const categoryIds = parseCategoryIds(req.query.categoryId)
    const selectFields = parseSelectFields(req.query.select)

    const filter = categoryIds.length > 0 ? { categoryId: { $in: categoryIds } } : {}
    const total = await Product.countDocuments(filter)

    const query = Product.find(filter).sort({ id: 1 }).skip(skip).limit(limit).lean()
    if (selectFields) query.select(selectFields)

    const products = await query
    const categoryNameByCategoryId = await loadCategoryNameMap()

    res.json({
      products: products.map((p) => toProductResponse(p, categoryNameByCategoryId)),
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
    const maxDoc = await Product.findOne().sort({ id: -1 }).select('id').lean()
    const nextId = (maxDoc?.id ?? 0) + 1
    const doc = {
      id: nextId,
      title: body.title ?? '',
      thumbnail: body.thumbnail ?? '',
      brand: body.brand ?? '',
      categoryId: Number(body.categoryId),
      price: Number(body.price),
      discountPercentage: body.discountPercentage != null ? Number(body.discountPercentage) : undefined,
      stock: body.stock != null ? Number(body.stock) : 0,
    }
    if (!doc.title || Number.isNaN(doc.categoryId) || Number.isNaN(doc.price)) {
      return res.status(400).json({ error: 'Missing or invalid title, categoryId, or price' })
    }
    const product = await Product.create(doc)
    const categoryNameByCategoryId = await loadCategoryNameMap()
    res.status(201).json(toProductResponse(product.toObject(), categoryNameByCategoryId))
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
    const product = await Product.findOneAndUpdate(
      { id },
      {
        title: body.title ?? undefined,
        thumbnail: body.thumbnail,
        brand: body.brand,
        categoryId: body.categoryId != null ? Number(body.categoryId) : undefined,
        price: body.price != null ? Number(body.price) : undefined,
        discountPercentage: body.discountPercentage != null ? Number(body.discountPercentage) : undefined,
        stock: body.stock != null ? Number(body.stock) : undefined,
      },
      { new: true, runValidators: true },
    ).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    const categoryNameByCategoryId = await loadCategoryNameMap()
    res.json(toProductResponse(product, categoryNameByCategoryId))
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

    const categoryNameByCategoryId = await loadCategoryNameMap()
    const doc = product.toObject()

    res.json(
      toProductResponse(doc, categoryNameByCategoryId, {
        isDeleted: true,
        deletedOn: new Date().toISOString(),
      }),
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
