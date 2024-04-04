'use strict'

const cart = require("../models/cart.model")
const {BadRequestError, NotFoundError} = require("../core/error.response")
const { findCartByID } = require("../models/repositories/cart.repo")
const { checkProductByServer } = require("../models/repositories/product.repo")
const {getDiscountAmount} = require("./discount.service")
const { acquireLock, releaseLock } = require("./redis.service")
const { order } = require("../models/order.model")
class CheckoutService{
    /* 
        {
            cartId,
            userId,
            shop_order_ids: [
                {
                    shopId,
                    shop_discounts: [],
                    item_products: [
                        price,
                        quantity,
                        productId
                    ]
                },
                {
                    shopId,
                    shop_discounts: [],
                    item_products: [
                        price,
                        quantity,
                        productId
                    ]
                }
            ]
        } 
    */

    static async checkoutReview({cartId, userId, shop_order_ids = []}){
        const foundCart = await findCartByID(cartId)
        if(!foundCart) throw new BadRequestError(`Cart Doesn't Exist`)

        const checkout_order = {
            totalPrice: 0,
            feeShip: 30000,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_ids_new = []

        for(let i = 0; i < shop_order_ids.length; i++){
            const {shopId, shop_discounts = [], item_products = []} = shop_order_ids[i]

            const checkProduct = await checkProductByServer(item_products)

            if(!checkProduct[0]) throw new BadRequestError('Order Wrong')

            const checkoutPrice = checkProduct.reduce((acc, product) => {
                return acc + (product.product_quantity * product.product_price)
            }, 0)

            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceAppliedDiscount: checkoutPrice,
                item_products: checkProduct
            }

            if(shop_discounts.length > 0){
                for(let j = 0; j < shop_discounts.length; j++){
                    const {discount = 0} = await getDiscountAmount({
                        code: shop_discounts[j].code,
                        userId,
                        shopId,
                        products: checkProduct
                    })
    
                    checkout_order.totalDiscount += discount
                    itemCheckout.priceAppliedDiscount = checkoutPrice - discount
                }
            }

            checkout_order.totalCheckout += itemCheckout.priceAppliedDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    static async orderByUser({shop_order_ids, cartId, userId, user_address={}, user_payment={}}){
        const {shop_order_ids_new, checkout_order } = await this.checkoutReview({cartId, userId, shop_order_ids})

        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log("[1]::", products)

        const acquireProduct = []
        for(let i = 0; i < products.length; i++){
            const  {productId, product_quantity} = products[i]
            const keyLock = await acquireLock(productId, product_quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if(keyLock){
                await realease(keyLock)
            }
        }

        if(acquireProduct.includes(false)){
            throw new BadRequestError('Some products have been sold out, Please re-check your cart')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        if(newOrder){

        }

        return newOrder
    }
}

module.exports = CheckoutService