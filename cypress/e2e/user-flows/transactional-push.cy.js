import { SlicePage } from "../../pages/slices/slicePage";
import { Menu } from "../../pages/Menu";

describe("I am an existing SM user and I want to push local changes", () => {
  const random = Date.now();

  const slice = {
    id: `test_push${random}`,
    name: `TestPush${random}`,
    library: "slices",
  };

  const customType = {
    id: `push_ct_${random}`,
    name: `Push CT ${random}`,
  };

  function mockPushLimit(limitType, customTypesInPush) {
    cy.intercept("POST", "/api/push-changes", {
      statusCode: 200,
      body: {
        type: limitType,
        details: {
          customTypes: customTypesInPush,
        },
      },
    });
  }

  function unmockPushLimit() {
    cy.intercept("POST", "/api/push-changes", (req) => {
      req.continue()
    });
  }

  function mockPushError() {
    cy.intercept("POST", "/api/push-changes", {
      statusCode: 500,
      body: null,
    });
  }

  before("Cleanup local data and create a new slice", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
  });

  beforeEach("Start from the Slice page", () => {
    cy.setSliceMachineUserContext({});
    // cy.createSlice(slice.library, slice.id, slice.name);
    // cy.createCustomType(customType.id, customType.name);
  });

  it("Creates, updates and deletes slices and custom types", () => {
    const menu = new Menu();
    const slicePage = new SlicePage();

    // menu.navigateTo("Changes");

    // cy.pushLocalChanges();

    // // Update CT (add tab)
    // cy.visit(`/cts/${customType.id}`);
    // // add a tab
    // cy.contains("Add Tab").click();
    // cy.getInputByLabel("New Tab ID").type("Foo");
    // cy.get("#create-tab").contains("Save").click();
    // cy.contains("Save to File System").click();

    // // Update Slice (add variation)
    // slicePage.goTo(slice.library, slice.name);
    // cy.get("button").contains("Default").click();
    // cy.contains("+ Add new variation").click();
    // cy.getInputByLabel("Variation name*").type("foo");
    // cy.getInputByLabel("Variation ID*").clear();
    // cy.getInputByLabel("Variation ID*").type("bar");
    // cy.get("#variation-add").submit();
    // slicePage.save();

    // menu.navigateTo("Changes");

    // cy.pushLocalChanges(2);

    // Delete the custom type
    // menu.navigateTo("Custom Types");
    // cy.get("[data-cy='edit-custom-type-menu']").click();
    // cy.contains("Delete").click();
    // cy.get("[aria-modal]");
    // cy.contains("button", "Delete").click();

    // // Delete the slice
    // menu.navigateTo("Slices");
    // cy.get("[data-cy='slice-action-icon']").click();
    // cy.contains("Delete").click();
    // cy.get("[aria-modal]");
    // cy.contains("button", "Delete").click();

    cy.wait(500)

    // menu.navigateTo("Changes");
    cy.visit("/changes");

    // const customTypesWithDocuments = [
    //   {
    //     id: customType.id,
    //     numberOfDocuments: 2000,
    //     url: "url",
    //   },
    // ];

    // mockPushLimit("HARD", customTypesWithDocuments);

    // cy.pushLocalChanges();

    // cy.contains("Manual action required").should("be.visible");
    // cy.get("[data-cy='AssociatedDocumentsCard']")
    //   .contains(customTypesWithDocuments[0].numberOfDocuments);
    // cy.get("[data-cy='AssociatedDocumentsCard']")
    //   .contains(customType.name);

    // mockPushLimit("SOFT", customTypesWithDocuments);

    // cy.contains("button", "Try again").click();
    // cy.contains("Confirm deletion").should("be.visible");
    // cy.get("[data-cy='AssociatedDocumentsCard']")
    //   .contains(customTypesWithDocuments[0].numberOfDocuments);
    // cy.get("[data-cy='AssociatedDocumentsCard']")
    //   .contains(customType.name);

    // cy.contains("button", "Push changes").should("be.disabled");

    // cy.contains("label", "Delete these Documents").click();

    // unmockPushLimit();

    // cy.contains("button", "Push changes").should("be.enabled").click();

    // cy.contains("Up to date").should("be.visible");
    // cy.get("[data-cy=push-changes]").should("be.disabled");

    mockPushError();
    cy.get("[data-cy=push-changes]").click();
    cy.contains("Something went wrong when pushing your changes.");
  });
});
