const {
    TransferTransaction,
    Hbar,
    Transaction, AccountBalanceQuery,
} = require("@hashgraph/sdk");

//Helper HEX to bytes
function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return Uint8Array.from(bytes);
}

const getBalances = async (client, accounts) => {
    const account0Balance = await new AccountBalanceQuery()
        .setAccountId(accounts[0].accountId)
        .execute(client);

    const account1Balance = await new AccountBalanceQuery()
        .setAccountId(accounts[1].accountId)
        .execute(client);

    return [account0Balance.hbars, account1Balance.hbars];
}

const createTransaction = (client, accounts) => {
    const transaction = new TransferTransaction()
        .addHbarTransfer(accounts[0].accountId, Hbar.fromTinybars(-10))
        .addHbarTransfer(accounts[1].accountId, Hbar.fromTinybars(10))
        .freezeWith(client);

    const bytes = transaction.toBytes();
    return bytes.toString('hex');
}

const executeTransaction = async (client, accounts, serializedTransaction) => {
    const transaction = TransferTransaction.fromBytes(hexToBytes(serializedTransaction));

    const transactionSign = await transaction.sign(accounts[0].privateKey);
    const tokenCreateSubmit = await transactionSign.execute(client);
    const { status } = await tokenCreateSubmit.getReceipt(client);
    console.log(`Scheduled transaction execute status: ${status}`);
}

const scheduledTransaction = async (client, accounts) => {
    console.log('========================');
    console.log('Task 4: ');

    console.log(`Balances of account 1 and 2 before scheduledTransaction: ${await getBalances(client, accounts)} hbars.`);
    const serializedTransaction = createTransaction(client, accounts);
    console.log(`Serialized transaction: 0x${serializedTransaction.substring(0, 60)}...`);
    await executeTransaction(client, accounts, serializedTransaction)
    console.log(`Balances of account 1 and 2 after scheduledTransaction: ${await getBalances(client, accounts)} hbars.`);
};

module.exports = { scheduledTransaction };