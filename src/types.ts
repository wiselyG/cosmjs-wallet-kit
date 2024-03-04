import { Coin } from "@cosmjs/stargate"
export type sayHelloProps = {
  firstName: string,
  lastName?: string,
  age?: number,
}
export type wordscount = (12 | 15 | 18 | 21 | 24 | undefined);
export type walletBalance = { address: string, coins: readonly Coin[], index: number };
export function getGasPrice(chain:string,customGas?:number):{amount:any[],gas:string}{
  let gas_obj={
    amount:[{denom:"uatom",amount:"1000"}],
    gas: "200000"
  }
  if(chain.toLowerCase() === "cosmos"){
    gas_obj.amount[0].denom="uatom";
    gas_obj.amount[0].amount="1500";
  }else if(chain.toLowerCase() === "juno"){
    gas_obj.amount[0].denom="ujuno";
    gas_obj.amount[0].amount="2000";
  }else if(chain.toLowerCase() === "osmo"){
    gas_obj.amount[0].denom="uosmo";
    gas_obj.amount[0].amount="2000";
  }else if(chain.toLowerCase() ==="axelar"){
    gas_obj.amount[0].denom="uaxl";
    gas_obj.amount[0].amount="1500";
  }else{
    throw new Error(`chain:${chain} not supported current`)
  }
  if(customGas){
    gas_obj.amount[0].amount=customGas.toString();
  }
  return gas_obj;
}