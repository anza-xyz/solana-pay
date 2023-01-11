import { MerchantInfo } from "../components/sections/Merchant";

export async function convertMerchantData(response: Response) {
    return response.json().then((data: { values: (string | number)[][]; }) => {
        if (!data) throw new Error('data not fetched');
        if (!data.values || data.values.length === 0) throw new Error('missing data pattern');
        const labels = data.values[0];
        return data.values.filter((merchant, i) => i !== 0).map((merchant) => {
            const merchantInfo: MerchantInfo = {} as MerchantInfo;
            merchantInfo.index = Number(merchant[labels.indexOf("index")]);
            merchantInfo.address = String(merchant[labels.indexOf("address")]);
            merchantInfo.company = String(merchant[labels.indexOf("company")]);
            merchantInfo.currency = String(merchant[labels.indexOf("currency")]);
            merchantInfo.maxValue = Number(merchant[labels.indexOf("maxValue")]);
            merchantInfo.location = String(merchant[labels.indexOf("location")]);
            return merchantInfo;
        });
    });
}
