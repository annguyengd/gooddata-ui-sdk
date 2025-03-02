// (C) 2020-2022 GoodData Corporation

import { TigerWorkspacePermissionsFactory } from "../index";

type TigerPermissionType = "MANAGE" | "VIEW" | "ANALYZE";

describe("TigerWorkspacePermissionsFactory", () => {
    const workspaceId = "workspaceId";

    function getWithDefinedPermissions(
        permissions: Array<TigerPermissionType>,
    ): [TigerWorkspacePermissionsFactory, ReturnType<typeof jest.fn>] {
        const authCall = jest.fn();
        const getCall = jest.fn();

        authCall.mockImplementation((handler) => {
            return handler({ axios: { get: getCall } });
        });
        getCall.mockImplementation(() => {
            return Promise.resolve({ data: { data: { meta: { permissions } } } });
        });
        return [new TigerWorkspacePermissionsFactory(authCall, workspaceId), getCall];
    }

    it("test VIEW permissions", async () => {
        const [client, get] = getWithDefinedPermissions(["VIEW"]);
        const permissions = await client.getPermissionsForCurrentUser();

        expect(get).toHaveBeenCalledWith("/api/entities/workspaces/workspaceId?metaInclude=permissions");
        expect(permissions).toEqual({
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: false,
            canCreateReport: false,
            canCreateScheduledMail: false,
            canCreateVisualization: false,
            canExecuteRaw: true,
            canExportReport: false,
            canInitData: false,
            canInviteUserToProject: false,
            canListUsersInProject: false,
            canManageACL: false,
            canManageAnalyticalDashboard: false,
            canManageDomain: false,
            canManageMetric: false,
            canManageProject: false,
            canManageReport: false,
            canManageScheduledMail: false,
            canRefreshData: false,
            canUploadNonProductionCSV: false,
        });
    });

    it("test ANALYZE permissions", async () => {
        const [client, get] = getWithDefinedPermissions(["ANALYZE", "VIEW"]);
        const permissions = await client.getPermissionsForCurrentUser();

        expect(get).toHaveBeenCalledWith("/api/entities/workspaces/workspaceId?metaInclude=permissions");
        expect(permissions).toEqual({
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: true,
            canCreateReport: false,
            canCreateScheduledMail: false,
            canCreateVisualization: true,
            canExecuteRaw: true,
            canExportReport: false,
            canInitData: false,
            canInviteUserToProject: false,
            canListUsersInProject: false,
            canManageACL: false,
            canManageAnalyticalDashboard: true,
            canManageDomain: false,
            canManageMetric: true,
            canManageProject: false,
            canManageReport: true,
            canManageScheduledMail: false,
            canRefreshData: true,
            canUploadNonProductionCSV: false,
        });
    });

    it("test MANAGE permissions", async () => {
        const [client, get] = getWithDefinedPermissions(["MANAGE", "ANALYZE", "VIEW"]);
        const permissions = await client.getPermissionsForCurrentUser();

        expect(get).toHaveBeenCalledWith("/api/entities/workspaces/workspaceId?metaInclude=permissions");
        expect(permissions).toEqual({
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: true,
            canCreateReport: false,
            canCreateScheduledMail: false,
            canCreateVisualization: true,
            canExecuteRaw: true,
            canExportReport: false,
            canInitData: true,
            canInviteUserToProject: false,
            canListUsersInProject: false,
            canManageACL: false,
            canManageAnalyticalDashboard: true,
            canManageDomain: false,
            canManageMetric: true,
            canManageProject: true,
            canManageReport: true,
            canManageScheduledMail: false,
            canRefreshData: true,
            canUploadNonProductionCSV: false,
        });
    });
});
