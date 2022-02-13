import type { VercelApiHandler, VercelRequest, VercelResponse } from '@vercel/node';
import { RequestHandler } from 'express';

// Wrap an Express middleware function for compatibility with Vercel
export const wrapExpressHandler = function (handler: RequestHandler): VercelApiHandler {
    return function (request: VercelRequest, response: VercelResponse): Promise<void> {
        return new Promise<void>(function (resolve, reject) {
            handler(request as any, response as any, function (error?: any) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    };
};
