# cosmjs-wallet-kit

This is a toolkit for batch generate cosmos/osmo/juno &etc wallets from a same mnemonic.
Also with function of batch faucet other accounts from main account.

## Functions

- Generate a new mnemonic

```
const test1= async ()=>{
  //you can custom the number of mnemonic words
  const mnemonic=await generateMnemonic(15);
  console.log("mnemonic: ",mnemonic);
}
```

- create a cosmjs wallet kit instance

```
import { Cosmwalletkit } from '@cosmcaptain/cosmjs-wallet-kit';
//chain value can be "cosmos"/"osmo"/"juno"
//rpc is the endpoint to the chain
let cosmkit = new Cosmwalletkit(mnemonic,chain,rpc)
```

- generate wallet signer(have 2 version)

```
//ver1
//will return 8 wallets start from hdPath index at 0
const walletSigner = await cosmkit.getSignerFromMnemonic(8);

//ver2
//will return wallets which hdPath is 0,1,2
const walletSigner = await cosmkit.getSignerByPathIndex([0,1,2])
```

- get Account Data

```
const accounts:AccountData[]=await cosmkit.getAccountData(walletSigner);
const address=accounts[0].address;
console.log("address:",address);
```

[view api document of AccountData](https://cosmos.github.io/cosmjs/latest/proto-signing/interfaces/AccountData.html)

- query balance of wallet with hdPath

```
const balances:WalletBalance[] = await cosmkit.queryBalance([2,3,4]);
const address = balances[0].address;
const coins:Coin[] = balances[0].coins;
const hdPath = balances[0].index;
```

[view api document of Coin](https://cosmos.github.io/cosmjs/latest/proto-signing/interfaces/Coin.html)

- batch faucet wallets

```
//mainPath which is the hdPath to send tokens from
//receiver is a number array which is receive tokens
//value is the amount for each wallet to send
const result = await cosmkit.batchFaucet(mainPath,receiver,value,customGas)
console.log(result.code);
```