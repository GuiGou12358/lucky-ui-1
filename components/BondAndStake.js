import { useContext, useState, useEffect } from "react";
import Button from "./Button";
import { ConnectContext } from "../context/ConnectProvider";
import { DAPP_STAKING_CONTRACT_ADDRESS } from "../artifacts/constants";
import account from "../context/account";

const style = {
  wrapper: `h-screen w-screen flex items-center justify-center mt-14`,
  content: `bg-[#191B1F] w-[40rem] rounded-2xl p-4`,
  transferPropContainer: `bg-[#20242A] my-4 rounded-2xl p-4 text-3xl  border border-[#20242A] hover:border-[#41444F]  flex justify-between`,
  transferPropInput: `bg-transparent placeholder:text-[#B2B9D2] outline-none mb-6 w-full text-2xl`,
};
let injector;

function BondAndStake() {

  const { api } = useContext(ConnectContext);
  const [stakeValue, setStakeValue] = useState(5000000000000000000n);

  async function doBondAndStake() {
    try {
      // maximum gas to be consumed for the call. if limit is too small the call will fail.
      const gasLimit = 30000n * 1000000n;
      // a limit to how much Balance to be used to pay for the storage created by the contract call
      // if null is passed, unlimited balance can be used
      const storageDepositLimit = null;

      //const { web3FromSource } = await import("@polkadot/extension-dapp");
      const { web3FromSource } = await import('@talismn/connect-components');
      //console.log("SaS:"+account)
      const injector = await web3FromSource(account.current.source);
      
      /*
      if (stakeValue === undefined){
        console.log('Set default value');
        stakeValue = 5000000000000000000n;
      }*/

      console.log('Bond and stake ' + stakeValue);

      const stake = api.registry.createType('Balance', stakeValue);
      const contractId = api.registry.createType('AccountId', DAPP_STAKING_CONTRACT_ADDRESS);
      console.log('stake ' + stake.toHuman());
      console.log('contractId ' + contractId.toHuman());
      
      api.tx.dappsStaking.bondAndStake(
        {Wasm : contractId}, 
        stake
        )
        .signAndSend(
          account.current.address,
          {signer: injector.signer}, 
          (result) => {
            console.log('Transaction status:', result.status.type);

            if (result.status.isInBlock || result.status.isFinalized) {
                console.log('Transaction hash ', result.txHash.toHex());

                result.events.forEach(({ phase, event : {data, method, section}} ) => {
                    console.log(' %s : %s.%s:: %s', phase, section, method, data);
                    if (section == 'system' && method == 'ExtrinsicSuccess'){
                        console.log('Success');
                    } else if (section == 'system' && method == 'ExtrinsicFailed'){
                        console.log('Failed');
                    }
                });
            } else if (result.isError){
                console.log('Error');
            }
          }
        );
    
    } catch (error) {
      console.log(":( transaction failed", error);
    }
  };
  
  return (
    <div className={style.wrapper}>
      <div className={style.content}>
          <div>
            Feelin lucky ?
            <div className={style.transferPropContainer}>
              <input
                type="text"
                className={style.transferPropInput}
                placeholder="Stake Value, min: 5 SBY"
                onChange={(e) => {setStakeValue(e.target.value); console.log(e.target.value*1000000000000000000)}}
              />
            <div onClick={() => doBondAndStake()}>
              <Button title="Stake" />
            </div>
          </div>   
        </div>    
      </div>
    </div>
  );
};
export default BondAndStake;