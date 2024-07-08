import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function getKeyFromUrl(url) {
  const index = url.lastIndexOf("/");
  return url.substring(index + 1);
}

async function deleteImageFromS3(imageUrl) {
  try {
    const imageKey = getKeyFromUrl(imageUrl);

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageKey,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);

    console.log(`Image with key ${imageKey} deleted from S3 bucket.`);
  } catch (err) {
    console.error(`Error deleting image with key ${imageKey}: ${err.message}`);
  }
}

export { deleteImageFromS3 };
