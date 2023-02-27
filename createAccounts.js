const {AccountBalanceQuery, PrivateKey, AccountCreateTransaction, Hbar} = require("@hashgraph/sdk");

const createAccounts = async (client) => {
    const myAccountBalance = await new AccountBalanceQuery()
        .setAccountId(client.operatorAccountId)
        .execute(client);

    console.log('========================');
    console.log('Task 1: ');
    console.log(`My account balance before sub-accounts creating: ${myAccountBalance.hbars}`)
    console.log('------------------------');

    //Create new keys
    const accounts = [];
    for (let i = 0; i < 5; i++) {
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.publicKey;
        const account = await new AccountCreateTransaction()
            .setKey(publicKey)
            .setInitialBalance(Hbar.fromTinybars(100))
            .execute(client);
        const { accountId } = await account.getReceipt(client);

        accounts[i] = { privateKey, accountId };
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        console.log(`Created account:`);
        console.log(`AccountId: ${accountId}`);
        console.log(`PublicKey: ${privateKey.publicKey.toString()}`);
        console.log(`PrivateKey: ${privateKey.toString()}`);
        console.log(`Balance ${accountBalance.hbars} hbars.`)
        console.log('------------------------');
    }


    const myAccountBalanceAfter = await new AccountBalanceQuery()
        .setAccountId(client.operatorAccountId)
        .execute(client);

    console.log(`My account balance after sub-accounts creating: ${myAccountBalanceAfter.hbars}`)

    return accounts;
}

module.exports = { createAccounts };