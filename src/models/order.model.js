'use strict'

const {model, Schema} = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema({
    order_userId: {type: Number, require: true},
    order_checkout: {type: Object, default: {}},
    /*
        order_checkout{
            totalPrice,
            totalAppliedDiscount
            feeship
        }
    */
    order_shipping: {type: Object, default: {}},
    /*
    order_shipping{
        street,
        city,
        state,
        country
    }
    */
    order_payment: {type: Object, default: {}},
    order_products: {type: Array, required: true},
    order_trackingNumber: {type: Object, defalut: {}},
    order_status: {
        type: String,
        enum: ['processing', 'confirmed', 'delivering', 'cancelled', 'arrived'],
        default: 'processing'
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

module.exports = {
    order: model(DOCUMENT_NAME, orderSchema)
}