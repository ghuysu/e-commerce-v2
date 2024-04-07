"use strict"

const {model, Schema, Types}= require('mongoose')

const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shops'

var shopSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        trim: true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    verify: {
        type: Schema.Types.Boolean,
        default: true
    },
    location: {
        type: {
          country: { type: String },
          state: { type: String },
          street: { type: String },
          detail_description: { type: String }
        },
        required: true,
        _id: false
      }
    /*
        {
            country
            state,
            street,
            detail_description
        }
    */
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, shopSchema)