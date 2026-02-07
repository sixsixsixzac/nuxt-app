import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

export const Category = mongoose.model('Category', categorySchema)
