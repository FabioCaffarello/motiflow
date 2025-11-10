import { S3Client } from "@aws-sdk/client-s3";

export const minioClient = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || "http://minio:9000",
  region: "us-east-1", // MinIO requires a region, but any value works
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minio",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minio123",
  },
  forcePathStyle: true, // Required for MinIO
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "motiflow";
