import { NextApiHandler } from 'next';
import fsPromises from 'fs/promises';
import path from "path";
import { LANGUAGE } from "../../client/utils/env";

interface GetResponse {
    message: string;
}

const fetchMessages: NextApiHandler<GetResponse[] | undefined> = async (request, response) => {
    // If get request
    if (request.method === 'GET') {
        const { locale, namespace } = request.query;
        const ns = namespace ?? "common";
        if (!locale) throw new Error('missing locale');
        if (typeof locale !== 'string') throw new Error('invalid locale');
        if (typeof ns !== 'string') throw new Error('invalid namespace');

        const exists = async (locale: string) => {
            try {
                await fsPromises.access(path.join(process.cwd(), 'locales/' + locale + '/' + ns + '.json'));
                return true;
            } catch {
                return false;
            }
        };

        const readData = async (locale: string) => {
            const filePath = path.join(process.cwd(), 'locales/' + locale + '/' + ns + '.json');
            const buffer = await fsPromises.readFile(filePath);
            return JSON.parse(buffer.toString());
        };

        const localeArray = [locale, locale.slice(0, 2), LANGUAGE];
        let i = 0;
        let isFileFound = false;
        while (!isFileFound && i < localeArray.length) {
            const l = localeArray[i++].toLowerCase();
            if (await exists(l)) {
                isFileFound = true;
                const jsonData = await readData(l);
                response.status(200).send(jsonData);
            }
        }

        if (!isFileFound) {
            throw new Error(`Language file for locales ${localeArray.join(', ')} not found`);
        }
    } else {
        throw new Error(`Method ${request.method} not allowed`);
    }
};

export default fetchMessages;
