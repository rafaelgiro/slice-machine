/** global variable define in server/src/index.js **/
declare let appRoot: string;
import {
  ComponentMocks,
  SliceSM,
  Frameworks,
  FrameworksC,
} from "@slicemachine/core/build/models";
import { sliceMockPath } from "@slicemachine/core/build/node-utils";
import { Files } from "@slicemachine/core/build/node-utils";
import * as t from "io-ts";
import { Response } from "express";
import { fold } from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import Storybook from "../../../../lib/storybook";

function saveSliceMockToFileSystem(
  cwd: string,
  framework: Frameworks,
  model: SliceSM,
  libraryName: string,
  mock: ComponentMocks
) {
  const path = sliceMockPath(cwd, libraryName, model.name);

  console.log("[slice/save-mock]: Generating stories");
  Storybook.generateStories(
    appRoot,
    framework,
    cwd,
    libraryName,
    model.name,
    model,
    mock
  );

  return Files.writeJson(path, mock);
}

export const SaveMockBody = t.strict({
  model: SliceSM,
  libraryName: t.string,
  mock: ComponentMocks,
});

export type SaveMockBody = t.TypeOf<typeof SaveMockBody>;

const SaveMockRequest = t.strict({
  env: t.strict({ cwd: t.string, framework: FrameworksC }),
  body: SaveMockBody,
});

export type SaveMockRequest = t.TypeOf<typeof SaveMockRequest>;

export default function handler(req: SaveMockRequest, res: Response) {
  pipe(
    req,
    (_) => SaveMockRequest.decode(_),
    fold(
      () => {
        res.status(400).end();
      },
      ({ body, env }) => {
        saveSliceMockToFileSystem(
          env.cwd,
          env.framework as Frameworks,
          body.model,
          body.libraryName,
          body.mock
        );
        res.json(body);
      }
    )
  );
}
