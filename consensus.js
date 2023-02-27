const {
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

const consensus = async (client, accounts) => {
    const consensusTopic = await new TopicCreateTransaction()
        .setAdminKey(accounts[0].privateKey.publicKey)
        .freezeWith(client);

    const consensusSign = await consensusTopic.sign(accounts[0].privateKey);
    const consensusResult = await consensusSign.execute(client);
    let { topicId } = await consensusResult.getReceipt(client);

    console.log('========================');
    console.log('Task 6: ');
    console.log(`Created consensus with topicID: ${topicId}`);

    const sendMessage = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage((new Date).toISOString())
        .freezeWith(client);

    const sendMessageResult = await sendMessage.execute(client);
    const { status } = await sendMessageResult.getReceipt(client);
    console.log(`Message sent with status: ${status}`);
}

module.exports = { consensus };