import { NextApiHandler } from 'next';
import merchants from '../../server/data/merchant.json';

const fetchMerchants: NextApiHandler = async (request, response) => {
    if (request.method === 'GET') {                
        response.status(200).json(merchants);
    } else {
        throw new Error(`Method ${request.method} not allowed`);
    }
};

export default fetchMerchants;
