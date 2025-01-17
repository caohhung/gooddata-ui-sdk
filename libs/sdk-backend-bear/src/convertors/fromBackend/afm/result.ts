// (C) 2020-2022 GoodData Corporation
import { ResultHeaderTransformer } from "@gooddata/sdk-backend-base";
import { IPostProcessing, IResultHeader } from "@gooddata/sdk-model";
import { transformDateFormat } from "../../dateFormatting/dateFormatter";
import { DateFormat } from "../../dateFormatting/dateValueParser";

export function createResultHeaderTransformer(dateAttributeUris?: string[]): ResultHeaderTransformer {
    return (resultHeader: IResultHeader, postProcessing?: IPostProcessing): IResultHeader => {
        return transformDateFormat(resultHeader, dateAttributeUris, postProcessing?.dateFormat as DateFormat);
    };
}
