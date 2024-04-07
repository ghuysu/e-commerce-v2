'use strict'

const {model, Schema, default: mongoose} = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

const cartSchema = new Schema({
    cart_state: {
        type: String,
        required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {type: Array, required: true, default: []},
    /* 
        [{
            productId,
            shopId,
            quantity,
            price,
            name
        }]

        shop_order_ids: [
                {
                    shopId,
                    shop_discounts: [],
                    item_products: [
                        price,
                        quantity,
                        productId
                    ]
                },
                {
                    shopId,
                    shop_discounts: [],
                    item_products: [
                        price,
                        quantity,
                        productId
                    ]
                }
            ]
    */
   cart_count_product: {type: Number, default: 0},
   cart_userId: {type: mongoose.Types.ObjectId, ref: 'Shop'}
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}