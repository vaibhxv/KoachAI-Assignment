import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const BUCKET_NAME = 'koachaibucket'; 

export const handler = async (event) => {
    console.log('Incoming event:', JSON.stringify(event, null, 2)); 
    console.log(event);


    if (!event) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No request body provided' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    try {
       
        const body = JSON.stringify(event);
        const timestamp = Date.now();
        const fileName = `data-${timestamp}.json`;

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: body,
            ContentType: 'application/json',
        };

        const data = await s3.putObject(params).promise();
        const response = {
            e_tag: data.ETag,
            url: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`
        };

        return {
            statusCode: 200,
            body: response,
            headers: {
                'Content-Type': 'application/json',
            }
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to store data', details: error }),
            headers: {
                'Content-Type': 'application/json',
            }
        };
    }
};
