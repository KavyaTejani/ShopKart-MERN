
const express = require("express");

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
} = require("../controllers/wishlist.controller.js");

const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post(
    "/:productId",
    authMiddleware,
    addToWishlist
);

router.get(
    "/",
    authMiddleware,
    getWishlist
);

router.delete(
    "/:productId",
    authMiddleware,
    removeFromWishlist
);

router.patch(
    "/:productId/toggle",
    authMiddleware,
    toggleWishlist
);

module.exports = router;
