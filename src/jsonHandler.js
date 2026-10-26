
import { readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Read and parse a JSON file
export async function readJson(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }

    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file: ${filePath}`);
    }

    throw error;
  }
}

// Write JSON safely using a temporary file and rename
export async function writeJsonAtomic(filePath, data) {
  const directory = path.dirname(filePath);
  const fileName = path.basename(filePath);

  const temporaryPath = path.join(
    directory,
    `.${fileName}.${randomUUID()}.tmp`
  );

  try {
    const jsonContent = JSON.stringify(data, null, 2);

    await writeFile(temporaryPath, jsonContent, {
      encoding: "utf8",
      flag: "wx"
    });

    await rename(temporaryPath, filePath);
  } catch (error) {
    // Remove the temporary file if the write or rename fails
    const { unlink } = await import("node:fs/promises");

    try {
      await unlink(temporaryPath);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") {
        throw new Error(
          `Failed to clean up temporary file: ${cleanupError.message}`,
          { cause: error }
        );
      }
    }

    throw new Error(
      `Failed to save file ${filePath}: ${error.message}`,
      { cause: error }
    );
  }
}
