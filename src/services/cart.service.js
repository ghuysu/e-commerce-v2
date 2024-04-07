'use strict';

const mongoose = require('mongoose');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { cart } = require('../models/cart.model');
const {inventory} = require('../models/inventory.model')
const {getInventoryByProductId} = require('../models/repositories/inventory.repo')
const { getProductById } = require('../models/repositories/product.repo');
const { findProductInCartByProductId } = require('../models/repositories/cart.repo');

class CartService {
    static async createUserCart(userId, product) {
        const query = { cart_userId: userId, cart_state: 'active' };
        
        const updateOrInsert = {
            $addToSet: {
                cart_products: product
            },
            $inc: {
                cart_count_product: +product.quantity
            }
        };
        
        const options = { upsert: true, new: true };
        
        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({ userId, product }) {
        
        const foundInventory = await getInventoryByProductId({productId: product.productId})
        if(!foundInventory) throw new BadRequestError("No Inventory Found")

        if(foundInventory.inven_stock < product.quantity) throw new BadRequestError("Over Product Stock")
        
        const query = {
            cart_userId: userId,
            'cart_products.productId': product.productId,
            cart_state: 'active'
        };
        
        const updateSet = {
            $set: {
                'cart_products.$.quantity': +product.quantity
            }
        };
        
        const options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateSet, options);
    }

    static async addToCart({ userId, product}) {
        const userCart = await cart.findOne({ cart_userId: userId });
        
        if (!userCart) {
            return await CartService.createUserCart(userId, product);
        }

        const foundProduct = await getProductById(product.productId);
        if (!foundProduct) throw new NotFoundError('Not Found Product');

        const existedProdIndex = userCart.cart_products.findIndex(prod => prod.productId === product.productId);
        
        if (existedProdIndex === -1) {
            userCart.cart_products.push(product);
            userCart.cart_count_product += 1
        } else {
            userCart.cart_products[existedProdIndex].quantity += +product.quantity;
        }

        return userCart.save();
    }

    static async addToCartV2({ userId, product = {} }) {
        const { productId, quantity} = product;

        const foundProduct = await getProductById(product.productId);
        if (!foundProduct) throw new NotFoundError('Not Found Product');

        const productInCart = await findProductInCartByProductId(userId, product.productId)
        if(!productInCart) throw new NotFoundError('Not Found Product In Cart')
        // Cần cung cấp biến `shop_order_ids` từ đâu?
        // if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
        //     throw new NotFoundError(`Product doesn't belong to the shop`);
        // }

        if (quantity === 0) {
            return await CartService.deleteUserCart(userId, productId);
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity
            }
        });
    }

    static async deleteUserCart(userId, productId) {
        const query = { cart_userId: userId, cart_state: 'active' };
        const updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            },
            $inc: {
                cart_count_product: -1
            }
        };
        return await cart.updateOne(query, updateSet);
    }

    static async getListUserCart({userId}) {
        return await cart.findOne({ cart_userId: userId }).lean();
    }
}

module.exports = CartService;
