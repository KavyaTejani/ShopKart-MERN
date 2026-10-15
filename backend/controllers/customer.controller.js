const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model.js")
const generateToken = require("../utils/generateToken.js");

const registerCustomer = async (req, res) => {

    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be atleast 6 Charcaters"
            });
        }   

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: "Email already exists!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        })

        return res.status(201).json({
            success: true,
            message: "Customer Registered Successfully",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        })
    } catch (error) {
        console.log(error)

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }

}

const loginCustomer = async (req, res) => {
    
    try{
        const { email, password} = req.body;

        const customer = await Customer.findOne({ email });
        if(!customer){
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials!"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, customer.password);

        // why is await used here? 

        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials!"
            })
        }

        const token = generateToken(customer._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error){
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    };
};

const getProfile = async(req, res) => {
    return res.status(200).json({
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone
    })
}

const logoutCustomer = async (req, res) => {
    
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({
        success: true,
        message: "Logged Out Successfully"
    });
};

const changePassword = async (req, res) => {
    
    try{

        const { oldPassword, newPassword} = req.body;

        if (!oldPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: "Old Password and New Password are required"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, req.user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: "Invalid old Password!"
            });
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        req.user.password = hashedPassword;

        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    };
};

module.exports = {
    registerCustomer, 
    loginCustomer,
    getProfile,
    logoutCustomer,
    changePassword
};


