import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: [true, '商品必填'],
    },
    quantity: {
      type: Number,
      required: [true, '數量必填'],
      min: [1, '數量至少1個'],
      max: [100, '數量最多100個'],
    },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    account: {
      type: String,
      required: [true, '帳號必填'],
      unique: true,
      minlength: [4, '帳號至少4個字元'],
      maxlength: [20, '帳號最多20個字元'],
      trim: true,
      validate: {
        validator(value) {
          return validator.isAlphanumeric(value)
        },
      },
    },
    email: {
      type: String,
      required: [true, '電子郵件必填'],
      unique: true,
      trim: true,
      validate: {
        validator(value) {
          return validator.isEmail(value)
        },
        message: '請輸入有效的電子郵件地址',
      },
    },
    cart: {
      type: [cartSchema],
    },
    tokens: {
      type: [String],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, '密碼必填'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

// 在保存前對密碼進行處理
// 盡量用 function 不要用箭頭
// 使用 next 來讓 mongoose 繼續處理
userSchema.pre('save', function (next) {
  // this = 現在要保存的資料
  const user = this
  // 如果密碼欄位有修改，進行加密
  if (user.isModified('password')) {
    // 驗證密碼明文格式
    if (user.password.length < 4 || user.password.length > 20) {
      // 如果密碼長度不符合規定，拋出 mongoose 的驗證錯誤
      // 用跟 mongoose 的 schema 驗證錯誤一樣的錯誤格式
      // 可以跟其他驗證錯誤一起處理
      const error = new Error.ValidationError()
      // 設定密碼欄位錯誤
      error.addError(
        'password',
        new Error.ValidationError({ message: '密碼長度必須在4到20個字元之間' }),
      )
      // 繼續處理，把錯誤傳出去
      // mongoose 遇到錯誤就不會存入資料庫
      next(error)
      return
    } else {
      // 使用 bcrypt 加密
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  // 限制有效 token 數量（修正：tokens 是簡單字串陣列）
  if (user.isModified('tokens') && user.tokens && user.tokens.length > 3) {
    // 保留最新的 3 個 token（移除最舊的）
    user.tokens = user.tokens.slice(-3)
  }
  // 繼續處理
  next()
})

// 虛擬的動態欄位
// 資料庫中不會儲存 cartTotal 欄位
// 自動計算購物車總數量
// 當 cart 內容改變時，cartTotal 會自動反映最新狀態
userSchema.virtual('cartTotal').get(function () {
  // this = 現在的資料
  const user = this
  return user.cart.reduce((total, item) => {
    return total + item.quantity
  }, 0)
})

export default mongoose.model('users', userSchema)
