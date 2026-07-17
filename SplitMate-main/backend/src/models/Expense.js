const mongoose = require("mongoose");

const { EXPENSE_TYPES } = require("../constants/expenseType");
const { SPLIT_TYPES } = require("../constants/splitType");

const splitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        percentage: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

const expenseSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        description: {
            type: String,
            default: ""
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },

        expenseType: {
            type: String,
            enum: Object.values(EXPENSE_TYPES),
            default: EXPENSE_TYPES.OTHER
        },

        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        splitType: {
            type: String,
            enum: Object.values(SPLIT_TYPES),
            required: true
        },

        splits: [splitSchema],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Expense", expenseSchema);