import { NextApiHandler } from 'next';
import { MerchantInfo } from "../../client/components/sections/Merchant";
import merchants from '../../server/data/merchant.json';

const fetchMerchants: NextApiHandler<MerchantInfo[] | undefined> = async (request, response) => {
    // If get request
    if (request.method === 'GET') {
        if (merchants.values.length <= 1) throw new Error('incomplete data');
        const labels = merchants.values[0];

        response.status(200).json(merchants.values.filter((merchant, i) => i !== 0).map((merchant, i) => {
            const index = Number(merchant[labels.indexOf("index")]);
            const address = String(merchant[labels.indexOf("address")]);
            const company = String(merchant[labels.indexOf("company")]);
            const currency = String(merchant[labels.indexOf("currency")]);
            const maxValue = Number(merchant[labels.indexOf("maxValue")]);
            const location = String(merchant[labels.indexOf("location")]);
            return { index, address, company, currency, maxValue, location };
        }));
    } else {
        throw new Error(`Method ${request.method} not allowed`);
    }
};

export default fetchMerchants;
