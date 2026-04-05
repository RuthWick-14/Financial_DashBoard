const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0.01, "Amount must be greater than 0"],
        },
        type: {
            type: String,
            enum: ["income", "expense"], 
            required: true
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date, 
            default: Date.now,
        },
        notes: {
            type: String, 
            trim: true,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true
    }
)

// export const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction: mongoose.model("Transaction", transactionSchema) };