// (C) 2020 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { storiesOf } from "../../_infra/storyRepository";
import React, { Component } from "react";
import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend";
import { StoriesForEndToEndTests } from "../../_infra/storyGroups";

const backend = StorybookBackend();
const measures = [ReferenceMd.Amount, ReferenceMd.Won];
const attributes = [ReferenceMd.Product.Name, ReferenceMd.Department];
const columns = [ReferenceMd.ForecastCategory, ReferenceMd.Region];

class PivotTableSizing extends Component {
    public render() {
        return (
            <div
                style={{ width: 600, height: 300, marginTop: 20, resize: "both", overflow: "auto" }}
                className="s-pivot-table-sizing"
            >
                <PivotTable
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    config={{
                        columnSizing: {
                            defaultWidth: "autoresizeAll",
                            growToFit: true,
                        },
                    }}
                />
            </div>
        );
    }
}

storiesOf(`${StoriesForEndToEndTests}/Pivot Table`).add(
    "complex table with multiple columns and with sizing",
    () => <PivotTableSizing />,
);
