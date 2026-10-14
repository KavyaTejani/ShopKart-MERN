const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const customerRoutes = require("./routes/customer.routes.js");
const { applyTimestamps } = require("./models/customer.model.js");
const productRoutes = require("./routes/product.routes.js");
const wishlistRoutes = require("./routes/wishlist.routes.js");
const cartRoutes = require("./routes/cart.routes.js");
const orderRoutes = require("./routes/order.routes.js");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.DB_URL).then(() => {
    console.log("DB Connected");
}).catch((err) => {
    console.log(err);
})

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.listen(process.env.PORT || 4001, () => {
    console.log(`Server Started Successfully at ${process.env.PORT || 4001}`);
})

