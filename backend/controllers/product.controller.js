const { countDocuments } = require("../models/customer.model.js");
const mongoose = require("mongoose");
const Product = require("../models/product.model.js");

const createProduct = async (req, res) => {

    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body;


        if (!name || !description || !category || !image || price === undefined || price === null || stock === undefined || stock === null) {
            return res.status(400).json({
                success: false,
                message: "All product fiels are required"

            });
        }

        if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0"
            });
        }

        if (typeof stock !== "number" || stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Stock can not be negative"
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }

};

const getAllProducts = async (req, res) => {

    try {

        const { search, category } = req.query;

        const query = {};

        if (search) {
            query.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query)
            .select("name price category image stock");

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getProductById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
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
    createProduct,
    getAllProducts,
    getProductById
};