// (C) 2019-2023 GoodData Corporation
import noop from "lodash/noop";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { PluggableSankeyChart } from "../PluggableSankeyChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import { IBucketOfFun, IVisConstruct } from "../../../../interfaces/Visualization";
import * as testMocks from "../../../../tests/mocks/testMocks";
import { getLastRenderEl } from "../../tests/testHelpers";

describe("PluggableSankeyChart", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = jest.fn();
    const executionFactory = dummyBackend().workspace("project_id").execution();
    const defaultProps: IVisConstruct = {
        projectId: "project_id",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
    };

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    function createComponent(props = defaultProps) {
        return new PluggableSankeyChart(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with one metric, attributeFrom, attributeTo and valid filters", async () => {
        const sankey = createComponent();
        const extendedReferencePoint = await sankey.getExtendedReferencePoint(
            referencePointMocks.metricAndAttributeFromAndTo,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should reuse one measure and order attribute types", async () => {
        const sankey = createComponent();
        const extendedReferencePoint = await sankey.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("sankey should allow date attribute in attribute (from/to)", async () => {
        const sankey = createComponent();
        const extendedReferencePoint = await sankey.getExtendedReferencePoint(
            referencePointMocks.dateAttributeOnStackBucketReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("Arithmetic measures", () => {
        it("should skip measures that cannot be placed together with their operands", async () => {
            const sankey = createComponent();
            const originalRefPoint =
                referencePointMocks.firstMeasureArithmeticAlongWithAttributeReferencePoint;

            const extendedReferencePoint = await sankey.getExtendedReferencePoint(originalRefPoint);

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [originalRefPoint.buckets[0].items[1]],
                },
                {
                    localIdentifier: "attribute_from",
                    items: originalRefPoint.buckets[1].items,
                },
                {
                    localIdentifier: "attribute_to",
                    items: [],
                },
            ];
            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([]);
        });

        it("should remove all derived measures and arithmetic measures created from derived measures", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.mixOfMeasuresWithDerivedAndArithmeticFromDerivedHeatMapReferencePoint,
            );
            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "attribute_from",
                    items: [],
                },
                {
                    localIdentifier: "attribute_to",
                    items: [],
                },
            ]);
        });
    });

    describe("PluggableSankeyChart renderVisualization and renderConfigurationPanel", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update({}, testMocks.insightWithSingleMeasure, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
