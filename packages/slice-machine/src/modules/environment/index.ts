import { Reducer } from "redux";
import { EnvironmentStoreType } from "./types";
import { ActionType, createAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { FrontEndEnvironment } from "@models/common/Environment";
import Warning from "@models/common/Warning";
import { ConfigErrors } from "@models/server/ServerState";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";
import { simulatorIsSupported } from "@lib/utils";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { PackageChangelog } from "@lib/models/common/versions";
import { PackageManager } from "@lib/models/common/PackageManager";

// Action Creators
export const getStateCreator = createAction("STATE/GET.RESPONSE")<{
  env: FrontEndEnvironment;
  warnings: ReadonlyArray<Warning>;
  configErrors: ConfigErrors;
  localCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
}>();

type EnvironmentActions = ActionType<typeof getStateCreator>;

// Selectors
export const getEnvironment = (
  store: SliceMachineStoreType
): FrontEndEnvironment => store.environment.env;

export const selectSimulatorUrl = (
  store: SliceMachineStoreType
): string | undefined => {
  return store.environment.env.manifest.localSliceSimulatorURL;
};

export const getFramework = (store: SliceMachineStoreType): Frameworks =>
  store.environment.env.framework;

export const selectIsSimulatorAvailableForFramework = (
  store: SliceMachineStoreType
): boolean => {
  return simulatorIsSupported(store.environment.env.framework);
};

export const getWarnings = (
  store: SliceMachineStoreType
): ReadonlyArray<Warning> => store.environment.warnings;

export const getConfigErrors = (store: SliceMachineStoreType): ConfigErrors =>
  store.environment.configErrors;

export const getChangelog = (
  store: SliceMachineStoreType
): PackageChangelog => {
  return store.environment.env.changelog;
};

export const getPackageManager = (
  store: SliceMachineStoreType
): PackageManager => {
  return store.environment.env.packageManager;
};

export const getCurrentVersion = (store: SliceMachineStoreType): string => {
  const { currentVersion } = getChangelog(store);
  return currentVersion;
};

export const getStorybookUrl = (
  store: SliceMachineStoreType
): string | null => {
  return store.environment.env.manifest.storybook || null;
};

export const getLinkToTroubleshootingDocs = (
  state: SliceMachineStoreType
): string => {
  const framework = getFramework(state);
  switch (framework) {
    case Frameworks.next:
      return "https://prismic.io/docs/technologies/setup-slice-simulator-nextjs";
    case Frameworks.nuxt:
      return "https://prismic.io/docs/technologies/setup-slice-simulator-nuxtjs";
    default:
      return "https://prismic.io/docs";
  }
};

export const getLinkToStorybookDocs = (
  state: SliceMachineStoreType
): string => {
  const framework = getFramework(state);
  switch (framework) {
    case Frameworks.next:
      return "https://prismic.io/docs/technologies/storybook-nextjs";
    case Frameworks.nuxt:
      return "https://prismic.io/docs/technologies/use-storybook-nuxtjs";
    case Frameworks.react:
      return "https://storybook.js.org/docs/react/get-started/install";
    case Frameworks.vue:
      return "https://storybook.js.org/docs/vue/get-started/install";
    case Frameworks.svelte:
      return "https://storybook.js.org/docs/svelte/get-started/install";
    default:
      return "https://prismic.io/docs";
  }
};

// Reducer
// This reducer is preloaded by a state coming from the /state call in the _app component
export const environmentReducer: Reducer<
  EnvironmentStoreType | null,
  EnvironmentActions
> = (state, action) => {
  if (!state) return null;

  switch (action.type) {
    case getType(getStateCreator):
      return {
        ...state,
        env: action.payload.env,
        warnings: action.payload.warnings,
        configErrors: action.payload.configErrors,
      };
    default:
      return state;
  }
};
