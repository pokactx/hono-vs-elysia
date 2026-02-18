import { S3Client } from "@aws-sdk/client-s3";

export const S3 = new S3Client({
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string,
  },
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT as string,
  region: "auto",
});
