import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    brand: { type: String, default: '' },
    categoryId: { type: Number, default: null },
    price: { type: Number, required: true },
    discountPercentage: { type: Number },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Product = mongoose.model('Product', productSchema)
