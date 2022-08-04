import { NextApiHandler } from 'next';
import merchants from '../../server/data/merchant.json';

interface GetResponse {
    index: number;
    company: string;
}

const fetchMerchants: NextApiHandler<GetResponse[] | undefined> = async (request, response) => {
    // If get request
    if (request.method === 'GET') {
        const merchantList = merchants.map((merchant) => {
            const { index, company } = merchant;
            return { index, company };
        });

        response.status(200).json(merchantList);
    } else {
        throw new Error(`Method ${request.method} not allowed`);
    }
};

export default fetchMerchants;
