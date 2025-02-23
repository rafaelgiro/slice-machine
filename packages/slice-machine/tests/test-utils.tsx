import React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { Store, AnyAction } from "redux";

import { Provider } from "react-redux";
import type { SliceMachineStoreType } from "../src/redux/type";
import configureStore from "../src/redux/store";
import theme from "../src/theme";
import { ThemeProvider, BaseStyles } from "theme-ui";

export type RenderArgs = Partial<
  {
    preloadedState: Partial<SliceMachineStoreType>;
    store: Store<SliceMachineStoreType, AnyAction>;
  } & RenderOptions
>;

function render(
  ui: any,
  {
    preloadedState,
    store = configureStore(preloadedState).store,
    ...renderOptions
  }: RenderArgs = {}
) {
  function Wrapper({ children }: { children: any }) {
    return (
      <ThemeProvider theme={theme}>
        <BaseStyles>
          <Provider store={store}>{children}</Provider>
        </BaseStyles>
      </ThemeProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };
