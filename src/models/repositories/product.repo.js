'use strict'

const { default: mongoose } = require("mongoose")
const { getSelectData, unGetSelectData } = require("../../utils")
const {product, electronic, clothing} = require("../product.model")
const {ObjectId} = require("mongoose").Types

const queryProduct = async({query, limit, skip}) => {
    return await product.find(query)
        .populate('product_shop', 'name email _id')
        .sort({updatedAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const publishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new ObjectId(product_shop),
        _id: Object(product_id)
    })

    if(!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublished = true

    await foundShop.updateOne(foundShop)

    return foundShop
}

const unpublishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new ObjectId(product_shop),
        _id: Object(product_id)
    })

    if(!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPublished = false

    await foundShop.updateOne(foundShop)

    return foundShop
}

const searchProductByUser = async({keySearch}) =>{
    const regexSearch = new RegExp(keySearch)
    const result = await product.find(
        { isPublished: true, $text: { $search: regexSearch } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).lean()

    return result
}

const findAllProducts = async ({limit, sort, page, filter, select}) =>{
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const products = await product.find(filter)
                    .sort(sortBy)
                    .skip(skip)
                    .limit(limit)
                    .select(getSelectData(select))
                    .lean()
    return products
}

const findProduct = async ({product_id, unSelect}) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect))
}

const getProductById = async (productId) => {
    return await product.findOne({_id: new mongoose.Types.ObjectId(productId)}).lean()
}

const updateProductById = async ({
    product_id,
    payload,
    model,
    isNew = true
}) => {
    return await model.findByIdAndUpdate(product_id, payload, {
        new: isNew
    })
}

const checkProductByServer = async (products) =>{
    return await Promise.all(products.map(async product => {
        const foundProduct = await getProductById(product.productId)
        if(foundProduct){
            return {
                product_price: foundProduct.product_price,
                product_quantity: product.quantity,
                productId: product.productId
            }
        }
    }))
}

module.exports = {
    queryProduct,
    publishProductByShop,
    unpublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer
}