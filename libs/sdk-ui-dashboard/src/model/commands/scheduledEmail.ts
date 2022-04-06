// (C) 2021-2022 GoodData Corporation

import { IFilterContextDefinition, IScheduledMailDefinition } from "@gooddata/sdk-model";
import { IDashboardCommand } from "./base";

/**
 * Payload of the {@link CreateScheduledEmail} command.
 * @alpha
 */
export interface CreateScheduledEmailPayload {
    /**
     * The scheduled email to create.
     */
    readonly scheduledEmail: IScheduledMailDefinition;
    /**
     * Filter context to use for the scheduled email. If no filter context is provided, stored dashboard filter context will be used.
     */
    readonly filterContext?: IFilterContextDefinition;
}

/**
 * Creates scheduled email.
 *
 * @alpha
 */
export interface CreateScheduledEmail extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE";
    readonly payload: CreateScheduledEmailPayload;
}

/**
 * Creates the CreateScheduledEmail command. 
 * 
 * Dispatching this command will result in the creating scheduled email on the backend.
 *
 * @param scheduledEmail - specify scheduled email to create.
 * @param filterContext - specify filter context to use for the scheduled email. If no filter context is provided, stored dashboard filter context will be used.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @alpha
 */
export function createScheduledEmail(
    scheduledEmail: IScheduledMailDefinition,
    filterContext?: IFilterContextDefinition,
    correlationId?: string,
): CreateScheduledEmail {
    return {
        type: "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE",
        correlationId,
        payload: {
            scheduledEmail,
            filterContext,
        },
    };
}
