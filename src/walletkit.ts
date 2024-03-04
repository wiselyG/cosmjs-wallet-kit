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

  async getSignerByPathIndex(pathIndex:number[]):Promise<OfflineDirectSigner>{
    if(pathIndex.length>79 || pathIndex.length<1){
      throw new Error(`generate wallet amount overflow,${pathIndex.length}`);
    }
    let firstPath=makeCosmoshubPath(pathIndex[0]);
    let pathArray=Array.of(firstPath);
    for(let i=1;i<pathIndex.length;i++){
      pathArray.push(makeCosmoshubPath(pathIndex[i]));
    }
    let walletSinger;
    try {
      walletSinger = await DirectSecp256k1HdWallet.fromMnemonic(this.m,{"prefix":this.c,"hdPaths":pathArray});
      return walletSinger;
    } catch (error:any) {
      console.error(error.stack)
      throw error;
    }
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

  async batchFaucet(mainPath:number,receiver:number[],value:number,customGas:number){
    if(value < 0){
      throw new Error("faucet value cant be negative");
    }
    if(!this.rpc){
      throw new Error("chain rpc is not setup");
    }
    if(receiver.length <1 || receiver.length>78){
      throw new Error(`receiver amount is out of range:${receiver.length}`);
    }
    const gasPrice = getGasPrice(this.c,customGas);

    const clientsigning = await this.getSignerByPathIndex([mainPath,...receiver]);
    const client:SigningStargateClient = await SigningStargateClient.connectWithSigner(this.rpc,clientsigning);
    const accounts=await clientsigning.getAccounts();
    console.log("total accounts:",accounts.length);
    console.log("main account amount:",(await client.getBalance(accounts[0].address,gasPrice.amount[0].denom)).amount);
    const sendmsg:any[]=[];
    for(let i=1;i<accounts.length;i++){
      sendmsg.push({
      typeUrl:"/cosmos.bank.v1beta1.MsgSend",
      value:{
        fromAddress: accounts[0].address,
        toAddress: accounts[i].address,
        amount: [{denom:gasPrice.amount[0].denom,amount:value.toString()},],
      },
      })
    }
    let result;
    try {
      result = await client.signAndBroadcast(accounts[0].address,sendmsg,gasPrice);
    } catch (error:any) {
      console.error(error.stack);
      throw error;
    }
    return {code:0,hash:result.transactionHash,gasUsed:result.gasUsed,height:result.height};

  }




}

const generateMnemonic=async (count?:wordscount):Promise<string> =>{

  const wallet:DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.generate(count);
  const mnemonic = wallet.mnemonic;
  return mnemonic;
}

const touCoin=(amount:number):number=>{
  if(!(amount>0)){
    throw new Error("amount must be positive number")
  }
  return amount*1000000;
}

export {Cosmwalletkit,generateMnemonic,touCoin}