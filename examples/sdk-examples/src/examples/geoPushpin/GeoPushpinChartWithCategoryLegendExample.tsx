// (C) 2020-2022 GoodData Corporation
import React from "react";
import { CenterPositionChangedCallback, GeoPushpinChart, ZoomChangedCallback } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { locationAttribute, sizeMeasure, colorMeasure, segmentByAttribute } from "../../md/geoModel";
import noop from "lodash/noop";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";

export const GeoPushpinChartWithCategoryLegendExample: React.FC = () => {
    const onLoadingChanged: OnLoadingChanged = (_params) => {
        // handle the callback here
        return noop;
    };

    const onError: OnError = (_params) => {
        // handle the callback here
        return noop;
    };

    const onZoomChanged: ZoomChangedCallback = (_params) => {
        // handle the callback here
        return noop;
    };

    const onCenterPositionChanged: CenterPositionChangedCallback = (_params) => {
        // handle the callback here
        return noop;
    };

    return (
        <div style={{ height: "500px", position: "relative" }} className="s-geo-pushpin-chart-category">
            <GeoPushpinChart
                location={locationAttribute}
                size={sizeMeasure}
                color={colorMeasure}
                segmentBy={segmentByAttribute}
                config={{
                    mapboxToken: MAPBOX_TOKEN,
                }}
                onZoomChanged={onZoomChanged}
                onCenterPositionChanged={onCenterPositionChanged}
                onLoadingChanged={onLoadingChanged}
                onError={onError}
            />
        </div>
    );
};

export default GeoPushpinChartWithCategoryLegendExample;
