// (C) 2019-2022 GoodData Corporation
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    IColorMappingItem,
    IDimension,
    IInsight,
    IInsightDefinition,
    insightHasMeasures,
    insightMeasures,
    ISortItem,
    ISettings,
} from "@gooddata/sdk-model";
import { BucketNames, ChartType, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    BaseChart,
    ColorUtils,
    IAxisConfig,
    IChartConfig,
    IColorMapping,
    updateConfigWithSettings,
} from "@gooddata/sdk-ui-charts";
import React from "react";
import { render } from "react-dom";
import compact from "lodash/compact";

import { BUCKETS } from "../../../constants/bucket";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties";
import { BASE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { DEFAULT_BASE_CHART_UICONFIG, MAX_CATEGORIES_COUNT } from "../../../constants/uiConfig";
import { AxisType } from "../../../interfaces/AxisType";
import { IColorConfiguration } from "../../../interfaces/Colors";
import {
    IBucketItem,
    IBucketOfFun,
    IDrillDownContext,
    IExtendedReferencePoint,
    InvalidBucketsSdkError,
    IReferencePoint,
    IReferences,
    IUiConfig,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";
import { IAvailableSortsGroup } from "../../../interfaces/SortConfig";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getFilteredMeasuresForStackedCharts,
    getMeasureItems,
    getStackItems,
    isNotDateBucketItem,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import { getValidProperties } from "../../../utils/colors";
import { generateDimensions } from "../../../utils/dimensions";
import { unmountComponentsAtNodes } from "../../../utils/domHelper";
import {
    getReferencePointWithSupportedProperties,
    getSupportedPropertiesControls,
    hasColorMapping,
    isEmptyObject,
    getChartSupportedControls,
    getChartSupportedControlsDashboardsEnv,
} from "../../../utils/propertiesHelper";
import { createSorts, removeSort, validateCurrentSort } from "../../../utils/sort";
import { getTranslation } from "../../../utils/translations";

import {
    setBaseChartUiConfig,
    setBaseChartUiConfigRecommendations,
} from "../../../utils/uiConfigHelpers/baseChartUiConfigHelper";
import { isOpenAsReportSupportedByVisualization } from "../../../utils/visualizationsHelper";

import BaseChartConfigurationPanel from "../../configurationPanels/BaseChartConfigurationPanel";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import set from "lodash/set";
import tail from "lodash/tail";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil";

export class PluggableBaseChart extends AbstractPluggableVisualization {
    protected projectId: string;
    protected type: ChartType;
    protected featureFlags: ISettings;
    protected defaultControlsProperties: IVisualizationProperties;
    protected customControlsProperties: IVisualizationProperties;
    protected colors: IColorConfiguration;
    protected references: IReferences;
    protected ignoreUndoRedo: boolean;
    protected axis: string;
    protected secondaryAxis: AxisType;
    protected environment: string;
    protected readonly renderFun: (component: any, target: Element) => void;

    constructor(props: IVisConstruct) {
        super(props);

        this.projectId = props.projectId;
        this.environment = props.environment;
        this.type = VisualizationTypes.COLUMN;
        this.featureFlags = props.featureFlags ? props.featureFlags : {};
        this.ignoreUndoRedo = false;
        this.defaultControlsProperties = {};
        this.setCustomControlsProperties({});
        this.renderFun = props.renderFun;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public unmount(): void {
        unmountComponentsAtNodes([this.element, this.configPanelElement]);
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep(DEFAULT_BASE_CHART_UICONFIG);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const uiConfig = this.getUiConfig();
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig,
        };

        this.configureBuckets(newReferencePoint);

        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = setBaseChartUiConfigRecommendations(
            newReferencePoint,
            this.type,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = setBaseChartUiConfig(newReferencePoint, this.intl, this.type);
        if (!this.featureFlags.enableChartsSorting) {
            newReferencePoint = removeSort(newReferencePoint);
        }

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const intersection = drillDownContext.event.drillContext.intersection;
        const withFilters = addIntersectionFiltersToInsight(source, intersection);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public isOpenAsReportSupported(): boolean {
        return isOpenAsReportSupportedByVisualization(this.type);
    }

    public setCustomControlsProperties(customControlsProperties: IVisualizationProperties): void {
        this.customControlsProperties = customControlsProperties;
    }

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat, executionConfig } = options;
        const supportedControls: IVisualizationProperties = this.getSupportedControls(insight, options);

        return executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(
                ...createSorts(
                    this.type,
                    insight,
                    canSortStackTotalValue(insight, supportedControls),
                    this.featureFlags.enableChartsSorting,
                ),
            )
            .withDateFormat(dateFormat)
            .withExecConfig(executionConfig);
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const buckets = extendedReferencePoint?.buckets ?? [];
        const categoriesCount =
            extendedReferencePoint?.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT;

        set(extendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: getFilteredMeasuresForStackedCharts(buckets),
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: getAttributeItemsWithoutStacks(buckets).slice(0, categoriesCount),
            },
            {
                localIdentifier: BucketNames.STACK,
                items: this.getStackItems(buckets),
            },
        ]);
    }

    protected getSupportedPropertiesList(): string[] {
        return BASE_CHART_SUPPORTED_PROPERTIES;
    }

    protected getStackItems(buckets: IBucketOfFun[]): IBucketItem[] {
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);

        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.LOCATION,
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.STACK,
            BucketNames.SEGMENT,
        ]);
        let stacks = getStackItems(buckets);

        if (masterMeasures.length <= 1 && allAttributes.length > 1) {
            // first attribute is taken, find next available non-date attribute
            const attributesWithoutFirst = tail(allAttributes);
            const nonDate = attributesWithoutFirst.filter(isNotDateBucketItem);
            stacks = nonDate.slice(0, 1);
        }

        return stacks;
    }

    protected checkBeforeRender(insight: IInsightDefinition): boolean {
        super.checkBeforeRender(insight);

        if (!insightHasMeasures(insight)) {
            throw new InvalidBucketsSdkError();
        }

        return true;
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { dimensions = { height: undefined }, custom = {}, locale, theme } = options;
        const { height } = dimensions;

        // keep height undef for AD; causes indigo-visualizations to pick default 100%
        const resultingHeight = this.environment === DASHBOARDS_ENVIRONMENT ? height : undefined;
        const { drillableItems } = custom;
        const supportedControls: IVisualizationProperties = this.getSupportedControls(insight, options);
        const configSupportedControls = isEmpty(supportedControls) ? null : supportedControls;
        const fullConfig = this.buildVisualizationConfig(options, configSupportedControls);
        const execution = this.getExecution(options, insight, executionFactory);

        this.renderFun(
            <BaseChart
                execution={execution}
                afterRender={this.afterRender}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                onError={this.onError}
                onExportReady={this.onExportReady}
                onLoadingChanged={this.onLoadingChanged}
                pushData={this.handlePushData}
                height={resultingHeight}
                type={this.type}
                locale={locale}
                config={updateConfigWithSettings(fullConfig, this.featureFlags)}
                LoadingComponent={null}
                ErrorComponent={null}
                theme={theme}
            />,
            document.querySelector(this.element),
        );
    }

    protected initializeProperties(visualizationProperties: IVisualizationProperties): void {
        const controls = visualizationProperties?.controls;

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: { controls: supportedProperties },
        };

        this.pushData({
            initialProperties,
        });
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <BaseChartConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    protected getDimensions(insight: IInsightDefinition): IDimension[] {
        return generateDimensions(insight, this.type);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected handleConfirmedColorMapping(data: any): void {
        const resultingData = data;
        this.colors = data.colors;

        if (isEmptyObject(this.references)) {
            resultingData.references = {};
        } else if (this.references) {
            resultingData.references = this.references;
        }

        if (this.visualizationProperties) {
            resultingData.properties = getValidProperties(
                this.visualizationProperties,
                data.colors.colorAssignments,
            );

            this.visualizationProperties = resultingData.properties;
        }

        this.renderConfigurationPanel(this.currentInsight);

        const openAsReportConfig = this.getOpenAsReportConfig(resultingData.properties);

        if (this.ignoreUndoRedo) {
            this.ignoreUndoRedo = false;
            this.pushData(resultingData);
        } else {
            this.pushData({
                openAsReport: openAsReportConfig,
                ignoreUndoRedo: true,
                ...resultingData,
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected handlePushData = (data: any): void => {
        const resultingData = data;
        if (data.colors) {
            this.handleConfirmedColorMapping(data);
        } else {
            this.pushData({
                ...resultingData,
                references: this.references,
            });
        }
    };

    protected buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IChartConfig {
        const { config = {}, customVisualizationConfig = {} } = options;
        const colorMapping: IColorMappingItem[] = supportedControls?.colorMapping;

        const validColorMapping = compact(colorMapping).map(
            (mapItem): IColorMapping => ({
                predicate: ColorUtils.getColorMappingPredicate(mapItem.id),
                color: mapItem.color,
            }),
        );

        return {
            separators: config.separators,
            colorPalette: config.colorPalette,
            forceDisableDrillOnAxes: config.forceDisableDrillOnAxes,
            ...supportedControls,
            colorMapping: validColorMapping?.length > 0 ? validColorMapping : null,
            ...customVisualizationConfig,
        };
    }

    private getOpenAsReportConfig(properties: IVisualizationProperties) {
        const hasMapping = hasColorMapping(properties);
        const isSupported = this.isOpenAsReportSupported();

        const warningMessage = hasMapping ? getTranslation("export_unsupported.colors", this.intl) : "";

        return {
            supported: isSupported && !hasMapping,
            warningMessage,
        };
    }

    private getSupportedControls(insight: IInsightDefinition, options: IVisProps) {
        const defaultControls = getSupportedPropertiesControls(
            this.defaultControlsProperties,
            this.supportedPropertiesList,
        );
        const customControls = getSupportedPropertiesControls(
            this.customControlsProperties,
            this.supportedPropertiesList,
        );
        const supportedControls =
            this.environment === DASHBOARDS_ENVIRONMENT
                ? getChartSupportedControlsDashboardsEnv(
                      this.visualizationProperties?.controls,
                      options,
                      this.featureFlags,
                  )
                : getChartSupportedControls(
                      this.visualizationProperties?.controls,
                      insight,
                      this.featureFlags,
                  );

        return {
            ...defaultControls,
            ...supportedControls,
            ...customControls,
        };
    }

    protected isMultipleDatesEnabled(): boolean {
        //this is development FF and will be removed in the end of dev cycle
        return !!this.featureFlags["enableMultipleDates"];
    }

    protected reuseCurrentSort(
        previousAvailableSorts: IAvailableSortsGroup[],
        properties: IVisualizationProperties,
        availableSorts: IAvailableSortsGroup[],
        defaultSort: ISortItem[],
    ) {
        const previousSort = properties?.sortItems;
        return validateCurrentSort(previousAvailableSorts, previousSort, availableSorts, defaultSort);
    }
}

function areAllMeasuresOnSingleAxis(insight: IInsightDefinition, secondaryYAxis: IAxisConfig): boolean {
    const measureCount = insightMeasures(insight).length;
    const numberOfMeasureOnSecondaryAxis = secondaryYAxis.measures?.length ?? 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

function canSortStackTotalValue(
    insight: IInsightDefinition,
    supportedControls: IVisualizationProperties,
): boolean {
    const stackMeasures = supportedControls?.stackMeasures ?? false;
    const secondaryAxis: IAxisConfig = supportedControls?.secondary_yaxis ?? { measures: [] };
    const allMeasuresOnSingleAxis = areAllMeasuresOnSingleAxis(insight, secondaryAxis);

    return stackMeasures && allMeasuresOnSingleAxis;
}
