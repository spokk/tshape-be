import AWS from 'aws-sdk';
import * as handlers from './src';
import { winstonLogger as logger } from './src/utils/winstonLogger';

const s3 = new AWS.S3({ region: 'eu-west-1', signatureVersion: 'v4' });
const sqs = new AWS.SQS();

export const importFileParser = handlers.importFileParser({
    s3,
    sqs,
    logger,
});

export const importProductsFile = handlers.importProductsFile({
    s3,
});
