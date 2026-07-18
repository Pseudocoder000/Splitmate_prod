const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            index: true,
        },

        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        borrower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

balanceSchema.index(
    {
        group: 1,
        lender: 1,
        borrower: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Balance", balanceSchema);