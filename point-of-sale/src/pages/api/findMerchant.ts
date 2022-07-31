import { NextApiHandler } from 'next';
import merchants from '../../server/data/merchant.json';

interface GetResponse {
    address: string;
    company: string;
    maxValue: number;
}

const findMerchant: NextApiHandler<GetResponse | undefined> = async (request, response) => {
    // If get request
    if (request.method === 'GET') {
        const id = Number(request.query.id);
        if (!id) throw new Error('missing id');
        if (typeof id !== 'number') throw new Error('invalid id');

        const merchant = merchants.find((merchant) => merchant.index === id);
        if (merchant) {
            const { address, company, maxValue } = merchant;
            response.status(200).json({ address, company, maxValue });
        } else {
            // 204 = successfully processed the request, not returning any content
            response.status(204).send(undefined);
        }
    } else {
        throw new Error(`Method ${request.method} not allowed`);
    }
};

export default findMerchant;
