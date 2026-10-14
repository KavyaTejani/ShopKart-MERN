const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {

    try {

        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        const customer = await Customer.findById(req.user._id);

        if(!customer){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const alreadyWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if(alreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            })
        }

        customer.wishlist.push(product._id);

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
};

const getWishlist = async (req, res) => {
    try{

        const customer = await Customer.findById(req.user._id)
            .populate({
                path: "wishlist",
                select: "name price category image stock"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            })
        }

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });
    
    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

const removeFromWishlist = async (req, res) => {
    try{

        const {productId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const wishlistIndex = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (wishlistIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            })
        }

        customer.wishlist.splice(wishlistIndex, 1);

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            count: customer.wishlist.length
        })
    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}
const toggleWishlist = async (req, res) => {
    try {

        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const wishlistIndex = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (wishlistIndex !== -1) {

            customer.wishlist.splice(wishlistIndex, 1);

            await customer.save();

            return res.status(200).json({
                success: true,
                message: "Product removed from wishlist",
                saved: false,
                count: customer.wishlist.length
            });
        }

        customer.wishlist.push(product._id);

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            saved: true,
            count: customer.wishlist.length
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist,
}