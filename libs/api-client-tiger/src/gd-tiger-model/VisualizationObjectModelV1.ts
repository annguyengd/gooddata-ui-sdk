// (C) 2019-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IBucket, IFilter, ISortItem, VisualizationProperties } from "@gooddata/sdk-model";
import {
    LocalIdentifier,
    MeasureDefinition,
    ObjectIdentifier,
    SortKeyAttribute,
    SortKeyValue,
} from "../generated/afm-rest-api";

export namespace VisualizationObjectModelV1 {
    /**
     * Visualization object used to store its data as a metadata object
     *
     * @deprecated use {@link VisualizationObjectModelV2.IVisualizationObject} instead
     */
    export interface IVisualizationObject {
        visualizationObject: {
            title: string;
            visualizationUrl: string;
            buckets: IBucket[];
            filters: IFilter[];
            sorts: ISortItem[];
            properties: VisualizationProperties;
        };
    }

    /**
     * Attribute format used in executions
     *
     * @deprecated use {@link VisualizationObjectModelV2.IAttribute} instead
     */
    export interface IAttribute {
        localIdentifier: Identifier;
        displayForm: ObjectIdentifier;
        alias?: string;
    }

    /**
     * Measure format used in executions
     *
     * @deprecated use {@link VisualizationObjectModelV2.IMeasure} instead
     */
    export interface IMeasure {
        localIdentifier: Identifier;
        definition: MeasureDefinition;
        alias?: string;
        format?: string;
    }

    /**
     * Dimension format used in executions
     *
     * @deprecated use {@link VisualizationObjectModelV2.IDimension} instead
     */
    export interface IDimension {
        localIdentifier: string;
        itemIdentifiers: Identifier[];
        sorting?: SortKey[];
        totals?: ITotalItem[];
    }

    /**
     * Total format used in executions
     *
     * @deprecated use {@link VisualizationObjectModelV2.ITotalItem} instead
     */
    export interface ITotalItem {
        measureIdentifier: LocalIdentifier;
        type: TotalType;
        attributeIdentifier: LocalIdentifier;
    }

    type SortKey = SortKeyAttribute | SortKeyValue;

    type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

    type Identifier = string;

    export function isVisualizationObject(
        visualizationObject: unknown,
    ): visualizationObject is IVisualizationObject {
        return (
            !isEmpty(visualizationObject) &&
            !!(visualizationObject as IVisualizationObject).visualizationObject
        );
    }
}
