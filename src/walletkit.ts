import { DirectSecp256k1HdWallet,OfflineDirectSigner,makeCosmoshubPath,AccountData} from "@cosmjs/proto-signing";
import { StargateClient, SigningStargateClient, Coin} from '@cosmjs/stargate';
import { wordscount,walletBalance,getGasPrice } from "./types";
class Cosmwalletkit{
  private m:string;
  c:string;
  rpc:string;
  constructor(mnemonic: string,chain:string,r:string){
    this.m=mnemonic;
    this.c=chain;
    this.rpc=r;
  }

  async getSignerFromMnemonic(amount?:number):Promise<OfflineDirectSigner>{
      if(amount!>79){
        throw new Error("generate wallet amount overflow");
      }
      let path0=makeCosmoshubPath(0);
      let pathArray=Array.of(path0);
      if(amount){
        for(let i=1;i<amount;i++){
          pathArray.push(makeCosmoshubPath(i));
        }
      }
      const walletSinger=await DirectSecp256k1HdWallet.fromMnemonic(this.m,{"prefix":this.c,"hdPaths":pathArray});
      return walletSinger;
  }

  async getAccountData(walletSinger:OfflineDirectSigner):Promise<readonly AccountData[]>{
    return walletSinger.getAccounts();
  }

  async queryBalance(pathIndex:number[]):Promise<walletBalance[]>{
    if(pathIndex.length==0){
      throw new Error("pathIndex is not filled");
    }
    if(!this.rpc){
      throw new Error("chain rpc is not setup");
    }
    const client:StargateClient = await StargateClient.connect(this.rpc);
    const maxIndex=Math.max(...pathIndex)+1;
    const walletSinger = await this.getSignerFromMnemonic(maxIndex);
    const accounts=await this.getAccountData(walletSinger);
    let wallet:string;
    let balanceArray:walletBalance[]=[]
    for(let i=0;i<pathIndex.length;i++){
      wallet=accounts[pathIndex[i]].address;
      const coins = await client.getAllBalances(wallet);
      balanceArray.push({"address":wallet,"index":pathIndex[i],"coins":coins});
    }
    return balanceArray;
  }

  async batchFaucet(mainPath:number,receiver:number[],value:number){
    if(value < 0){
      throw new Error("faucet value cant be negative");
    }
    if(!this.rpc){
      throw new Error("chain rpc is not setup");
    }
    const gasPrice = getGasPrice(this.c);
    console.log(gasPrice);

  }




}

const generateMnemonic=async (count?:wordscount):Promise<string> =>{

  const wallet:DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.generate(count);
  const mnemonic = wallet.mnemonic;
  return mnemonic;
}

export {Cosmwalletkit,generateMnemonic}