// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import partition from "lodash/partition";
import {
    objRefToString,
    isDashboardDateFilter,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterTitle,
    selectFilterContextFilters,
    selectIsExport,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { DashboardDateFilter, HiddenDashboardDateFilter } from "../dateFilter";
import { IDashboardDateFilterConfig, IFilterBarProps } from "../types";

import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer";
import { HiddenFilterBar } from "./HiddenFilterBar";

/**
 * @alpha
 */
export const useFilterBarProps = (): IFilterBarProps => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (filter: IDashboardAttributeFilter) => {
            const { attributeElements, negativeSelection, localIdentifier } = filter.attributeFilter;
            dispatch(
                changeAttributeFilterSelection(
                    localIdentifier!,
                    attributeElements,
                    negativeSelection ? "NOT_IN" : "IN",
                ),
            );
        },
        [dispatch],
    );

    const onDateFilterChanged = useCallback(
        (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => {
            if (!filter) {
                // all time filter
                dispatch(clearDateFilterSelection());
            } else {
                const { type, granularity, from, to } = filter.dateFilter;
                dispatch(changeDateFilterSelection(type, granularity, from, to, dateFilterOptionLocalId));
            }
        },
        [dispatch],
    );

    return { filters, onAttributeFilterChanged, onDateFilterChanged, DefaultFilterBar };
};

/**
 * @alpha
 */
export function DefaultFilterBar(props: IFilterBarProps): JSX.Element {
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = props;
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const isExport = useDashboardSelector(selectIsExport);
    const { DashboardAttributeFilterComponentProvider } = useDashboardComponentsContext();

    if (isExport) {
        return <HiddenFilterBar {...props} />;
    }

    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);

    const dateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
        customFilterName,
    };

    return (
        <DefaultFilterBarContainer>
            <div className="dash-filters-date dash-filters-attribute">
                {dateFilterMode === "hidden" ? (
                    <HiddenDashboardDateFilter />
                ) : (
                    <DashboardDateFilter
                        filter={dateFilter}
                        onFilterChanged={onDateFilterChanged}
                        config={dateFilterComponentConfig}
                        readonly={dateFilterMode === "readonly"}
                    />
                )}
            </div>
            {attributeFilters.map((filter) => {
                const AttributeFilter = DashboardAttributeFilterComponentProvider(filter);

                return (
                    <div
                        className="dash-filters-notdate dash-filters-attribute"
                        key={objRefToString(filter.attributeFilter.displayForm)}
                    >
                        <AttributeFilter filter={filter} onFilterChanged={onAttributeFilterChanged} />
                    </div>
                );
            })}
        </DefaultFilterBarContainer>
    );
}
