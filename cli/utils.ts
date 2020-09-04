import fs from "fs";

export function jsonFileNames(dirPath: string) {
  return fs
    .readdirSync(dirPath)
    .filter((fileName) => fileName.endsWith(".json"));
}
