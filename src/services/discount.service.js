"use strict"

const { Mongoose } = require("mongoose")
const {BadRequestError, NotFoundError} = require("../core/error.response")
const {discount} = require("../models/discount.model")
const mongoose = require('mongoose');
const {findAllProducts} = require("../models/repositories/product.repo");
const { findAllDiscountCodesUnSelect, checkDiscountExisted } = require("../models/repositories/discount.repo");

/* 
    1. generate discount code (shop-admin)
    2. get discount amount (user)
    3. get all discount codes
    4. verify discount code (user)
    5. delete discount code (shop-admin)
    6. cancel discount code (user)
*/

class DiscountService{

    static async createDiscountCode(payload){
        const {
            name, description, type, value, code, start_date,
            end_date, max_uses, users_count, max_users_per_user,
            min_order_value, shopId, isActive, applies_to, product_ids
        } = payload

        //check valid date
        if(new Date() > new Date(start_date) || new Date() > new Date(end_date) || new Date(end_date) < new Date(start_date)){
            throw new BadRequestError("Discount Code Has Expired")
        }

        //create index for discount code
        const foundDiscount = await checkDiscountExisted({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: new mongoose.Types.ObjectId(shopId)
            }
        })

        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError("Discount existed")
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_applies_to: applies_to,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_is_active: isActive,
            discount_max_uses: max_uses,
            discount_max_uses_per_user: max_users_per_user,
            discount_min_order_value: min_order_value || 0,
            discount_product_ids: applies_to === 'all' ? [] : product_ids,
            discount_users_count: users_count,
            discount_shopId: shopId
        })

        return newDiscount
    }

    static async updateDiscountCode(){

    }

    static async getAllProductsByDiscountCode({
        code, shopId, limit = 50, page
    }){
        const foundDiscount = await checkDiscountExisted({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: new mongoose.Types.ObjectId(shopId)
            }
        })

        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('Discount Not Exist')
        }

        const {discount_applies_to, discount_product_ids} = foundDiscount

        let products

        if(discount_applies_to === 'all'){
            products = await findAllProducts({
                filter: {
                    product_shop: new mongoose.Types.ObjectId(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if(discount_applies_to === 'specific'){
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
        })
        }

        return products
    }

    static async getAllDiscountCodesByShop({limit = 50, page, shopId}){
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: new mongoose.Types.ObjectId(shopId),
                discount_is_active: true
            },
            unSelect: ['_v', 'discount_shopId'],
            model: discount
        })

        return discounts
    }

    static async getDiscountAmount({code, userId, shopId, products}){
        const foundDiscount = await checkDiscountExisted({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: new mongoose.Types.ObjectId(shopId)
            }
        })

        if(!foundDiscount) throw new NotFoundError(`Discount doesn't exist`)

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_start_date,
            discount_end_date,
            discount_users_used,
            discount_value,
            discount_type
        } = foundDiscount

        if(!discount_is_active) throw new NotFoundError("Discount code isn't active")
        if(!discount_max_uses) throw new NotFoundError(`Discount are out`)

        if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)){
            throw new BadRequestError("Discount Code Has Expired")
        }

        let totalOrder = 0
        if(discount_min_order_value >= 0){
            console.log(discount_min_order_value)

            totalOrder = products.reduce((acc, product) => {
                return acc + (product.product_quantity * product.product_price)
            }, 0)

            if(totalOrder < discount_min_order_value)
                throw new NotFoundError(`Product didn't reach min order value`)
        }

        if(discount_max_uses_per_user){
            const userDiscount = discount_users_used.find(user => user.userId === userId)

            if(userDiscount){
                
                const usedCodeQuantity = discount_users_used.reduce((acc, user) => {
                    if(user.userId === userId)
                        return acc++
                }, 0)

                if(usedCodeQuantity === discount_max_uses_per_user)
                    throw new BadRequestError(`User reached maximun uses of code`)
            }
        }

        const amount = discount_type === 'fix_amount' ? discount_value : totalOrder * discount_value / 100

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode(shopId, code){
        
        const foundDiscount = await checkDiscountExisted({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: new mongoose.Types.ObjectId(shopId)
            }
        })

        if(!foundDiscount) throw new NotFoundError(`Discount doesn't exist`)
        
        const deleted = await discount.findOneAndDelete({
            discount_code: code,
            discount_shopId: new mongoose.Types.ObjectId(shopId)
        })

        return deteted
    }

    static async cancelDiscountCode({codeId, shopId, userId}){
        const foundDiscount = await checkDiscountExisted({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: new mongoose.Types.ObjectId(shopId)
            }
        })

        if(!foundDiscount) throw new NotFoundError(`Discount doesn't exist`)

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId
            },
            $inc: {
                discount_max_uses: 1,
                discount_users_count: -1
            }
        })

        return result
    }
}

module.exports = DiscountService