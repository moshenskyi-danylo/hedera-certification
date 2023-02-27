const compiledContract = require("./abi/CertificationC1.json");
const {
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
} = require("@hashgraph/sdk");
const { hethers } = require('@hashgraph/hethers');

const deploySmartContract = async (client, accounts) => {
    console.log('========================');
    console.log('Task 3: ');

    const bytecode = compiledContract.bytecode;
    const contractCreate = new ContractCreateFlow()
        .setGas(100000)
        .setAdminKey(accounts[0].privateKey.publicKey)
        .setBytecode(bytecode);
    const contractCreateSign = await contractCreate.sign(accounts[0].privateKey);
    const txResponse = await contractCreateSign.execute(client);
    const { contractId } = await txResponse.getReceipt(client);
    console.log(`The new contract ID is ${contractId}`);

    const contractQueryFunction1 = await new ContractExecuteTransaction()
        .setGas(100000)
        .setContractId(contractId)
        .setFunction('function1', new ContractFunctionParameters().addUint16(5).addUint16(6));

    const callFunction1 = await contractQueryFunction1.execute(client);
    const resultFunction1 = await callFunction1.getRecord(client);
    console.log('Executing call function1():');
    console.log(`Transaction status: ${resultFunction1.receipt.status}`);
    console.log(`Transaction id: ${resultFunction1.transactionId}`);

    const decoder = new hethers.utils.AbiCoder();
    const decodedResultFunction1 = decoder.decode(['uint16'], resultFunction1.contractFunctionResult.bytes);
    console.log(`Contract result for function1(3,4) is: ${decodedResultFunction1[0]}`);


    const contractQueryFunction2 = await new ContractExecuteTransaction()
        .setGas(100000)
        .setContractId(contractId)
        .setFunction('function2', new ContractFunctionParameters().addUint16(decodedResultFunction1[0]));

    const callFunction2 = await contractQueryFunction2.execute(client);
    const resultFunction2 = await callFunction2.getRecord(client);
    console.log('------------------------');
    console.log('Executing call function2():');
    console.log(`Transaction status: ${resultFunction2.receipt.status}`);
    console.log(`Transaction id: ${resultFunction2.transactionId}`);

    const decodedResultFunction2 = decoder.decode(['uint16'], resultFunction2.contractFunctionResult.bytes);
    console.log(`Contract result for function2(function1result) is: ${decodedResultFunction2[0]}`);
};

module.exports = { deploySmartContract };