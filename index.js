const { init } = require('./init');
const { createAccounts } = require('./createAccounts');
const { createNonFungibleToken } = require('./createNonFungibleToken');
const { deploySmartContract } = require('./deploySmartContract');
const { scheduledTransaction } = require("./scheduledTransaction");
const { consensus } = require("./consensus");

const main = async () => {
    const { client } = await init();
    const accounts = await createAccounts(client);
    await createNonFungibleToken(client, accounts);
    await deploySmartContract(client, accounts);
    await scheduledTransaction(client, accounts);
    await consensus(client, accounts);
}
main();
