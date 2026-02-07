import { Category } from '../models/Category.js'

export async function list(req, res) {
  try {
    const categories = await Category.find().sort({ id: 1 }).lean()
    res.json(
      categories.map((c) => {
        const { _id, __v, ...rest } = c
        return rest
      }),
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
