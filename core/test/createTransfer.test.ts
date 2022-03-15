import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, Commitment, Keypair, clusterApiUrl, SystemProgram } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { createTransfer, CreateTransferFields } from "../src";

//addresses
const sender = Keypair.generate().publicKey;
const recipient = Keypair.generate().publicKey;

const createAccountInfo = (owner: PublicKey, executable: boolean) => (
  { data: Buffer.from(''), executable, lamports: 1000000000, owner }
);

const recentBlockhash = { blockhash: 'blockhash', feeCalculator: { lamportsPerSignature: 5000 } };

//accountInfo
const accountInfo = {
  [sender.toBase58()]: createAccountInfo(SystemProgram.programId, false),
  [recipient.toBase58()]: createAccountInfo(SystemProgram.programId, false),
};

jest.mock('@solana/spl-token', () => {
  const original = jest.requireActual("@solana/spl-token");
  const { Keypair } = jest.requireActual("@solana/web3.js");

  return {
    ...original,
    getMint: jest.fn().mockReturnValue(Promise.resolve({ 
      mintAuthorityOption: 1, mintAuthority: original.TOKEN_PROGRAM_ID, decimals: 4, 
      freezeAuthority: Keypair.generate().publicKey,freezeAuthorityOption: 1,
      isInitialized: true, supply: BigInt(1000), address: Keypair.generate().publicKey
    })),
    getAssociatedTokenAddress: jest.fn().mockReturnValue(Keypair.generate().publicKey),
    getAccount: jest.fn().mockReturnValue(Promise.resolve({
      address: Keypair.generate().publicKey, amount: BigInt(450), isInitialized: true, 
      delegatedAmount: BigInt(50), isFrozen: false, isNative: false, mint: Keypair.generate().publicKey,
      owner: Keypair.generate().publicKey, closeAuthority: null, delegate: null, rentExemptReserve: null,
    })),
  }
});

jest.spyOn(Connection.prototype, 'getAccountInfo').mockImplementation(
  async (publicKey: PublicKey, _commitment?: Commitment) => {
    return accountInfo[publicKey.toBase58()] || null;
  }
);

jest.spyOn(Connection.prototype, 'getRecentBlockhash').mockReturnValue(
  Promise.resolve(recentBlockhash)
);

const endpoint = clusterApiUrl('devnet');
const connection = new Connection(endpoint);

const transferFields: CreateTransferFields = {
  amount: new BigNumber(0.01),
  recipient,
}

describe('createTransfer', () => {
  it('should return a system transaction', async () => {
    const transaction = await createTransfer(connection, sender, transferFields);

    expect(transaction.feePayer).toEqual(sender);
    expect(transaction.recentBlockhash).toEqual(recentBlockhash);
    expect(transaction.instructions[0].programId).toEqual(SystemProgram.programId);
    expect(transaction.instructions[0].keys[0].pubkey).toEqual(sender);
    expect(transaction.instructions[0].keys[1].pubkey).toEqual(recipient);
  });

  it('should return an spl transaction', async () => {
    transferFields['splToken'] = Keypair.generate().publicKey;

    const transaction = await createTransfer(connection, sender, transferFields);

    expect(transaction.instructions[0].programId).toEqual(TOKEN_PROGRAM_ID)
  });
})
