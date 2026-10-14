const express = require("express");

const {addToCart, getCart, updateCartQuantity, removeFromCart} = require("../controllers/cart.controller.js");

const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post(
    "/:productId",
    authMiddleware,
    addToCart
);

router.get(
    "/",
    authMiddleware,
    getCart
)

router.patch(
    "/:productId",
    authMiddleware,
    updateCartQuantity
)

router.delete(
    "/:productId",
    authMiddleware,
    removeFromCart
)

module.exports = router;