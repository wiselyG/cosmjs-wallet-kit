import { Coin } from "@cosmjs/stargate"
export type sayHelloProps = {
  firstName: string,
  lastName?: string,
  age?: number,
}
export type wordscount = (12 | 15 | 18 | 21 | 24 | undefined);
export type walletBalance = { address: string, coins: readonly Coin[], index: number };
export function getGasPrice(chain:string,gasLevel?:number):{}{
  let gas_obj={
    amount:[{denom:"uatom",amount:"1000"}],
    gas: "200000"
  }
  if(chain.toLowerCase() === "cosmos"){
    gas_obj.amount[0].denom="uatom";
  }else if(chain.toLowerCase() === "juno"){
    gas_obj.amount[0].denom="ujuno";
  }else if(chain.toLowerCase() === "osmo"){
    gas_obj.amount[0].denom="uosmo";
  }else{
    throw new Error(`chain:${chain}not supported current`)
  }
  if(gasLevel!>0){
    gas_obj.amount[0].amount="1500";
  }
  return gas_obj;
}