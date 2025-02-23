import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";
import { Files, YarnLockPath } from "@slicemachine/core/build/node-utils";

import {
  BackendEnvironment,
  FrontEndEnvironment,
} from "../../../lib/models/common/Environment";
import ServerError from "../../../lib/models/server/ServerError";
import ServerState from "../../../lib/models/server/ServerState";

import fetchLibs from "./libraries";
import fetchCustomTypes from "./custom-types/index";
import { RequestWithEnv } from "./http/common";
import { getAndSetUserProfile } from "./services/getAndSetUserProfile";
import { validateOrReplaceMocks } from "./common/validateOrReplaceMocks";

export const getBackendState = async (
  configErrors: Record<string, ServerError>,
  env: BackendEnvironment
) => {
  validateOrReplaceMocks(env.cwd, env.manifest.libraries);

  const { libraries, remoteSlices, clientError } = await fetchLibs(env);
  const { customTypes, remoteCustomTypes } = await fetchCustomTypes(env);

  // Refresh auth
  if (env.prismicData.auth) {
    await env.client
      .refreshAuthenticationToken()
      .then((newAuthenticationToken: string) => {
        PrismicSharedConfigManager.setAuthCookie(newAuthenticationToken);
        env.client.updateAuthenticationToken(newAuthenticationToken);

        // set the user profile if it doesn't exist yet.
        if (!env.prismicData.shortId || !env.prismicData.intercomHash)
          return getAndSetUserProfile(env.client);
      })
      .catch((error: Error) =>
        console.error("[Refresh token]: Internal error : ", error.message)
      );
  }

  return {
    libraries,
    customTypes,
    remoteCustomTypes,
    remoteSlices,
    clientError,
    configErrors,
    env,
  };
};

export default async function handler(
  req: RequestWithEnv
): Promise<ServerState> {
  const { errors: configErrors, env } = req;
  const serverState = await getBackendState(configErrors, env);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars
  const { client, cwd, prismicData, baseUrl, ...frontEnv } = serverState.env;
  const frontEndEnv: FrontEndEnvironment = {
    ...frontEnv,
    sliceMachineAPIUrl: baseUrl,
    packageManager: Files.exists(YarnLockPath(cwd)) ? "yarn" : "npm",
    shortId: prismicData.shortId,
    intercomHash: prismicData.intercomHash,
  };

  return {
    customTypes: serverState.customTypes,
    remoteCustomTypes: serverState.remoteCustomTypes,
    libraries: serverState.libraries,
    remoteSlices: serverState.remoteSlices,
    env: frontEndEnv,
    clientError: serverState.clientError,
  };
}
