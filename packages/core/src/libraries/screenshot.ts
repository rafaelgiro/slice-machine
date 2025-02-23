import { Screenshot } from "../models";
import path from "path";
import { Files } from "../node-utils";

export enum Extensions {
  jpeg = "jpeg",
  jpg = "jpg",
  png = "png",
}

export function createPathToScreenshot({
  path: filePath,
  from,
  sliceName,
  variationId,
  extension,
}: {
  path: string;
  from: string;
  sliceName: string;
  variationId: string;
  extension: Extensions;
}): string {
  return path.join(
    filePath,
    from,
    sliceName,
    variationId,
    `preview.${extension}`
  );
}

export function generatePathsToScreenshot({
  base,
  from,
  sliceName,
  variationId,
}: {
  base: string;
  from: string;
  sliceName: string;
  variationId: string;
}): Array<string> {
  return Object.values(Extensions).map((imageType: string) => {
    return path.join(
      base,
      from,
      sliceName,
      variationId,
      `preview.${imageType}`
    );
  });
}

export function resolvePathsToScreenshot({
  paths,
  from,
  sliceName,
  variationId,
}: {
  paths: ReadonlyArray<string>;
  from: string;
  sliceName: string;
  variationId: string;
}): Screenshot | undefined {
  const possiblePaths = paths
    .map((base) =>
      generatePathsToScreenshot({
        base,
        from,
        sliceName,
        variationId,
      })
    )
    .flat();

  const matchingPath = possiblePaths.find(Files.exists);
  if (!matchingPath) {
    return;
  }

  try {
    const hash = Files.readFileAndCreateHashSync(matchingPath);
    return {
      path: matchingPath,
      hash,
    };
  } catch (_) {
    return;
  }
}
