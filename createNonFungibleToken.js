const {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenAssociateTransaction,
    TransferTransaction,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar,
    TokenMintTransaction,
    AccountBalanceQuery,
} = require("@hashgraph/sdk");

const NFT_CID = [
    'ipfs://QmYTmbCo5mso5iPYtevuc4LVDhjoTJfxS5ZrG7oZFALJLz',
    'ipfs://QmbM3xAbgx1AeP4t5GW3JPnAhKGDW4kH1L8zGNMXHTCZ3J',
    'ipfs://QmciQMiUQiqtaTDJZFRfSmVDT67nnVVu6dMg5gKZ9a6Ddd',
    'ipfs://QmQg8XyEoWqez1JKHzMdgUvN6ahuHEVeF8zvh5dd6pN9sb',
    'ipfs://Qme91CemRV7HWPVdMdNvKeNHrkPwoi8FsT3wtdSGYDqCxd',
];

const createNonFungibleToken = async (client, accounts) => {
    const royaltyFee = new CustomRoyaltyFee()
        .setNumerator(1)
        .setDenominator(10)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200))
        .setFeeCollectorAccountId(accounts[1].accountId));

    const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("Moshenskyi Coin")
        .setTokenSymbol("MSH")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(accounts[0].accountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(5)
        .setSupplyKey(accounts[0].privateKey.publicKey)
        // .setCustomFees([royaltyFee])
        .freezeWith(client);

    const tokenCreateSign = await tokenCreateTx.sign(accounts[0].privateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const { tokenId } = await tokenCreateSubmit.getReceipt(client);

    console.log('========================');
    console.log('Task 2: ');
    console.log(`New NFT contract ID: ${tokenId}`);

    for (let i = 0; i < 5; i++) {
        const mintTx = await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from(NFT_CID[i])])
            .freezeWith(client);

        const mintTxSign = await mintTx.sign(accounts[0].privateKey);
        const mintTxSubmit = await mintTxSign.execute(client);
        const mintRx = await mintTxSubmit.getReceipt(client);
        console.log(`Minted NFT: ${mintRx.serials[0].low}`);
    }


    const assocTx = await new TokenAssociateTransaction()
        .setTokenIds([tokenId])
        .setAccountId(accounts[2].accountId)
        .freezeWith(client);

    const assocSign = await assocTx.sign(accounts[2].privateKey);
    await assocSign.execute(client);
    console.log('Account 3 associated to MSN NFT.')

    for (let i = 0; i < 5; i++) {
        let tokenTransferTx = await new TransferTransaction()
            .addNftTransfer(tokenId, i + 1, accounts[0].accountId, accounts[2].accountId)
            .freezeWith(client);

        const signTransferTx = await tokenTransferTx.sign(accounts[0].privateKey);
        const tokenTransferSubmit = await signTransferTx.execute(client);
        const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

        console.log(`Transfer NFT ${i + 1}: ${tokenTransferRx.status}`);
    }

    const balanceCheckTx = await new AccountBalanceQuery().setAccountId(accounts[2].accountId).execute(client);
    console.log(`Account3 balance after transfers: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);
}

module.exports = { createNonFungibleToken };