'use strict'

const { find } = require("lodash")
const { BadRequestError } = require("../core/error.response")
const {product, clothing, electronic} = require("../models/product.model")
const { queryProduct, publishProductByShop, unpublishProductByShop, searchProductByUser, findAllProducts, findProduct, updateProductById} = require("../models/repositories/product.repo")
const { removeUndefinedObject, updateNestedObjectParser} = require("../utils")
const { insertInventory } = require("../models/repositories/inventory.repo")

//define factory class to create product
class ProductFactory{

    static productRegistry = {}

    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload, location, user){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Type ${type}`)

        return new productClass(payload).createProduct(location, user)
    }

    static async updateProduct(type, payload, product_id){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Type ${type}`)

        return new productClass(payload).updateProduct(product_id)
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

    static async findAllProducts({limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true}}, select){
        return await findAllProducts({limit, sort, page, filter, select: 
            ['product_name', 'product_price', 'product_thumb', 'product_shop']})
    }

    static async findProduct({product_id}){
        return await findProduct({product_id, unSelect: ["__v"]})
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

    async createProduct(product_id, location, user){
        const newProduct = await product.create({
            ...this,
            _id: product_id
        })

        if(newProduct){
            const shop_location = `${user.street}, ${user.state}, ${user.country}` 
            const product_inventory = await insertInventory({
                productId: product_id,
                shopId: this.product_shop,
                stock: this.product_quantity,
                location: location ? location : shop_location
            })

            return {
                newProduct,
                product_inventory
            }
        }
        throw new BadRequestError("Create Product Failed")
       
    }

    async updateProduct(product_id, payload){
        return await updateProductById({product_id, payload, model: product})
    }
}

//define sub-class for difference product types Clothing
class Clothing extends Product{

    async createProduct(location, user){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newClothing) throw BadRequestError("Create Clothing Failed")

        const newProduct = await super.createProduct(newClothing._id, location, user)
        if(!newProduct) throw BadRequestError("Create Product Error")

        return newProduct
    }


    async updateProduct(product_id){
        const objParams = this
        console.log(removeUndefinedObject(updateNestedObjectParser(objParams)))
        if(objParams.product_attributes){
            await updateProductById({
                product_id, 
                payload: removeUndefinedObject(updateNestedObjectParser(objParams.product_attributes)),
                model: clothing})
        }

        const updateProduct = await super.updateProduct(product_id, removeUndefinedObject(updateNestedObjectParser(objParams)))

        return updateProduct
    }
}

//define sub-class for difference product types Clothing
class Electronic extends Product{

    async createProduct(location, user){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw BadRequestError("Create Electronic Failed")

        const newProduct = await super.createProduct(newElectronic._id, location, user)
        if(!newProduct) throw BadRequestError("Create Product Error")

        return newProduct
    }

    async updateProduct(product_id){
        const objParams = this
        console.log(objParams)
        if(objParams.product_attributes){
            await updateProductById({
                product_id, 
                payload: removeUndefinedObject(updateNestedObjectParser(objParams.product_attributes)),
                model: electronic})
        }

        const updateProduct = await super.updateProduct(product_id, removeUndefinedObject(updateNestedObjectParser(objParams)))

        return updateProduct
    }
} 

ProductFactory.registerProductType("Electronic", Electronic)
ProductFactory.registerProductType("Clothing", Clothing)

module.exports = ProductFactory