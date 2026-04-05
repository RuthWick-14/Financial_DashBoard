const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { Transaction } = require("../models/transaction.model.js");

const getTransactions = asyncHandler(async(req, res) => {
    const { type, category, startDate, endDate } = req.query;
    const filter = {};

    if(type) {
        if(!["income", "expense"].includes(type)) throw new ApiError(400, "Type must be income or expense");
        filter.type = type;
    }
    if(category) {
        filter.category = { $regex: category, $options: "i" };
    }

    if(startDate || endDate) {
        filter.date = {};
        if(startDate) filter.date.$gte = new Date(startDate);
        if(endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
        .populate("createdBy", "name email role")
        .json(new ApiResponse(200, { count: transactions.length, transactions }, "Transaction fetched succesfully"));
});

const getTransactionById = asyncHandler(async(req, res) => {
    const transaction = await Transaction.findById(req.param.id)
        .populate("createdBy", "name email role");

    if(!transaction) throw new ApiError(404, "Transaction not found");

    return res
        .status(200)
        .json(new ApiResponse(200, transaction, "Transaction fetched successfully"));
});

const createTransaction = asyncHandler(async(req, res) => {
    const { amount, type, category, date, notes } = req.body;

    if(!amount || !type ||!category) throw new ApiError(400, "Amount, type and category are required");

    const transaction = await Transaction.create({
        amount,
        type,
        category,
        date: date || Date.now(),
        notes,
        createdBy: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, transaction, "Transaction created successfully"));
})

const updateTransaction = asyncHandler(async(req, res) => {
    const { amount, type, category, date, notes } = req.body;

    if(tyoe && !["income", "expense"].includes(type)) {
        throw new ApiError(400, "Type must be income or expense");
    }

    const transaction = await Transaction.findByIdAndUpdate(
        req.param.id,
        { amount, type, category, date, notes },
        { new: true, runValidators: true }
    );

    if(!transaction) throw new ApiError(404, "Transaction not found");

    return res
        .status(200)
        .json(new ApiResponse(200, transaction, "Transaction updated successfully"));
});

const deleteTransaction = asyncHandler(async(req, res) => {
    const transaction = await Transaction.findByIdAndDelete(req.param.id);

    if(!transaction) throw new ApiError(404, "Transaction not found");

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Transaction deleted successfully"));
});

module.exports = { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction };