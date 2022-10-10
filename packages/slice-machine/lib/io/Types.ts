import path from "path";
import { generateTypes } from "prismic-ts-codegen";
import { PRISMIC_TYPES } from "@slicemachine/core/build/consts";
import {
  JsonPackage,
  retrieveJsonPackage,
} from "@slicemachine/core/build/node-utils/";

import { CustomTypes } from "@slicemachine/core/build/models/CustomType/index";
import { Slices } from "@slicemachine/core/build/models/Slice";
import Files from "../utils/files";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { getLocalCustomTypes } from "../utils/customTypes";
import { getLocalSlices } from "../utils/slices";
import { has } from "fp-ts/lib/Record";
import { isObject } from "lodash";

const NON_EDITABLE_FILE_HEADER =
  "// Code generated by Slice Machine. DO NOT EDIT.";

const generateAndWriteTypes = (env: BackendEnvironment) => {
  const customTypeModels = getLocalCustomTypes(env.cwd);
  const sharedSliceModels = getLocalSlices(env.cwd, env.manifest.libraries);

  const types = generateTypes({
    customTypeModels: customTypeModels.map((model) =>
      CustomTypes.fromSM(model)
    ),
    sharedSliceModels: sharedSliceModels.map((model) => Slices.fromSM(model)),
    clientIntegration: {
      includeCreateClientInterface: true,
      includeContentNamespace: true,
    },
  });

  const fileContents = `${NON_EDITABLE_FILE_HEADER}\n\n${types}`;

  Files.write(
    path.join(env.cwd, ".slicemachine", "prismicio.d.ts"),
    fileContents
  );
};

function getFromPackage(
  key: string,
  packageJson: JsonPackage | null
): Record<string, string> {
  if (
    packageJson !== null &&
    isObject(packageJson) &&
    has(key, packageJson) &&
    isObject(packageJson[key])
  )
    return packageJson[key];
  return {};
}

export const upsert = (env: BackendEnvironment) => {
  const packageJson = retrieveJsonPackage(env.cwd);
  const dependencies = getFromPackage("dependencies", packageJson.content);
  const devDependencies = getFromPackage(
    "devDependencies",
    packageJson.content
  );
  const allDependencies = {
    ...dependencies,
    ...devDependencies,
  };
  const hasTypesPackage = PRISMIC_TYPES in allDependencies;

  if (env.manifest && "generateTypes" in env.manifest) {
    // `generateTypes` is in manifest

    if (env.manifest.generateTypes) {
      if (hasTypesPackage) {
        generateAndWriteTypes(env);
      }
    } else {
      // Do nothing. User configured SM to not generate types.
    }
  } else {
    // `generateTypes` is not in manifest

    if (hasTypesPackage) {
      // Assume that we should generate types if `@prismicio/types` is installed.
      generateAndWriteTypes(env);
    }
  }
};
