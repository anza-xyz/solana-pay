import { NextApiHandler } from 'next';
import merchants from '../../server/data/merchant.json';

interface GetResponse {
    index: number;
    address: string;
    company: string;
    currency: string;
    maxValue: number;
}

const fetchMerchants: NextApiHandler<GetResponse[] | undefined> = async (request, response) => {
    // If get request
    if (request.method === 'GET') {
        response.status(200).json(merchants.map((merchant) => merchant));
    } else {
        throw new Error(`Method ${request.method} not allowed`);
    }
};

export default fetchMerchants;
