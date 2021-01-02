import { UploadedFile } from "express-fileupload";
import { createWriteStream, existsSync, unlink } from "fs";
import { ensureDir } from "fs-extra";
import { dirname, extname, join } from "path";
import sharp from "sharp";
import { Readable } from "stream";
import urljoin from "url-join";
import uuidv4 from "uuid/v4";

import { resolveVar } from "./Config";

const ALLOWED_FILE_EXT = [".webp", ".jpeg", ".jpg", ".png", ".gif"];
const ALLOWED_UPLOAD_TYPE = ["user"];

export async function handleUploadFile(
  file: UploadedFile | UploadedFile[],
  type: string
) {
  if (!ALLOWED_UPLOAD_TYPE.includes(type)) {
    throw new Error(`Upload type '${type}' not allowed`);
  }

  const resizer = sharp().resize(1024).rotate().webp();

  if (!Array.isArray(file)) file = [file];

  const uploads = file.map(async f => {
    const ext = extname(f.name).toLowerCase();

    if (!ALLOWED_FILE_EXT.includes(ext)) {
      throw new Error(`Upload file ext '${ext}' not allowed`);
    }

    const dstFilename = uuidv4() + ".webp";
    const dstPath = getUploadPath(type, dstFilename);

    await ensureDir(dirname(dstPath));

    return new Promise((resolve, reject) => {
      const output = createWriteStream(dstPath);
      output.on("error", error => {
        unlink(dstPath, () => {
          reject(error);
        });
      });
      output.on("finish", () => resolve(dstFilename));

      const input = new Readable();
      input._read = () => {
        input.push(f.data);
        input.push(null);
      };

      input.pipe(resizer).pipe(output);
    });
  });

  return Promise.all(uploads);
}

export function getUploadPath(type: string, filename: string) {
  return join(resolveVar("/uploads"), type, filename);
}

export function checkUploadPath(type: string, filename: string) {
  const path = getUploadPath(type, filename);
  return existsSync(path);
}

export async function removeUploadFile(type: string, filename: string) {
  const path = getUploadPath(type, filename);
  new Promise(resolve => unlink(path, resolve));
}

export function getUploadUrl(type: string, filename: string) {
  return urljoin(process.env.UPLOADS_PUBLIC_PATH, type, filename);
}
