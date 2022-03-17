import { clusterApiUrl, Connection, Keypair, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { fetchTransaction } from "../src";
import { Buffer } from 'buffer';

//data
const account = Keypair.generate();
const mockTransaction = new Transaction();
const instructions = new TransactionInstruction({
  keys: [
    {
      isSigner: true, isWritable: true, pubkey: account.publicKey,
    },
    {
      isSigner: false, isWritable: true, pubkey: Keypair.generate().publicKey
    }
  ],
  data: Buffer.alloc(0),
  programId: SystemProgram.programId
});
mockTransaction.instructions = [instructions];

describe('fetchTransaction', () => {
  
  it('should fetch transaction', async() => {
    mockTransaction.feePayer = account.publicKey;
    mockTransaction.recentBlockhash = "blockhash";
    console.log(mockTransaction.instructions);
    
    const serializedTransaction = mockTransaction.serialize();
    jest.spyOn(global, 'fetch').mockReturnValue(
      Promise.resolve(
        {
          json: () => Promise.resolve({transaction: String(serializedTransaction)})
        } as Response
      )
    );

    const connection = new Connection(clusterApiUrl('devnet'));
    const link = 'solana:https%3A%2F%2Fmvines.com%2Fsolana-pay%3Forder%3D12345?label=Michael&message=Thanks%20for%20all%20the%20fish';
    
    const transaction = await fetchTransaction(connection, account.publicKey, link);
    expect(transaction.feePayer).toEqual(account.publicKey);
  })
})
