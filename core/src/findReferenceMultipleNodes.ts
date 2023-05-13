import { findReference } from "@solana/pay";
import { ConfirmedSignatureInfo, Connection, Finality, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';
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

export async function findReferenceMultipleNodes(
    endpoints: string[],
    reference: PublicKey,
    { finality, ...options }: SignaturesForAddressOptions & { finality?: Finality } = {}
    ): Promise<ConfirmedSignatureInfo> {

    assert(endpoints.length > 0, 'endpoints must not be empty');

    const promises = endpoints.map((endpoint) => findReferencePromise(endpoint, reference, { finality: 'confirmed' }));
  
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

async function findReferencePromise(
    endpoint: string,
    reference,
    { finality, ...options }: SignaturesForAddressOptions & { finality?: Finality } = {}
    ): Promise<ConfirmedSignatureInfo> {
    
    assert(isValidUrl(endpoint), `${endpoint} is not a valid URL`);

    let signatureInfo;    
    try {
        const connection = await establishConnection(endpoint);

        signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
  
    } catch (error: any) {
      console.error(error);
    }
    return signatureInfo;
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