'use strict'

const ProductService = require("../services/product.service")
const {CREATED, OK} = require("../core/succes.response")

class ProductController{
    createProduct = async (req, res, next) => {
        console.log(req.user)
        new CREATED({
            message: 'Create Product successfully',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new OK({
            message: "Publish Product Successfully",
            metadata: await ProductService.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }

    unpublishProductByShop = async (req, res, next) => {
        new OK({
            message: "Unpublish Product Successfully",
            metadata: await ProductService.unpublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }

    /**
     * @description Get all drafts for shop
     * @param {number} skip 
     * @param {number} limit 
     * @return {JSON} 
     */
    getAllDraftForShop = async (req, res, next) => {
        new OK({
            message: "Get List Draft Successfully",
            metadata: await ProductService.findAllDraftsForShop({product_shop: req.user.userId})
        }).send(res)
    }

    /**
     * @description Get all drafts for shop
     * @param {number} skip 
     * @param {number} limit 
     * @return {JSON} 
     */
    getAllPublishForShop = async (req, res, next) => {
        new OK({
            message: "Get List Publish Successfully",
            metadata: await ProductService.findAllPublishForShop({product_shop: req.user.userId})
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        new OK({
            message: "Get Search List Successfully",
            metadata: await ProductService.searchProducts(req.params)
        }).send(res)
    }
}

module.exports = new ProductController()