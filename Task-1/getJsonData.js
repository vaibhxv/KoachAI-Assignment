import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const BUCKET_NAME = 'koachaibucket'; 

export const handler = async () => {
    {
        const params = {
            Bucket: BUCKET_NAME
        };
        
        const data = await s3.listObjectsV2(params).promise();
        const jsonFiles = data.Contents.map(async (file) => {
            const fileData = await s3.getObject({
                Bucket: BUCKET_NAME,
                Key: file.Key
            }).promise();
            return JSON.parse(fileData.Body.toString());
        });

        const results = await Promise.all(jsonFiles);
        
        return {
            results
        };
    } 
};
