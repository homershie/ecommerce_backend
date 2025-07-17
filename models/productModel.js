import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '商品名稱必填'],
      trim: true,
      minlength: [1, '商品名稱至少需要 1 個字元'],
      maxlength: [100, '商品名稱最多只能有 100 個字元'],
    },
    price: {
      type: Number,
      required: [true, '商品價格必填'],
      min: [0, '價格不能為負數'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '描述最多只能有 500 個字元'],
    },
    category: {
      type: String,
      required: [true, '商品分類必填'],
      enum: {
        values: ['書籍', '服飾', '家居', '美妝', '食品', '電子產品', '玩具', '家電', '其他'],
        message: '請選擇有效的商品分類',
      },
    },
    sell: {
      type: Boolean,
      default: true,
      required: [true, '是否上架必填'],
    },
    image: {
      type: String,
      required: [true, '商品圖片必填'],
    },
  },
  { versionKey: false, timestamps: true },
)

export default mongoose.model('products', schema)
