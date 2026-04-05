const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { Transaction } = require("../models/transaction.model");

const getSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = Object.keys(dateFilter).length ? { date: dateFilter } : {};

    const totals = await Transaction.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    totals.forEach((item) => {
        if (item._id === "income") {
            totalIncome = item.total;
            incomeCount = item.count;
        } else {
            totalExpense = item.total;
            expenseCount = item.count;
        }
    });

    const categoryTotals = await Transaction.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { type: "$type", category: "$category" },
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        { $sort: { total: -1 } },
    ]);

    const recentActivity = await Transaction.find(matchStage)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                summary: {
                    totalIncome,
                    totalExpense,
                    netBalance: totalIncome - totalExpense,
                    incomeCount,
                    expenseCount,
                    totalTransactions: incomeCount + expenseCount,
                },
                categoryTotals: categoryTotals.map((c) => ({
                    type: c._id.type,
                    category: c._id.category,
                    total: c.total,
                    count: c.count,
                })),
                recentActivity,
            },
            "Dashboard summary fetched successfully"
        )
    );
});

const getTrends = asyncHandler(async (req, res) => {
    const { period } = req.query;

    if (period && !["monthly", "weekly"].includes(period)) {
        throw new ApiError(400, "Period must be monthly or weekly");
    }

    const groupBy =
        period === "weekly"
            ? { year: { $year: "$date" }, week: { $week: "$date" } }
            : { year: { $year: "$date" }, month: { $month: "$date" } };

    const trends = await Transaction.aggregate([
        {
            $group: {
                _id: { period: groupBy, type: "$type" },
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.period.year": 1, "_id.period.month": 1 } },
    ]);

    const trendMap = {};
    trends.forEach((item) => {
        const key =
            period === "weekly"
                ? `${item._id.period.year}-W${item._id.period.week}`
                : `${item._id.period.year}-${String(item._id.period.month).padStart(2, "0")}`;

        if (!trendMap[key]) {
            trendMap[key] = { period: key, income: 0, expense: 0 };
        }
        trendMap[key][item._id.type] = item.total;
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                period: period || "monthly",
                trends: Object.values(trendMap),
            },
            "Trends fetched successfully"
        )
    );
});

module.exports = { getSummary, getTrends };