const mongoose = require("mongoose");
const Transaction = require("./src/modules/transactions/transaction.model");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const txs = await Transaction.find({}).limit(5);
  console.log(txs);
  process.exit(0);
}
run();
