// (C) 2023 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import ConfigurationPanelContent from "./ConfigurationPanelContent";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble";
import { messages } from "../../../locales";
import DataLabelsControl from "../configurationControls/DataLabelsControl";
import ConfigSection from "../configurationControls/ConfigSection";
import LegendSection from "../configurationControls/legend/LegendSection";

export default class SankeyChartConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): React.ReactNode {
        const bubbleClassNames = cx("bubble-primary", { invisible: !this.isControlDisabled() });

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.renderLegendSection()}
                    {this.renderCanvasSection()}
                </div>
                <Bubble
                    className={bubbleClassNames}
                    arrowOffsets={{ "tc bc": [BUBBLE_ARROW_OFFSET_X, BUBBLE_ARROW_OFFSET_Y] }}
                    alignPoints={[{ align: "tc bc" }]}
                >
                    <FormattedMessage id="properties.config.not_applicable" />
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    private renderCanvasSection() {
        const { propertiesMeta, properties, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <ConfigSection
                id="canvas_section"
                title={messages.canvasTitle.id}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <DataLabelsControl
                    pushData={pushData}
                    properties={properties}
                    isDisabled={controlsDisabled}
                />
            </ConfigSection>
        );
    }

    protected renderLegendSection(): React.ReactNode {
        const { properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <LegendSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                controlsDisabled={controlsDisabled}
                defaultLegendEnabled={false}
                pushData={pushData}
            />
        );
    }
}
