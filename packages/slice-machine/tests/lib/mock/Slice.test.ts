import "@testing-library/jest-dom";
import {
  SharedSlice,
  SliceDiff,
} from "@prismicio/types-internal/lib/customtypes";
import {
  GeoPointContent,
  LinkContent,
  SharedSliceContent,
} from "@prismicio/types-internal/lib/content";
import { Slices, SliceSM } from "@slicemachine/core/build/models";
import { isRight } from "fp-ts/lib/Either";
import MockSlice from "../../../lib/mock/Slice";
// import allFieldSliceModel from "../../../tests/__mocks__/sliceModel";

jest.mock("lorem-ipsum", () => {
  return {
    __esModule: true,
    LoremIpsum: jest.fn().mockImplementation(() => {
      return {
        generateParagraphs: jest.fn().mockReturnValue("Some text."),
      };
    }),
  };
});

jest.mock("@prismicio/mocks/lib/generators/utils/slug", () => {
  return jest.fn().mockReturnValue("Woo");
});

describe("MockSlice", () => {
  test("when creating a slice it should return the default mock", () => {
    const wanted = [
      {
        __TYPE__: "SharedSliceContent",
        variation: "default",
        primary: {
          title: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "heading1", content: { text: "Woo" } }],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "paragraph", content: { text: "Some text." } }],
          },
        },
        items: [],
      },
    ];

    const model: SliceSM = {
      id: "some_slice",
      type: "SharedSlice",
      name: "SomeSlice",
      description: "SomeSlice",
      variations: [
        {
          id: "default",
          name: "Default",
          docURL: "...",
          version: "sktwi1xtmkfgx8626",
          description: "SomeSlice",
          primary: [
            {
              key: "title",
              value: {
                type: "StructuredText",
                config: {
                  single: "heading1",
                  label: "Title",
                  placeholder: "This is where it all begins...",
                },
              },
            },
            {
              key: "description",
              value: {
                type: "StructuredText",
                config: {
                  single: "paragraph",
                  label: "Description",
                  placeholder: "A nice description of your product",
                },
              },
            },
          ],
        },
      ],
    };

    const mockConfig = {};

    const result = MockSlice(Slices.fromSM(model), mockConfig);

    expect(result).toEqual(wanted);
    // TODO: check the codec we use for SharedSliceContent[]
    // const decoded = SliceMock.decode(result);
    // expect(isRight(decoded)).toBeTruthy();
    // needs to be readable by core/mocks/models SliceMock
  });

  test("when updating a mock with config", () => {
    // "image" is missing, see below.
    const partial = [
      {
        __TYPE__: "SharedSliceContent",
        variation: "default",
        primary: {
          title: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "heading1", content: { text: "Woo" } }],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "paragraph", content: { text: "Some text." } }],
          },
        },
        items: [{ __TYPE__: "GroupItemContent", value: [] }],
      },
    ];

    const model: SliceSM = {
      id: "some_slice",
      type: "SharedSlice",
      name: "SomeSlice",
      description: "SomeSlice",
      variations: [
        {
          id: "default",
          name: "Default",
          docURL: "...",
          version: "sktwi1xtmkfgx8626",
          description: "SomeSlice",
          primary: [
            {
              key: "title",
              value: {
                type: "StructuredText",
                config: {
                  single: "heading1",
                  label: "Title",
                  placeholder: "This is where it all begins...",
                },
              },
            },
            {
              key: "description",
              value: {
                type: "StructuredText",
                config: {
                  single: "paragraph",
                  label: "Description",
                  placeholder: "A nice description of your product",
                },
              },
            },
            {
              key: "image",
              value: {
                config: { label: "image", constraint: {}, thumbnails: [] },
                type: "Image",
              },
            },
          ],
          items: [],
        },
      ],
    };

    const mockConfig = {
      default: {
        primary: {},
      },
    };

    const result = MockSlice(Slices.fromSM(model), mockConfig);
    // "result" contains more than "partial"
    expect(result).toMatchObject(partial);
    // The image is random, so we check its properties instead.
    expect(result[0].primary).toHaveProperty(
      "image",
      expect.objectContaining({
        __TYPE__: "ImageContent",
        url: expect.any(String),
        origin: {
          id: "main",
          url: expect.any(String),
          width: expect.any(Number),
          height: expect.any(Number),
        },
        width: expect.any(Number),
        height: expect.any(Number),
        edit: { zoom: 1, crop: { x: 0, y: 0 }, background: "transparent" },
        thumbnails: {},
      })
    );
    // TODO: check with the mock reader that this is valid
    // const decoded = SliceMock.decode(result);
    // expect(isRight(decoded)).toBeTruthy();
  });

  // change slice mock to the codec for SharedSliceContent[]
  // test.skip("allFieldSliceModel", () => {
  //   const model = Slices.toSM({ ...allFieldSliceModel });
  //   const mock = MockSlice(model, {});
  //
  //   const result = SliceMock.decode(mock);
  //   expect(isRight(result)).toBeTruthy();
  // });

  test("when i add a variation to a slice it should the old mock content should be kept", () => {
    const sliceModel: SharedSlice = {
      id: "testing",
      type: "SharedSlice",
      name: "Testing",
      description: "Testing",
      variations: [
        {
          id: "default",
          name: "Default",
          docURL: "...",
          version: "sktwi1xtmkfgx8626",
          description: "Testing",
          primary: {
            title: {
              type: "StructuredText",
              config: {
                single: "heading1",
                label: "Title",
                placeholder: "This is where it all begins...",
              },
            },
            description: {
              type: "StructuredText",
              config: {
                single: "paragraph",
                label: "Description",
                placeholder: "A nice description of your feature",
              },
            },
          },
          items: {},
          imageUrl:
            "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
        },
        {
          id: "foo",
          name: "Foo",
          docURL: "...",
          version: "sktwi1xtmkfgx8626",
          description: "Testing",
          primary: {
            title: {
              type: "StructuredText",
              config: {
                single: "heading1",
                label: "Title",
                placeholder: "This is where it all begins...",
              },
            },
            description: {
              type: "StructuredText",
              config: {
                single: "paragraph",
                label: "Description",
                placeholder: "A nice description of your feature",
              },
            },
          },
          items: {},
          imageUrl:
            "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
        },
      ],
    };
    const legacyMockConfig = {};
    const previousMocks: SharedSliceContent[] = [
      {
        __TYPE__: "SharedSliceContent",
        variation: "default",
        primary: {
          title: {
            __TYPE__: "StructuredTextContent",
            value: [
              {
                type: "heading1",
                content: {
                  text: "Test Heading",
                  // "spans": []
                },
                // "direction": "ltr"
              },
            ],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [
              {
                type: "paragraph",
                content: {
                  text: "Some text on the default slice.",
                },
              },
            ],
          },
        },
        items: [
          {
            __TYPE__: "GroupItemContent",
            value: [],
          },
        ],
      },
    ];
    const sliceDiff: SliceDiff = {
      op: "updated",
      value: {
        variations: {
          foo: {
            op: "added",
            value: {
              id: "foo",
              name: "Foo",
              docURL: "...",
              version: "sktwi1xtmkfgx8626",
              description: "Testing",
              primary: {
                title: {
                  type: "StructuredText",
                  config: {
                    single: "heading1",
                    label: "Title",
                    placeholder: "This is where it all begins...",
                  },
                },
                description: {
                  type: "StructuredText",
                  config: {
                    single: "paragraph",
                    label: "Description",
                    placeholder: "A nice description of your feature",
                  },
                },
              },
              items: {},
              imageUrl:
                "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            },
          },
        },
      },
    };

    const wanted = [
      ...previousMocks,
      {
        __TYPE__: "SharedSliceContent",
        variation: "foo",
        primary: {
          title: {
            __TYPE__: "StructuredTextContent",
            value: [
              {
                type: "heading1",
                content: {
                  text: "Woo",
                },
                // direction: "ltr",
              },
            ],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [
              {
                type: "paragraph",
                content: {
                  text: "Some text.",
                },
              },
            ],
          },
        },
        items: [
          {
            __TYPE__: "GroupItemContent",
            value: [],
          },
        ],
      },
    ];

    const results = MockSlice(
      sliceModel,
      legacyMockConfig,
      previousMocks,
      sliceDiff
    );

    // check the content is unchanged
    expect(results[0]).toEqual(previousMocks[0]);
    expect(results).toEqual(wanted);
  });
});
