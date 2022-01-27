import { PublicKey } from '@solana/web3.js';
import React, { FC, useState } from 'react';
import { GoBack } from '../components/GoBack';
import { InfoIcon } from '../components/InfoIcon';
import { SolanaPay } from '../components/SolanaPay';
import { useSaveWallet } from '../hooks/useSession';

export const Onboard: FC = () => {

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="container pt-4">
        <div className="d-flex mb-4">
          <div className="flex-1">
            <GoBack />
          </div>
          <div>
            <SolanaPay />
          </div>
          <div className="flex-1"></div>
        </div>

        <div className="d-flex justify-content-center">
          <div className="col-md-4">
            <h1 className="text-center">
              Enter your USDC on Solana wallet address manually
          </h1>
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <p>Where can I find this? <span onClick={() => {
            setShowModal(true);
          }}><InfoIcon /></span></p>
        </div>

        <WalletForm />
      </div>

      <div className="modal" style={{ display: showModal ? "block" : "none" }} >
        <div className="mask" onClick={() => {
          setShowModal(false);
        }}></div>
        <div className="modal-dialog">
          <div className="modal-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => {
              setShowModal(false);
            }}>
              <path d="M18 6L6 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <h4>Where can I find my USDC wallet address?</h4>
            <p>You can find this number by opening up your Solana based wallet and viewing the account number associated with your USDC.</p>
          </div>
        </div>
      </div>
    </>
  )
};

const WalletForm: FC = () => {
  const [wallet, setWallet] = useState("");
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  const saveWallet = useSaveWallet();

  async function connect() {
    if (!wallet || wallet === "") {
      return setFeedback('Please enter a wallet address');
    }

    try {
      const key = new PublicKey(wallet);
      if (!PublicKey.isOnCurve(key.toBytes())) {
        setFeedback('Wallet address is invalid');
        return;
      }
    } catch(error) {
      return setFeedback('Wallet address is invalid');
    }

    if (!saveWallet) {
      return;
    }

    await saveWallet(wallet);
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="col-md-4 mt-4">
        <form>
          <div className="mb-4">
            <label className="form-label">Wallet address:</label>
            <input type="text" className={`form-control address mt-1 ${feedback ? 'is-invalid' : ''}`} value={wallet} onChange={(e) => setWallet(e.target.value)} />
            <div className="invalid-feedback mt-2" hidden={feedback === undefined}>
              <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0L0 17H20L10 0ZM9.38 6H10.63V11H9.38V6ZM10 15C9.45 15 9 14.55 9 14C9 13.45 9.45 13 10 13C10.55 13 11 13.45 11 14C11 14.55 10.55 15 10 15Z" fill="#FF5252" />
              </svg>
              {feedback}
            </div>
          </div>
          <div className="text-center mt-4">
            <button onClick={async (e) => {
              e.preventDefault();
              await connect();
            }}>Connect</button>
          </div>
        </form>
      </div>
    </div>
  )
};
