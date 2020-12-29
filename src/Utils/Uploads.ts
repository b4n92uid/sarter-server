import { createWriteStream, mkdirSync, readFileSync, unlink } from "fs";
import mime from "mime-types";
import { dirname, extname, join } from "path";
import urljoin from "url-join";
import uuidv4 from "uuid/v4";
import sharp from "sharp";

import { resolveVar } from "./Config";

const ALLOWED_FILE_TYPE = [".webp", ".jpeg", ".jpg", ".png", ".gif"];

function getUploadPath(type: string, filename: string) {
  return join(resolveVar("/uploads"), type, filename);
}

type UploadTypes = "user" | "company" | "product";

export async function handleUploadFile(type: UploadTypes, file: any): Promise<string> {
  const { createReadStream, filename } = await file.promise;

  const ext = extname(filename).toLowerCase();

  if (!ALLOWED_FILE_TYPE.includes(ext)) {
    throw new Error(`Upload file '${ext}' type not allowed`);
  }

  const dstFilename = uuidv4() + ".webp";
  const path = getUploadPath(type, dstFilename);

  const resizer = sharp().resize(1024).rotate().webp();

  return new Promise((resolve, reject) => {
    mkdirSync(dirname(path), { recursive: true });

    const writeStream = createWriteStream(path);

    writeStream.on("error", error => {
      unlink(path, () => {
        reject(error);
      });
    });

    writeStream.on("finish", () => resolve(dstFilename));

    const stream = createReadStream();
    stream.on("error", error => writeStream.destroy(error));
    stream.pipe(resizer).pipe(writeStream);
  });
}

export async function removeUploadFile(type: UploadTypes, filename: string) {
  const path = getUploadPath(type, filename);
  new Promise(resolve => unlink(path, resolve));
}

export function getUploadAsBase64(type: UploadTypes, filename: string) {
  const path = getUploadPath(type, filename);
  const content = readFileSync(path).toString("base64");
  const mimeType = mime.lookup(path);

  return `data:${mimeType};base64,${content}`;
}

export function getUploadUrl(type: UploadTypes, filename: string) {
  return urljoin(process.env.UPLOADS_PUBLIC_PATH, type, filename);
}
