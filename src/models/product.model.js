'use strict'

const {Schema, model} = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'


//sửa dụng polymorphic pattern
var productSchema = new Schema({
    product_name:{
        type:String,
        required:true
    },
    product_thumb:{
        type: String,
        required: true
    },
    product_description: String,
    product_slug: String,
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronic', 'Clothing']
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true
    },
    product_ratingAverage : {
        type:Number,
        min: [1, 'Rating must be abouve 1.0'],
        max: [5, 'Rating must be about 5.0'],
        set: (val) => Math.round(val * 10) /10
    },
    product_variation: {
        type: Array,
        default: []
    },
    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: false
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        select: false
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

productSchema.index({product_name: 'text', product_description: 'text'})

productSchema.pre('save', function(next) {
    this.product_slug = slugify(this.product_name, {lower: true})
    next()
})

const clothingSchema = new Schema({
    brand: {
        type: String,
        required: true
    },
    size: String,
    material: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    }
}, {
    collection: "Clothes",
    timestamps: true
})


const electronicSchema = new Schema({
    manufacturer: {
        type: String,
        required: true
    },
    model: String,
    color: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    }
}, {
    collection: 'Electronics',
    timestamps: true
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model("Electronic", electronicSchema),
    clothing: model("Clothing", clothingSchema) 
};