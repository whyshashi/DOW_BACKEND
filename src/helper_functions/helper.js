//s3 imports
const multer  = require('multer')
const crypto  = require('crypto')
const sharp  = require('sharp')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const randomImageName = (bytes = 32) => crypto.randomBytes(16).toString('hex')
const { S3Client, PutObjectCommand , GetObjectCommand,DeleteObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } =require("@aws-sdk/s3-request-presigner");

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId:AWS_ACCESS_KEY,
        secretAccessKey:AWS_SECRET_ACCESS_KEY,
    },
    region:AWS_BUCKET_REGION
});



//S3 helper functions

async function s3DeleteFunction(imageUrl) {
    try {
        console.log("Inside S3 delete function");

        // Validate URL
        if (!imageUrl) {
            throw new Error("Invalid image URL provided");
        }

        // Extract the object key from the URL
        const urlParts = new URL(imageUrl);
        let objectKey = decodeURIComponent(urlParts.pathname.substring(1));

        console.log(`Attempting to delete: ${objectKey}`);

        // Ensure the object key is valid
        if (!objectKey) {
            throw new Error("Could not extract a valid object key from the URL.");
        }

        // Define S3 delete parameters
        const params = {
            Bucket: AWS_BUCKET_NAME, // Use environment variable directly
            Key: objectKey,
        };

        // Delete the object from S3
        const command = new DeleteObjectCommand(params);
        await s3.send(command);

        console.log(`Successfully deleted ${objectKey} from S3`);
        return { success: true, message: `Deleted ${objectKey}` };

    } catch (error) {
        console.error("Error deleting from S3:", error.message);
        return { success: false, error: error.message };
    }
}


async function s3SingleUploadFunction(imageBuffer, folderName = 'uploads', contentType) {

                try {
                    console.log("Uploading image...");
            
                    console.log(imageBuffer);
                
    
                    const buffer = await sharp(imageBuffer)
                        .resize({ height: 1080, width: 1080, fit: 'cover' })
                        .toBuffer();
        
                    const imageName = `DOW_IMAGES/${folderName}/${randomImageName()}`; 
        
                    const params = {
                        Bucket: AWS_BUCKET_NAME,
                        Key: imageName,
                        Body: buffer,
                        ContentType: contentType,
                    }

                    const command = new PutObjectCommand(params);
                    await s3.send(command);
                    imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
    
                    return imageUrl;
                }
                
                catch (error) {
                    console.log("Error uploading image:", error);
                    throw new Error("Failed to upload image to S3.");
                }
}



async function s3FileUploadFunction(fileBuffer, folderName = 'uploads', contentType) {
    try {
        console.log("Uploading file...");

        console.log(fileBuffer);

        const imageName = `DOW_DOCUMENTS/${folderName}/${randomImageName()}`;

        const params = {
            Bucket: AWS_BUCKET_NAME,
            Key: imageName,
            Body: fileBuffer,
            ContentType: contentType,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        let imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

        return imageUrl;
    } catch (error) {
        console.log("Error uploading image:", error);
        throw new Error("Failed to upload image to S3.");
    }
}


module.exports = { s3DeleteFunction , s3SingleUploadFunction , s3FileUploadFunction};