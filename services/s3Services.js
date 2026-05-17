import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, ListBucketsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_KEY_SECRET,
  },
});

export async function generatePOSTURL({ key, contentType }) {

  const command = new PutObjectCommand({
    Bucket: "quickdrive-app",
    Key: key,
    ContentType: contentType
  });
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-type"]),
  });
  // console.log(url);

  return url
}

export async function generateGETURL({ key, download = false, filename }) {
  // console.log(key);
  // console.log(download);
  // console.log(filename);

  const command = new GetObjectCommand({
    Bucket: "quickdrive-app",
    Key: key,
    ResponseContentDisposition: `${download ? 'attachment' : 'inline'};filename=${filename}`
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  return url
}

export async function verifyPostData({ key }) {
  console.log("key:", key);


  const command = new HeadObjectCommand({
    Bucket: "quickdrive-app",
    Key: key,
  });

  const { ContentLength } = await s3Client.send(command);

  return ContentLength
}

export async function deleteS3File({ key }) {
  console.log("key:", key);

  const command = new DeleteObjectCommand({
    Bucket: "quickdrive-app",
    Key: key,
  });
  const response = await s3Client.send(command)
  return response
}

export async function deleteS3Files(keys) {
  console.log("key:", keys);

  const command = new DeleteObjectsCommand({
    Bucket: "quickdrive-app",
    Delete: {
      Objects: keys,
      Quiet: false, 
    },
  });

  const response = await s3Client.send(command);
  return response

}