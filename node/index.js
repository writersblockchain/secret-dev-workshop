import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";

const wallet = new Wallet();
// "your wallet seed to go here"

const contract_wasm = fs.readFileSync("../contract.wasm");

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-2",
  url: "https://api.pulsar.scrttestnet.com",
  wallet: wallet,
  walletAddress: wallet.address,
});

// console.log(secretjs);

let codeId = 20305;
let contractCodeHash =
  "5aaec6999f653dc7cbed0f8403e714d0fa49e5770e234055e86ad3d6d996cf45";
let contractAddress = "secret1wd3ymrxlfjujm798s9sllt98a75d8mu8dmej95";

let upload_contract = async () => {
  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  const codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );

  console.log("codeId: ", codeId);

  const contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;
  console.log(`Contract hash: ${contractCodeHash}`);
};

// upload_contract();

let instantiate_contract = async () => {
  // Create an instance of the Counter contract, providing a starting count
  const initMsg = { entropy: "this is my entropy, dude!" };
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: initMsg,
      label: "Secret Business Card Demo" + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );

  //Find the contract_address in the logs
  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log(contractAddress);
};

// instantiate_contract();

let createCard = async () => {
  const card_creation_tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        create: {
          card: {
            name: "CardMonkey",
            address: "CodeMonkey Street",
            phone: "123456789",
          },
          index: 0,
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 100_000 }
  );

  console.log(card_creation_tx);
};
// createCard();

let createViewingKey = async () => {
  let viewing_key_creation = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        generate_viewing_key: {
          index: 0,
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 100_000 }
  );

  console.log(
    viewing_key_creation.arrayLog.find(
      (log) => log.type === "wasm" && log.key === "viewing_key"
    ).value
  );
};
// createViewingKey();

let queryCard = async () => {
  let business_card_query_tx = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_card: {
        wallet: wallet.address,
        viewing_key: "uWya+BftiEco4ziOrbVsQCoytQb6s6JSDX2Q0uzc6uc=",
        index: 0,
      },
    },
    code_hash: contractCodeHash,
  });

  console.log(business_card_query_tx);
};
queryCard();
