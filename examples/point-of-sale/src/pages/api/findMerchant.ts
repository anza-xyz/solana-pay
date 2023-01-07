import { NextApiHandler } from 'next';
import merchants from '../../server/data/merchant.json';

interface GetResponse {
    address: string;
    company: string;
    currency: string;
    maxValue: number;
    location: string;
}

const findMerchant: NextApiHandler<GetResponse | undefined> = async (request, response) => {
    // If get request
    if (request.method === 'GET') {
        const id = Number(request.query.id);
        if (!id) throw new Error('missing id');
        if (typeof id !== 'number') throw new Error('invalid id');
        if (merchants.values.length <= 1) throw new Error('incomplete data');

        const labels = merchants.values[0];
        const merchant = merchants.values.find(merchant => merchant[labels.indexOf("index")] === id);
        if (merchant) {
            const address = String(merchant[labels.indexOf("address")]);
            const company = String(merchant[labels.indexOf("company")]);
            const currency = String(merchant[labels.indexOf("currency")]);
            const maxValue = Number(merchant[labels.indexOf("maxValue")]);
            const location = String(merchant[labels.indexOf("location")]);
            response.status(200).json({ address, company, currency, maxValue, location });
        } else {
            // 204 = successfully processed the request, not returning any content
            response.status(204).send(undefined);
        }
    } else {
        throw new Error(`Method ${request.method} not allowed`);
    }
};

export default findMerchant;
