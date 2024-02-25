'use strict'

const {Schema, model} = require('mongoose');

const DOCUMENT_NAME = 'Apikey'
const COLLECTION_NAME = 'Apikeys'

var apiKeySchema = new Schema({
    key:{
        type:String,
        required:true,
        unique:true,
    },
    status:{
        type:Boolean,
        default: true
    },
    permissions:{
        type: [String],
        required:true,
        enum: ['0000', '1111', '2222']
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = model(DOCUMENT_NAME, apiKeySchema);