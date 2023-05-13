import { validateTransfer, ValidateTransferFields } from "@solana/pay";
import { Connection, Finality, TransactionResponse, TransactionSignature } from '@solana/web3.js';
import assert from 'assert';

/**
 * find Reference against multiple nodes to guarantee robustness.
 * The endpoints are provided as string array.
 * let endpoint1: string = 'https://api.devnet.solana.com';
 * let endpoint2: string = 'https://rpc.ankr.com/solana_devnet';
 * let endpoint3: string = 'https://rpc-devnet.helius.xyz/?api-key=<INSERT YOUR API KEY HERE>';
 * let endpoints = [endpoint1, endpoint2, endpoint3];
 * processing exits once the fastest endpoint returns result.
*/

export async function validateTransferMultipleNodes(
    endpoints: string[],
    signature: TransactionSignature,
    { recipient, amount, splToken, reference, memo }: ValidateTransferFields,
    options?: { commitment?: Finality }
    ): Promise<TransactionResponse> {

    assert(endpoints.length > 0, 'endpoints must not be empty');

    const promises = endpoints.map((endpoint) => validateTransferPromise(endpoint, signature, { recipient, amount, splToken, reference, memo }));
  
    return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then((result) => {
          resolve(result);
        }).catch((error) => {
          // Ignore errors and continue with the next promise
        });
      });
    });
}

async function validateTransferPromise(
    endpoint: string,
    signature: TransactionSignature,
    { recipient, amount, splToken, reference, memo }: ValidateTransferFields,
    options?: { commitment?: Finality }
    ): Promise<TransactionResponse> {

    assert(isValidUrl(endpoint), `${endpoint} is not a valid URL`);
        
    let response;
    try {
        const connection = await establishConnection(endpoint);

        response = await validateTransfer(connection, signature, { recipient, amount, splToken, reference, memo });
  
    } catch (error: any) {
      console.error(error);
    }
    return response;
}

async function establishConnection(endpoint: string): Promise<Connection> {
    const connection = new Connection(endpoint, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', endpoint, version);

    return connection;
}

function isValidUrl(urlString: string) {
  assert(urlString.length > 0, 'url must not be empty');

  let isValid = false;
  try {
    const urlRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*$/;
    isValid = urlRegex.test(urlString);
  } catch (error: any) {
    console.error(error);
  }
  return isValid;
}