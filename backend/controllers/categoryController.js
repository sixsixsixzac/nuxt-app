import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'

export async function list(req, res) {
  try {
    const [categories, countByCategoryId] = await Promise.all([
      Category.find().sort({ id: 1 }).lean(),
      Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }]).then((rows) =>
        Object.fromEntries(rows.map((r) => [r._id, r.count])),
      ),
    ])

    const result = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        items: countByCategoryId[c.id] ?? 0,
      }))
      .sort((a, b) => b.items - a.items)

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
