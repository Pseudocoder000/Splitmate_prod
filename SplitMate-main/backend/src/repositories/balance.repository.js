const Balance = require("../models/Balance");

class BalanceRepository {
  find(groupId, lenderId, borrowerId, session = null) {

    const query = Balance.findOne({
        group: groupId,
        lender: lenderId,
        borrower: borrowerId,
    });

    if (session) {
        query.session(session);
    }

    return query;

}

  create(payload, session = null) {
    return Balance.create([payload], { session }).then((res) => res[0]);
  }

  update(id, amount, session = null) {
    return Balance.findByIdAndUpdate(
      id,
      {
        amount,
      },
      {
        new: true,
        session,
      },
    );
  }

  delete(id, session = null) {
    return Balance.findByIdAndDelete(id, { session });
  }

  getGroupBalances(groupId) {
    return Balance.find({
      group: groupId,
    })
      .populate("lender", "name email")
      .populate("borrower", "name email")
      .sort({
        amount: -1,
      });
  }

  getUserBalances(userId) {
    return Balance.find({
      $or: [
        {
          lender: userId,
        },
        {
          borrower: userId,
        },
      ],
    })
      .populate("group", "name")
      .populate("lender", "name email")
      .populate("borrower", "name email");
  }
}

module.exports = new BalanceRepository();
