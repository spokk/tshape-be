import csv from "csv-parser";

const BUCKET = "mybuckettask5";

export const importFileParser = ({ s3, sqs, logger }) => async (event) => {
    const promises = event.Records.map((record) => {
        const s3Stream = s3.getObject({
            Bucket: BUCKET,
            Key: record.s3.object.key,
        }).createReadStream();

        return new Promise((res, rej) => {
            s3Stream.pipe(csv())
                .on('data', async (data) => {

                    console.log({ sqs_url: 'https://sqs.eu-west-1.amazonaws.com/852703267924/cvs-sqs', body: JSON.stringify(data) })

                    await sqs.sendMessage({
                        QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/852703267924/cvs-sqs',
                        MessageBody: JSON.stringify(data),
                    }, (error, data) => {
                        if (error) {
                            console.log(`Error for send to SQS: ${error}`);
                        } else {
                            console.log(`Message was sent to SQS: ${data}`);
                        }
                    })


                })
                .on('end', () => {
                    console.log(`Copy from ${BUCKET}/${record.s3.object.key}`);

                    console.log(`Copied into ${BUCKET}/${record.s3.object.key.replace('uploaded', 'parsed')}`);

                    res(s3.copyObject({
                        Bucket: BUCKET,
                        CopySource: `${BUCKET}/${record.s3.object.key}`,
                        Key: record.s3.object.key.replace('uploaded', 'parsed'),
                    }).promise())

                })
        })
    })

    await Promise.allSettled(promises)
};
