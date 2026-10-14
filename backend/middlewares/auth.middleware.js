const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model.js");

const protect = async (req, res, next) => {

         try{
        const token = req.cookies.token;

        // console.log("TOKEN:", token);

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // console.log("DECODED:", decoded);

        const customer = await Customer.findById(decoded.id);
        
        // console.log("CUSTOMER:", customer);

        if(!customer){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        req.user = customer;

        next();
    } catch(error){

        // console.log("AUTH ERROR:", error);

        res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
}

module.exports = protect;