// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import merge from "lodash/merge";
import { IAnalyticalBackend, IFilterContext, ITempFilterContext, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter, IInsight, insightProperties, insightSetProperties } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IAvailableDrillTargetAttribute,
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    ILocale,
    IntlWrapper,
    IPushData,
    OnError,
    OnFiredDrillEvent,
    OnLoadingChanged,
    useBackend,
    useCancelablePromise,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { InsightRenderer as InsightRendererImpl } from "../../../insightView/InsightRenderer";
import { InsightError } from "../../../insightView/InsightError";
import { widgetDrillsToDrillPredicates, insightDrillDownPredicates } from "./drillingUtils";
import { filterContextToFiltersForWidget } from "../converters";
import { addImplicitAllTimeFilter } from "./utils";
import { useDashboardViewConfig } from "./DashboardViewConfigContext";
import { useUserWorkspaceSettings } from "./UserWorkspaceSettingsContext";
import { useColorPalette } from "./ColorPaletteContext";
import { useAttributesWithDrillDown } from "./AttributesWithDrillDownContext";

interface IInsightRendererProps {
    insightWidget: IWidget;
    insight: IInsight;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    onError?: OnError;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
}

export const InsightRenderer: React.FC<IInsightRendererProps> = ({
    insightWidget,
    insight,
    filters,
    filterContext,
    drillableItems = [],
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent,
    LoadingComponent,
}) => {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);
    const dashboardViewConfig = useDashboardViewConfig();
    const userWorkspaceSettings = useUserWorkspaceSettings();
    const colorPalette = useColorPalette();
    const attributesWithDrillDown = useAttributesWithDrillDown();
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [possibleDrills, setPossibleDrills] = useState<IAvailableDrillTargetAttribute[]>([]);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | null>(null);

    const handleLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading !== isVisualizationLoading) {
                setIsVisualizationLoading(isLoading);
            }
        },
        [isVisualizationLoading],
    );

    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            onError?.(error);
        },
        [onError],
    );

    const inputFilters = useMemo(() => {
        const filtersFromFilterContext = filterContextToFiltersForWidget(filterContext, insightWidget);
        return [...filtersFromFilterContext, ...(filters ?? [])];
    }, [filters, filterContext, insightWidget]);

    const { error, result: insightWithFilters, status } = useCancelablePromise(
        {
            promise: async () => {
                const resolvedFilters = await effectiveBackend
                    .workspace(effectiveWorkspace)
                    .dashboards()
                    .getResolvedFiltersForWidget(insightWidget, inputFilters);

                const resolvedWithImplicitAllTime = addImplicitAllTimeFilter(insightWidget, resolvedFilters);

                return effectiveBackend
                    .workspace(effectiveWorkspace)
                    .insights()
                    .getInsightWithAddedFilters(insight, resolvedWithImplicitAllTime);
            },
            onError,
        },
        [effectiveBackend, effectiveWorkspace, insightWidget, inputFilters],
    );

    const insightWithAddedWidgetProperties = useMemo(() => {
        if (!insightWithFilters) {
            return insightWithFilters;
        }

        const fromWidget = insightWidget.properties;
        if (!fromWidget) {
            return insightWithFilters;
        }

        const fromWidgetWithZoomingHandled = {
            ...fromWidget,
            controls: {
                ...fromWidget?.controls,
                // we need to take the relevant feature flag into account as well
                zoomInsight: !!(userWorkspaceSettings.enableKDZooming && fromWidget?.controls?.zoomInsight),
            },
        };

        const fromInsight = insightProperties(insightWithFilters);
        const merged = merge({}, fromInsight, fromWidgetWithZoomingHandled);

        return insightSetProperties(insightWithFilters, merged);
    }, [insightWithFilters, insightWidget.properties, userWorkspaceSettings]);

    const effectiveDrillableItems: Array<IDrillableItem | IHeaderPredicate> = useMemo(() => {
        const drillsFromWidget = widgetDrillsToDrillPredicates(insightWidget.drills);
        const drillsFromDrillDown = insightDrillDownPredicates(possibleDrills, attributesWithDrillDown);
        return [
            ...drillsFromWidget, // drills specified in the widget definition
            ...drillableItems, // drills specified by the caller
            ...drillsFromDrillDown, // drills from drill downs specified on attributes
        ];
    }, [insightWidget.drills, drillableItems, possibleDrills, attributesWithDrillDown]);

    const handlePushData = useCallback((data: IPushData): void => {
        if (data.availableDrillTargets?.attributes) {
            setPossibleDrills(data.availableDrillTargets.attributes);
        }
    }, []);

    const chartConfig = useMemo(
        () => ({
            mapboxToken: dashboardViewConfig?.mapboxToken,
            separators: dashboardViewConfig?.separators,
        }),
        [dashboardViewConfig],
    );

    // we need sdk-ui intl wrapper (this is how InsightView does this as well) for error messages etc.
    // ideally, we would merge InternalIntlWrapper and sdk-ui intl wrapper, but there is no clean way to do that
    const locale = dashboardViewConfig?.locale ?? userWorkspaceSettings?.locale;
    return (
        <IntlWrapper locale={locale}>
            {(status === "loading" || status === "pending" || isVisualizationLoading) && <LoadingComponent />}
            {(error || visualizationError) && (
                <InsightError
                    error={error || visualizationError}
                    ErrorComponent={ErrorComponent}
                    height={null} // make sure the error is aligned to the top (this is the behavior in gdc-dashboards)
                />
            )}
            <InsightRendererImpl
                insight={insightWithAddedWidgetProperties}
                backend={effectiveBackend}
                workspace={effectiveWorkspace}
                drillableItems={effectiveDrillableItems}
                onDrill={onDrill}
                config={chartConfig}
                onLoadingChanged={handleLoadingChanged}
                locale={dashboardViewConfig.locale ?? (userWorkspaceSettings.locale as ILocale)}
                settings={userWorkspaceSettings}
                colorPalette={colorPalette}
                onError={handleError}
                pushData={handlePushData}
                ErrorComponent={ErrorComponent}
                LoadingComponent={LoadingComponent}
            />
        </IntlWrapper>
    );
};
