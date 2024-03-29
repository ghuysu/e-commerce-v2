'use strict'

const DiscountService = require("../services/discount.service")
const {OK, CREATED} = require("../core/succes.response")

class DiscountController{
    createDiscountCode = async (req, res, next) => {
        new CREATED({
            message: 'Successful Code Created',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId            
            })
        }).send(res)
    }

    getAllDiscountCodesByShop = async (req, res, next) => {
        new OK({
            message: 'Get Codes Successfully',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next) => {
        new OK({
            message: 'Get Code Amount Successfully',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
                userId: req.user.userId            
            })
        }).send(res)
    }

    getAllProductsByDiscountCode = async (req, res, next) => {
        console.log(req.user)
        new OK({
            message: 'Get Products By Code Successfully',
            metadata: await DiscountService.getAllProductsByDiscountCode({
                ...req.query         
            })
        }).send(res)
    }
}

module.exports = new DiscountController()