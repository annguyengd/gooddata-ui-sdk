// (C) 2021 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine, IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import isEmpty from "lodash/isEmpty";
import {
    noopDashboardCommonLoader,
    noopDashboardPluginLoader,
    staticDashboardEngineLoader,
} from "./staticComponentLoaders";
import {
    dynamicDashboardCommonLoader,
    dynamicDashboardEngineLoader,
    dynamicDashboardPluginLoader,
} from "./dynamicComponentLoaders";
import { ModuleFederationIntegration } from "../types";

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use the
 * dynamic loading to get the engine. Otherwise will use the static loading.
 *
 * @param dashboard - loaded dashboard
 * @internal
 */
export function adaptiveDashboardEngineLoader(
    dashboard: IDashboardWithReferences,
    moduleFederationIntegration: ModuleFederationIntegration,
): Promise<IDashboardEngine> {
    if (!isEmpty(dashboard.references.plugins)) {
        return dynamicDashboardEngineLoader(dashboard, moduleFederationIntegration);
    }

    return staticDashboardEngineLoader(dashboard);
}

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use
 * the dynamic loading to get the plugins. Otherwise will not load any plugins.
 *
 * @param ctx - context in which the dashboard operates
 * @param dashboard - loaded dashboard
 * @internal
 */
export function adaptiveDashboardPluginLoader(
    ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
    moduleFederationIntegration: ModuleFederationIntegration,
): Promise<IDashboardPluginContract_V1[]> {
    if (!isEmpty(dashboard.references.plugins)) {
        return dynamicDashboardPluginLoader(ctx, dashboard, moduleFederationIntegration);
    }

    return noopDashboardPluginLoader(ctx, dashboard);
}

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use
 * the dynamic loading to get the common data. Otherwise will not do anything.
 *
 * @param ctx - context in which the dashboard operates
 * @param dashboard - loaded dashboard
 * @internal
 */
export function adaptiveDashboardCommonLoader(
    ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
): Promise<void> {
    if (!isEmpty(dashboard.references.plugins)) {
        return dynamicDashboardCommonLoader(ctx, dashboard);
    }

    return noopDashboardCommonLoader(ctx, dashboard);
}
