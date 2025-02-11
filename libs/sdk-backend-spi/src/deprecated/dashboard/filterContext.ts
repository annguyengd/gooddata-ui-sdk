// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";
import { DateFilterRelativeType, DateFilterAbsoluteType } from "@gooddata/sdk-model";

/**
 * Date filter type - relative
 * @deprecated Use {@link @gooddata/sdk-model#DateFilterRelativeType}
 * @alpha
 */
export type RelativeType = DateFilterRelativeType;

/**
 * Date filter type - absolute
 * @deprecated Use {@link @gooddata/sdk-model#DateFilterAbsoluteType}
 * @alpha
 */
export type AbsoluteType = DateFilterAbsoluteType;
/**
 * Date filter type - relative or absolute
 * @deprecated Use {@link @gooddata/sdk-model#DateFilterType}
 * @alpha
 */
export type DateFilterType = m.DateFilterType;

/**
 * Parent filter of an attribute filter of the filter context
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardAttributeFilterParent}
 * @alpha
 */
export interface IDashboardAttributeFilterParent extends m.IDashboardAttributeFilterParent {}

/**
 * Attribute filter of the filter context
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardAttributeFilter}
 * @alpha
 */
export interface IDashboardAttributeFilter extends m.IDashboardAttributeFilter {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttributeFilter}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardAttributeFilter}
 * @alpha
 */
export const isDashboardAttributeFilter = m.isDashboardAttributeFilter;

/**
 * Date filter of the filter context
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardDateFilter}
 * @alpha
 */
export interface IDashboardDateFilter extends m.IDashboardDateFilter {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardDateFilter}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardDateFilter}
 * @alpha
 */
export const isDashboardDateFilter = m.isDashboardDateFilter;

/**
 * Creates a new relative dashboard date filter.
 * @param granularity - granularity of the filters (month, year, etc.)
 * @param from - start of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @param to - end of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @deprecated Use {@link @gooddata/sdk-model#newRelativeDashboardDateFilter}
 * @alpha
 */
export const newRelativeDashboardDateFilter = m.newRelativeDashboardDateFilter;

/**
 * Creates a new absolute dashboard date filter.
 * @param from - start of the interval in ISO-8601 calendar date format
 * @param to - end of the interval in ISO-8601 calendar date format
 * @deprecated Use {@link @gooddata/sdk-model#newAbsoluteDashboardDateFilter}
 * @alpha
 */
export const newAbsoluteDashboardDateFilter = m.newAbsoluteDashboardDateFilter;

/**
 * Creates a new all time date filter. This filter is used to indicate that there should be no filtering on the dates.
 * @deprecated Use {@link @gooddata/sdk-model#newAllTimeDashboardDateFilter}
 * @alpha
 */
export const newAllTimeDashboardDateFilter = m.newAllTimeDashboardDateFilter;

/**
 * Type-guard testing whether the provided object is an All time dashboard date filter.
 * @deprecated Use {@link @gooddata/sdk-model#isAllTimeDashboardDateFilter}
 * @alpha
 */
export const isAllTimeDashboardDateFilter = m.isAllTimeDashboardDateFilter;

/**
 * Supported filter context items
 * @deprecated Use {@link @gooddata/sdk-model#FilterContextItem}
 * @alpha
 */
export type FilterContextItem = m.FilterContextItem;

/**
 * Common filter context properties
 * @deprecated Use {@link @gooddata/sdk-model#IFilterContextBase}
 * @alpha
 */
export interface IFilterContextBase extends m.IFilterContextBase {}

/**
 * Filter context definition represents modifier or created filter context
 * @deprecated Use {@link @gooddata/sdk-model#IFilterContextDefinition}
 * @alpha
 */
export interface IFilterContextDefinition extends m.IFilterContextDefinition {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFilterContextDefinition}.
 * @deprecated Use {@link @gooddata/sdk-model#isFilterContextDefinition}
 * @alpha
 */
export const isFilterContextDefinition = m.isFilterContextDefinition;

/**
 * Filter context consists of configured attribute and date filters
 * (which could be applied to the dashboard, widget alert, or scheduled email)
 * @deprecated Use {@link @gooddata/sdk-model#IFilterContext}
 * @alpha
 */
export interface IFilterContext extends m.IFilterContext {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFilterContext}.
 * @deprecated Use {@link @gooddata/sdk-model#isFilterContext}
 * @alpha
 */
export const isFilterContext = m.isFilterContext;

/**
 * Temporary filter context serves to override original dashboard filter context during the dashboard export
 * @deprecated Use {@link @gooddata/sdk-model#ITempFilterContext}
 * @alpha
 */
export interface ITempFilterContext extends m.ITempFilterContext {}

/**
 * Type-guard testing whether the provided object is an instance of {@link ITempFilterContext}.
 * @deprecated Use {@link @gooddata/sdk-model#isTempFilterContext}
 * @alpha
 */
export const isTempFilterContext = m.isTempFilterContext;

/**
 * Reference to a particular dashboard date filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardDateFilterReference}
 * @alpha
 */
export interface IDashboardDateFilterReference extends m.IDashboardDateFilterReference {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardDateFilterReference}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardDateFilterReference}
 * @alpha
 */
export const isDashboardDateFilterReference = m.isDashboardDateFilterReference;

/**
 * Reference to a particular dashboard attribute filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardAttributeFilterReference}
 * @alpha
 */
export interface IDashboardAttributeFilterReference extends m.IDashboardAttributeFilterReference {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttributeFilterReference}.
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardAttributeFilterReference}
 * @alpha
 */
export const isDashboardAttributeFilterReference = m.isDashboardAttributeFilterReference;

/**
 * Reference to a particular dashboard filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardFilterReference}
 * @alpha
 */
export type IDashboardFilterReference = m.IDashboardFilterReference;

/**
 * Gets reference to object being used for filtering. For attribute filters, this will be reference to the display
 * form. For date filters this will be reference to the data set.
 * @deprecated Use {@link @gooddata/sdk-model#dashboardFilterReferenceObjRef}
 * @alpha
 */
export const dashboardFilterReferenceObjRef = m.dashboardFilterReferenceObjRef;
