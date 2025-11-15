import { PutObjectCommand } from "@aws-sdk/client-s3";
import { minioClient, MINIO_BUCKET } from "@/lib/minio";
import { nanoid } from "nanoid";

// Maximum file size for in-memory buffer: 50MB
// FIXME: Files larger than this should use multipart upload
const BUFFER_LIMIT = 50 * 1024 * 1024;
// Maximum file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Motia-flows API endpoint
// In Docker: use service name, in local dev: use localhost
const MOTIA_FLOWS_URL =
  process.env.MOTIA_FLOWS_URL ||
  (process.env.NODE_ENV === "production" || process.env.MOTIA_DOCKER
    ? "http://motia-flows:3000"
    : "http://localhost:3000");

/**
 * Trigger Spark analysis for CSV files
 */
async function triggerSparkAnalysis(
  csvPath: string,
  originalName: string,
): Promise<{ analysisId: string; status: string; type: string } | null> {
  try {
    // Determine analysis type based on filename or use generic
    const analysisType = originalName.toLowerCase().includes("employee")
      ? "employees"
      : originalName.toLowerCase().includes("sales")
        ? "sales"
        : "generic";

    console.log(
      `🚀 Triggering Spark analysis: type=${analysisType}, path=${csvPath}`,
    );

    const response = await fetch(`${MOTIA_FLOWS_URL}/spark/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: analysisType,
        csvPath: csvPath,
        analysisType: analysisType === "generic" ? "profile" : undefined,
      }),
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Failed to trigger Spark analysis: ${response.status} - ${errorText}`,
      );
      return null;
    }

    const result = await response.json();
    console.log(
      `✅ Spark analysis queued successfully: ${result.analysisId} (${result.type})`,
    );
    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(
          "⏱️ Spark analysis request timed out - motia-flows may be unavailable",
        );
      } else if (error.message.includes("ECONNREFUSED")) {
        console.error(
          "🔌 Cannot connect to motia-flows - is it running?",
          error.message,
        );
      } else {
        console.error("❌ Error triggering Spark analysis:", error.message);
      }
    } else {
      console.error("❌ Unknown error triggering Spark analysis:", error);
    }
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const files = form.getAll("files");
    const metas = form.getAll("files_meta");

    console.log(
      `Received upload: files=${files.length}, metas=${metas.length}`,
    );

    const uploadedFiles = [];

    for (const f of files) {
      if (f instanceof Blob) {
        const originalName =
          f instanceof File && "name" in f ? (f as File).name : "unknown";
        const size = (f as Blob).size;

        // Check file size limit
        if (size > MAX_FILE_SIZE) {
          console.warn(
            `⚠️ File too large: ${originalName} (${(size / 1024 / 1024).toFixed(
              2,
            )}MB > ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          );
          throw new Error(
            `File ${originalName} is too large. Maximum size is ${
              MAX_FILE_SIZE / 1024 / 1024
            }MB`,
          );
        }

        console.log(
          `📤 Processing file: ${originalName} (${(size / 1024 / 1024).toFixed(
            2,
          )}MB) - ${f.type || "unknown type"}`,
        );

        // Detect file type for better handling
        const isArchive =
          originalName.match(/\.(zip|rar|tar|gz|7z)$/i) ||
          f.type?.includes("zip") ||
          f.type?.includes("archive");
        const isImage = f.type?.startsWith("image/");
        const isDocument = originalName.match(
          /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,
        );
        const isVideo = f.type?.startsWith("video/");
        const isCSV = originalName.match(/\.csv$/i) || f.type?.includes("csv");

        if (isArchive) console.log(`📦 Archive detected: ${originalName}`);
        if (isImage) console.log(`🖼️ Image detected: ${originalName}`);
        if (isDocument) console.log(`📄 Document detected: ${originalName}`);
        if (isVideo) console.log(`🎬 Video detected: ${originalName}`);
        if (isCSV) console.log(`📊 CSV detected: ${originalName}`);

        // Generate unique filename to avoid conflicts
        const uniqueFileName = `${nanoid()}-${originalName.replace(
          /[^a-zA-Z0-9.-]/g,
          "_",
        )}`;
        const objectKey = `uploads/${
          new Date().toISOString().split("T")[0]
        }/${uniqueFileName}`;

        try {
          // TODO: For very large files (>50MB), consider implementing multipart upload in the future
          if (size > BUFFER_LIMIT) {
            console.warn(
              `⚠️ Large file detected: ${originalName} (${(
                size /
                1024 /
                1024
              ).toFixed(
                2,
              )}MB). Consider multipart upload for optimal performance.`,
            );
          }

          // Convert Web ReadableStream to Node.js Buffer for AWS SDK compatibility
          const buffer = Buffer.from(await f.arrayBuffer());

          // Upload to MinIO using buffer
          await minioClient.send(
            new PutObjectCommand({
              Bucket: MINIO_BUCKET,
              Key: objectKey,
              Body: buffer,
              ContentLength: size,
              ContentType: f.type || "application/octet-stream",
              Metadata: {
                "original-name": originalName,
                "upload-timestamp": new Date().toISOString(),
                "file-size": size.toString(),
                "is-archive": isArchive ? "true" : "false",
                "is-image": isImage ? "true" : "false",
                "is-document": isDocument ? "true" : "false",
                "is-video": isVideo ? "true" : "false",
                "is-csv": isCSV ? "true" : "false",
              },
            }),
          );

          console.log(`✅ Uploaded to MinIO: ${objectKey} (${size} bytes)`);

          // Construct MinIO URL and S3A path
          // MinIO URL format: http://minio:9000/bucket/key
          // S3A path format: s3a://bucket/key
          const minioUrl = `http://minio:9000/${MINIO_BUCKET}/${objectKey}`;
          const s3aPath = `s3a://${MINIO_BUCKET}/${objectKey}`;

          // For CSV files, trigger Spark analysis
          let sparkAnalysis = null;
          if (isCSV) {
            console.log(
              `🚀 Triggering Spark analysis for CSV: ${originalName} at ${s3aPath}`,
            );
            sparkAnalysis = await triggerSparkAnalysis(s3aPath, originalName);
          }

          uploadedFiles.push({
            originalName,
            fileName: uniqueFileName,
            objectKey,
            size,
            contentType: f.type,
            url: minioUrl,
            s3aPath: isCSV ? s3aPath : undefined,
            fileType: {
              isArchive,
              isImage,
              isDocument,
              isVideo,
              isCSV,
            },
            sizeFormatted: `${(size / 1024 / 1024).toFixed(2)}MB`,
            sparkAnalysis: sparkAnalysis || undefined,
          });
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${originalName}:`, uploadError);
          throw new Error(`Upload failed for ${originalName}: ${uploadError}`);
        }
      } else {
        console.log("-- non-blob part:", f);
      }
    }

    // Process metadata if any
    for (const m of metas) {
      try {
        const parsed = typeof m === "string" ? JSON.parse(m) : m;
        console.log("-- meta:", parsed);
      } catch {
        console.log("-- meta (raw):", m);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        files: files.length,
        metas: metas.length,
        uploadedFiles: uploadedFiles,
        message: `Successfully uploaded ${uploadedFiles.length} file(s) to MinIO`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Upload handler error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: String(err),
        message: "Upload failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
