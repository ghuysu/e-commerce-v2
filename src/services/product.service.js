'use strict'

const { BadRequestError } = require("../core/error.response")
const {product, clothing, electronic} = require("../models/product.model")
const { queryProduct, publishProductByShop, unpublishProductByShop, searchProductByUser } = require("../models/repositories/product.repo")

//define factory class to create product
class ProductFactory{

    static productRegistry = {}

    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Type ${type}`)

        return new productClass(payload).createProduct()
    }

    static async publishProductByShop({product_shop, product_id}){
        return await publishProductByShop({product_shop, product_id})
    }

    static async unpublishProductByShop({product_shop, product_id}){
        return await unpublishProductByShop({product_shop, product_id})
    }

    static async findAllDraftsForShop({product_shop, limit=50, skip = 0}){
        const query = {product_shop, isDraft: true}
        return await queryProduct({query, limit, skip})
    }

    static async findAllPublishForShop({product_shop, limit=50, skip = 0}){
        const query = {product_shop, isPublished: true}
        return await queryProduct({query, limit, skip})
    }

    static async searchProducts ({keySearch}){
        return await searchProductByUser({keySearch})
    }
}

class Product{

    constructor({
        product_name, product_thumb, product_description, product_price,
        product_quantity, product_type, product_shop, product_attributes
    }){
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    async createProduct(product_id){
        return await product.create({
            ...this,
            _id: product_id
        })
    }
}

//define sub-class for difference product types Clothing
class Clothing extends Product{

    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newClothing) throw BadRequestError("Create Clothing Failed")

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw BadRequestError("Create Product Error")

        return newProduct
    }
}

//define sub-class for difference product types Clothing
class Electronic extends Product{

    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw BadRequestError("Create Electronic Failed")

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw BadRequestError("Create Product Error")

        return newProduct
    }
} 

ProductFactory.registerProductType("Electronic", Electronic)
ProductFactory.registerProductType("Clothing", Clothing)

module.exports = ProductFactory