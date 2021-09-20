import { SNS } from 'aws-sdk';
import { ProductServiceInterface } from './services/products';
import { winstonLogger } from '../../import-service/src/utils/winstonLogger';

const sns = new SNS();

export const catalogBatchProcess =
    (productService: ProductServiceInterface) => async (event, _context) => {
        winstonLogger.logRequest(`Incoming event: ${JSON.stringify(event)}`);
        // try {
        const promises = event.Records.map((record) => {
            return new Promise(async (res, rej) => {
                winstonLogger.logRequest(`Start processing record: ${record.body}`);

                const product = await productService.create(record.body);

                winstonLogger.logRequest(`Created product: ${JSON.stringify(product)}`);

                console.log('product = ', product, product.id)

                console.log('process.env.SNS_ARN = ', process.env.SNS_ARN)

                if (product.id) {
                    console.log('sns.publish starts')

                    res(sns.publish({
                        Subject: 'New product created',
                        Message: JSON.stringify(product),
                        MessageAttributes: {
                            title: {
                                DataType: 'String',
                                StringValue: product.title
                            }
                        },
                        TopicArn: process.env.SNS_ARN
                    }, (error, data) => {
                        if (error) {
                            winstonLogger.logError(`Failed to send SNS notification: ${error}`);
                        } else {
                            winstonLogger.logRequest(`SNS notification was sent for ${data['title']}`);
                        }
                    }))
                }
            })
        })

        await Promise.allSettled(promises)

        // } catch (err) {
        //     winstonLogger.logError(`Failed to process batch request: ${err}`);
        // }
    };