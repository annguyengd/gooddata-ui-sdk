// (C) 2019-2022 GoodData Corporation

import {
    IAuthenticatedPrincipal,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IExecutionFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspaceAttributesService,
    IWorkspaceMeasuresService,
    IWorkspaceFactsService,
    IWorkspacePermissionsService,
    IWorkspacesQueryFactory,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    NotSupported,
    IUserService,
    IWorkspaceInsightsService,
    IUserSettingsService,
    IWorkspaceDashboardsService,
    IUserWorkspaceSettings,
    IWorkspaceUsersQuery,
    IDateFilterConfigsQuery,
    IBackendCapabilities,
    IWorkspaceDescriptor,
    IOrganization,
    ISecuritySettingsService,
    ValidationContext,
    IOrganizations,
    IDateFilterConfigsQueryResult,
    IUser,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
} from "@gooddata/sdk-backend-spi";
import {
    IColorPalette,
    idRef,
    ISeparators,
    ITheme,
    IWorkspacePermissions,
    IOrganizationDescriptor,
} from "@gooddata/sdk-model";
import { RecordedExecutionFactory } from "./execution";
import { RecordedBackendConfig, RecordingIndex } from "./types";
import { RecordedInsights } from "./insights";
import { RecordedCatalogFactory } from "./catalog";
import { RecordedAttributes } from "./attributes";
import { RecordedMeasures } from "./measures";
import { RecordedFacts } from "./facts";
import { RecordedDashboards } from "./dashboards";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    recordedAccessControlFactory,
    recordedUserGroupsQuery,
    RecordedWorkspaceUsersQuery,
} from "./userManagement";

const defaultConfig: RecordedBackendConfig = {
    hostname: "test",
};

const USER_ID = "recordedUser";
const locale = "en-US";
const separators: ISeparators = {
    thousand: ",",
    decimal: ".",
};

/**
 * @internal
 */
export const defaultRecordedBackendCapabilities: IBackendCapabilities = {
    canCalculateGrandTotals: true,
    canCalculateSubTotals: true,
    canCalculateTotals: true,
    canCalculateNativeTotals: true,
    supportsCsvUploader: true,
    supportsKpiWidget: true,
    supportsWidgetEntity: true,
    supportsOwners: true,
    allowsInconsistentRelations: false,
    supportsHierarchicalWorkspaces: false,
};

/**
 * Creates new backend that will be providing recorded results to the caller. The recorded results are provided
 * to the backend in the form of RecordingIndex. This contains categorized recordings for the different service
 * calls.
 *
 * Note that:
 * - the 'tools/mock-handling' program can be used to create recordings AND the recording index.
 * - typically you want to use this recordedBackend with the recordings from the reference workspace; there
 *   is already tooling and infrastructure around populating that project
 *
 * @param index - recording index
 * @param config - backend config, for now just for compatibility sakes with the analytical backend config
 * @param capabilities - backend capabilities to use
 * @internal
 */
export function recordedBackend(
    index: RecordingIndex,
    config: RecordedBackendConfig = defaultConfig,
    capabilities = defaultRecordedBackendCapabilities,
): IAnalyticalBackend {
    const backend: IAnalyticalBackend = {
        capabilities,
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return recordedBackend(index, { ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return backend;
        },
        withAuthentication(_: IAuthenticationProvider): IAnalyticalBackend {
            return this;
        },
        organization(organizationId: string): IOrganization {
            return recordedOrganization(organizationId, config);
        },
        organizations(): IOrganizations {
            return recordedOrganizations(config);
        },
        currentUser(): IUserService {
            return recordedUserService(config);
        },
        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id, index, config);
        },
        workspaces(): IWorkspacesQueryFactory {
            throw new NotSupported("not supported");
        },
        authenticate(): Promise<IAuthenticatedPrincipal> {
            return Promise.resolve({ userId: USER_ID });
        },
        deauthenticate(): Promise<void> {
            return Promise.resolve();
        },
        isAuthenticated(): Promise<IAuthenticatedPrincipal | null> {
            return Promise.resolve({ userId: USER_ID });
        },
    };

    return backend;
}

function recordedWorkspace(
    workspace: string,
    recordings: RecordingIndex = {},
    implConfig: RecordedBackendConfig,
): IAnalyticalWorkspace {
    const insightsService = new RecordedInsights(recordings, implConfig.useRefType ?? "uri");

    return {
        workspace,
        async getDescriptor(): Promise<IWorkspaceDescriptor> {
            return recordedDescriptor(this.workspace, implConfig);
        },
        getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
            throw new NotSupported("not supported");
        },
        execution(): IExecutionFactory {
            return new RecordedExecutionFactory(recordings, workspace, implConfig.useRefType ?? "uri");
        },
        attributes(): IWorkspaceAttributesService {
            return new RecordedAttributes(recordings, implConfig);
        },
        measures(): IWorkspaceMeasuresService {
            return new RecordedMeasures();
        },
        facts(): IWorkspaceFactsService {
            return new RecordedFacts();
        },
        insights(): IWorkspaceInsightsService {
            return insightsService;
        },
        dashboards(): IWorkspaceDashboardsService {
            return new RecordedDashboards(this.workspace, insightsService, recordings);
        },
        settings(): IWorkspaceSettingsService {
            return {
                async getSettings(): Promise<IWorkspaceSettings> {
                    return {
                        workspace,
                        ...(implConfig.globalSettings ?? {}),
                    };
                },
                async getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
                    return {
                        userId: USER_ID,
                        workspace,
                        locale,
                        separators,
                        ...(implConfig.globalSettings ?? {}),
                    };
                },
            };
        },
        styling(): IWorkspaceStylingService {
            return {
                async getColorPalette(): Promise<IColorPalette> {
                    return implConfig.globalPalette ?? [];
                },
                async getTheme(): Promise<ITheme> {
                    return implConfig.theme ?? {};
                },
            };
        },
        dateFilterConfigs(): IDateFilterConfigsQuery {
            return recordedDateFilterConfig(implConfig);
        },
        catalog(): IWorkspaceCatalogFactory {
            return new RecordedCatalogFactory(workspace, recordings, implConfig);
        },
        datasets(): IWorkspaceDatasetsService {
            throw new NotSupported("not supported");
        },
        permissions(): IWorkspacePermissionsService {
            return recordedPermissionsFactory();
        },
        users(): IWorkspaceUsersQuery {
            return new RecordedWorkspaceUsersQuery(implConfig);
        },
        userGroups(): IWorkspaceUserGroupsQuery {
            return recordedUserGroupsQuery(implConfig);
        },
        accessControl(): IWorkspaceAccessControlService {
            return recordedAccessControlFactory(implConfig);
        },
    };
}

function recordedOrganization(organizationId: string, implConfig: RecordedBackendConfig): IOrganization {
    const scopeFactory =
        implConfig.securitySettingsOrganizationScope === undefined
            ? (organizationId: string) => `/gdc/domains/${organizationId}`
            : implConfig.securitySettingsOrganizationScope;
    return {
        organizationId,
        getDescriptor(): Promise<IOrganizationDescriptor> {
            return Promise.resolve({
                id: organizationId,
                title: "mock organization",
            });
        },
        securitySettings(): ISecuritySettingsService {
            return {
                scope: scopeFactory(organizationId),
                isUrlValid(url: string, context: ValidationContext): Promise<boolean> {
                    if (implConfig.securitySettingsUrlValidator !== undefined) {
                        return Promise.resolve(implConfig.securitySettingsUrlValidator(url, context));
                    }
                    return Promise.resolve(true);
                },
                isDashboardPluginUrlValid(url: string, workspace: string): Promise<boolean> {
                    if (implConfig.securitySettingsPluginUrlValidator !== undefined) {
                        return Promise.resolve(implConfig.securitySettingsPluginUrlValidator(url, workspace));
                    }
                    return Promise.resolve(true);
                },
            };
        },
    };
}

function recordedOrganizations(implConfig: RecordedBackendConfig): IOrganizations {
    return {
        getCurrentOrganization(): Promise<IOrganization> {
            return Promise.resolve(recordedOrganization("mock-organization", implConfig));
        },
    };
}

// returns the same settings as the global ones
function recordedUserService(implConfig: RecordedBackendConfig): IUserService {
    return {
        async getUser(): Promise<IUser> {
            return (
                implConfig.userManagement?.user ?? {
                    login: USER_ID,
                    ref: idRef(USER_ID),
                    email: "",
                    fullName: "",
                    firstName: "",
                    lastName: "",
                }
            );
        },
        settings(): IUserSettingsService {
            return {
                getSettings: async () => ({
                    userId: USER_ID,
                    locale,
                    separators,
                    ...(implConfig.globalSettings ?? {}),
                }),
            };
        },
    };
}

// return true for all
function recordedPermissionsFactory(): IWorkspacePermissionsService {
    return {
        getPermissionsForCurrentUser: async (): Promise<IWorkspacePermissions> => ({
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: true,
            canCreateReport: true,
            canCreateVisualization: true,
            canExecuteRaw: true,
            canExportReport: true,
            canInitData: true,
            canManageAnalyticalDashboard: true,
            canManageMetric: true,
            canManageProject: true,
            canManageReport: true,
            canUploadNonProductionCSV: true,
            canCreateScheduledMail: true,
            canListUsersInProject: true,
            canManageDomain: true,
            canInviteUserToProject: true,
            canRefreshData: true,
            canManageACL: true,
            canManageScheduledMail: true,
        }),
    };
}

function recordedDescriptor(workspaceId: string, implConfig: RecordedBackendConfig): IWorkspaceDescriptor {
    const { title, description, isDemo } = implConfig.workspaceDescriptor || {};

    return {
        id: workspaceId,
        title: title ?? "",
        description: description ?? "",
        isDemo: isDemo ?? false,
    };
}

function recordedDateFilterConfig(implConfig: RecordedBackendConfig): IDateFilterConfigsQuery {
    return {
        withLimit(_limit: number): IDateFilterConfigsQuery {
            return this;
        },
        withOffset(_offset: number): IDateFilterConfigsQuery {
            return this;
        },
        query(): Promise<IDateFilterConfigsQueryResult> {
            const { dateFilterConfig } = implConfig;

            return Promise.resolve(new InMemoryPaging(dateFilterConfig ? [dateFilterConfig] : []));
        },
    };
}
