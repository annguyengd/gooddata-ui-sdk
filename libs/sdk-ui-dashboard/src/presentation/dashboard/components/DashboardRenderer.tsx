// (C) 2022 GoodData Corporation
import {
    BackendProvider,
    WorkspaceProvider,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
} from "@gooddata/sdk-ui";
import { OverlayController, ToastMessageContextProvider } from "@gooddata/sdk-ui-kit";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import React from "react";
import { OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { DashboardStoreProvider } from "../../../model";
import {
    ExportDialogContextProvider,
    DashboardCustomizationsProvider,
    DashboardComponentsProvider,
    DashboardConfigProvider,
} from "../../dashboardContexts";
import { DefaultDashboardDateFilter, DefaultFilterBar } from "../../filterBar";
import { DefaultDashboardLayout } from "../../layout";
import { DefaultSaveAsDialog } from "../../saveAs";
import { DefaultScheduledEmailDialog, DefaultScheduledEmailManagementDialog } from "../../scheduledEmail";
import { DefaultShareDialog } from "../../shareDialog";
import { DefaultButtonBar, DefaultMenuButton, DefaultTopBar, RenderModeAwareTitle } from "../../topBar";
import { defaultDashboardThemeModifier } from "../defaultDashboardThemeModifier";
import { useDashboard } from "../hooks/useDashboard";
import { IDashboardProps } from "../types";
import { DashboardLoading } from "./DashboardLoading";

/**
 * @internal
 */
export const DashboardRenderer: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const {
        backend,
        workspace,
        hasThemeProvider,
        dashboardOrRef,
        attributeFilterProvider,
        widgetProvider,
        insightProvider,
        insightBodyProvider,
        insightMenuButtonProvider,
        insightMenuProvider,
        kpiProvider,
    } = useDashboard(props);

    const dashboardRender = (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <OverlayControllerProvider overlayController={OverlayController.getInstance()}>
                    <DashboardStoreProvider
                        backend={props.backend}
                        workspace={props.workspace}
                        dashboard={dashboardOrRef}
                        filterContextRef={props.filterContextRef}
                        eventHandlers={props.eventHandlers}
                        config={props.config}
                        permissions={props.permissions}
                        onStateChange={props.onStateChange}
                        onEventingInitialized={props.onEventingInitialized}
                        additionalReduxContext={props.additionalReduxContext}
                        customizationFns={props.customizationFns}
                    >
                        <ToastMessageContextProvider>
                            <ExportDialogContextProvider>
                                <DashboardCustomizationsProvider
                                    insightMenuItemsProvider={props.insightMenuItemsProvider}
                                >
                                    <DashboardComponentsProvider
                                        ErrorComponent={props.ErrorComponent ?? DefaultError}
                                        LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                                        LayoutComponent={props.LayoutComponent ?? DefaultDashboardLayout}
                                        InsightComponentProvider={insightProvider}
                                        InsightBodyComponentProvider={insightBodyProvider}
                                        InsightMenuButtonComponentProvider={insightMenuButtonProvider}
                                        InsightMenuComponentProvider={insightMenuProvider}
                                        KpiComponentProvider={kpiProvider}
                                        WidgetComponentProvider={widgetProvider}
                                        ButtonBarComponent={props.ButtonBarComponent ?? DefaultButtonBar}
                                        MenuButtonComponent={props.MenuButtonComponent ?? DefaultMenuButton}
                                        TopBarComponent={props.TopBarComponent ?? DefaultTopBar}
                                        TitleComponent={props.TitleComponent ?? RenderModeAwareTitle}
                                        ScheduledEmailDialogComponent={
                                            props.ScheduledEmailDialogComponent ?? DefaultScheduledEmailDialog
                                        }
                                        ScheduledEmailManagementDialogComponent={
                                            props.ScheduledEmailManagementDialogComponent ??
                                            DefaultScheduledEmailManagementDialog
                                        }
                                        ShareDialogComponent={
                                            props.ShareDialogComponent ?? DefaultShareDialog
                                        }
                                        SaveAsDialogComponent={
                                            props.SaveAsDialogComponent ?? DefaultSaveAsDialog
                                        }
                                        DashboardAttributeFilterComponentProvider={attributeFilterProvider}
                                        DashboardDateFilterComponent={
                                            props.DashboardDateFilterComponent ?? DefaultDashboardDateFilter
                                        }
                                        FilterBarComponent={props.FilterBarComponent ?? DefaultFilterBar}
                                    >
                                        <DashboardConfigProvider menuButtonConfig={props.menuButtonConfig}>
                                            <DashboardLoading {...props} />
                                        </DashboardConfigProvider>
                                    </DashboardComponentsProvider>
                                </DashboardCustomizationsProvider>
                            </ExportDialogContextProvider>
                        </ToastMessageContextProvider>
                    </DashboardStoreProvider>
                </OverlayControllerProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );

    if (props.theme || (!hasThemeProvider && !props.disableThemeLoading)) {
        return (
            <ThemeProvider
                theme={props.theme}
                modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                backend={backend}
                workspace={workspace}
            >
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return dashboardRender;
};
