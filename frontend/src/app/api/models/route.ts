import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const models = [];
  const publicDir = path.join(process.cwd(), "public");
  const types = ["obj", "glb"];

  for (const type of types) {
    const typeDir = path.join(publicDir, type);
    if (!fs.existsSync(typeDir)) continue;

    const items = fs.readdirSync(typeDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        // Checking subdirectory for model file
        const modelDir = path.join(typeDir, item.name);
        const files = fs.readdirSync(modelDir);

        // Find main model file
        const modelFile = files.find(
          (f) =>
            f.toLowerCase().endsWith(`.${type}`) ||
            (type === "glb" && f.toLowerCase().endsWith(".gltf"))
        );

        if (modelFile) {
          // Find thumbnail
          const thumbnailFile = files.find((f) =>
            f.toLowerCase().startsWith("thumbnail.")
          );

          models.push({
            id: `${type}-${item.name}`,
            name: item.name.replace(/_/g, " "), // Simple formatting
            category: type,
            url: `/${type}/${item.name}/${modelFile}`,
            thumbnailUrl: thumbnailFile
              ? `/${type}/${item.name}/${thumbnailFile}`
              : null,
          });
        }
      } else if (item.isFile()) {
        // Handle root files in obj/glb folders just in case, though user said they made directories
        // Skipping for now to enforce "directory per model" or robustly handle mixed content
        // Let's stick to the directory structure as requested, but if needed we can add single file support.
        // For now, ignoring single files to keep gallery clean based on user prompt.
      }
    }
  }

  return NextResponse.json(models);
}
