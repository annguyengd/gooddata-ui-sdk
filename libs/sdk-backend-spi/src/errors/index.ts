// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IDataView } from "../workspace/execution";

/**
 * Types of errors that can be raised by Analytical Backends.
 *
 * @public
 */
export const AnalyticalBackendErrorTypes = {
    NO_DATA: "ND",
    DATA_TOO_LARGE: "DTL",
    PROTECTED_DATA: "PD",
    UNEXPECTED_HTTP: "UH",
    UNEXPECTED: "UE",
    NOT_SUPPORTED: "NS",
    NOT_IMPLEMENTED: "NI!",
    NOT_AUTHENTICATED: "NAuth",
};

/**
 * Superclass for all exceptions that can occur in Analytical Backend.
 *
 * @public
 */
export abstract class AnalyticalBackendError extends Error {
    protected constructor(message: string, public readonly abeType: string, public readonly cause?: Error) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * This exception MUST be thrown when the backend execution identifies that there is no data to
 * calculate.
 *
 * @public
 */
export class NoDataError extends AnalyticalBackendError {
    /**
     * Empty data view MAY be included by the backend in case execution metadata and data view metadata is present.
     */
    public readonly dataView?: IDataView;

    constructor(message: string, dataView?: IDataView, cause?: Error) {
        super(message, AnalyticalBackendErrorTypes.NO_DATA, cause);

        this.dataView = dataView;
    }
}

/**
 * This exception MUST be thrown when backend execution identifies that there is too much data
 * to process for the execution and refuses to proceed.
 *
 * @public
 */
export class DataTooLargeError extends AnalyticalBackendError {
    constructor(message: string, cause?: Error) {
        super(message, AnalyticalBackendErrorTypes.DATA_TOO_LARGE, cause);
    }
}

/**
 * This exception MUST be thrown when backend execution identifies that the data to calculate
 * results for is protected and the caller lacks the sufficient authorization.
 *
 * @public
 */
export class ProtectedDataError extends AnalyticalBackendError {
    constructor(message: string, cause?: Error) {
        super(message, AnalyticalBackendErrorTypes.PROTECTED_DATA, cause);
    }
}

/**
 * This exception MUST be thrown when communication with the backend encounters an unexpected
 * response status code and it cannot handle or categorize it to a known, domain-specific error.
 *
 * @public
 */
export class UnexpectedResponseError extends AnalyticalBackendError {
    public readonly httpStatus: number;
    public readonly responseBody: unknown;

    constructor(message: string, httpStatus: number, responseBody: unknown, cause?: Error) {
        super(message, AnalyticalBackendErrorTypes.UNEXPECTED_HTTP, cause);

        this.httpStatus = httpStatus;
        this.responseBody = responseBody;
    }
}

/**
 * This exception MUST be thrown when the unexpected happens. This is a last-resort error type that SHOULD
 * be used if the erroneous state cannot be categorized in a better way.
 *
 * @public
 */
export class UnexpectedError extends AnalyticalBackendError {
    constructor(message: string, cause?: Error) {
        super(message, AnalyticalBackendErrorTypes.UNEXPECTED, cause);
    }
}

/**
 * This exception is thrown when client code asks Analytical Backend to exercise an unsupported feature.
 *
 * @public
 */
export class NotSupported extends AnalyticalBackendError {
    constructor(message: string) {
        super(message, AnalyticalBackendErrorTypes.NOT_SUPPORTED);
    }
}

/**
 * This exception is thrown when client code asks Analytical Backend to exercise a feature that is not
 * implemented yet.
 * @public
 */
export class NotImplemented extends AnalyticalBackendError {
    constructor(message: string) {
        super(message, AnalyticalBackendErrorTypes.NOT_IMPLEMENTED);
    }
}

/**
 * Implementation of different backends MAY indicate through this structure where to redirect the browser
 * in order to start authentication flow.
 *
 * @remarks
 * The `returnRedirectParam` is the name of the query parameter that the application should set when redirecting.
 * The value of the query parameter is the return URL where the browser should return after successful authentication.
 *
 * @public
 */
export type AuthenticationFlow = {
    loginUrl: string;
    returnRedirectParam: string;
};

/**
 * More detailed reason of the NotAuthenticated error.
 *
 * @remarks
 * - invalid_credentials - the provided credentials were invalid
 * - credentials_expired - the credentials' validity expired
 *
 * @public
 */
export type NotAuthenticatedReason = "invalid_credentials" | "credentials_expired";

/**
 * This exception is thrown when client code triggers an operation which requires authentication but the client
 * code did not provide credentials or the credentials are invalid.
 *
 * @public
 */
export class NotAuthenticated extends AnalyticalBackendError {
    public authenticationFlow?: AuthenticationFlow;
    /**
     * More detailed reason of the NotAuthenticated error. See {@link NotAuthenticatedReason} for more information.
     *
     * @remarks
     * MAY be undefined if the particular backend implementation does not provide this value.
     */
    public reason?: NotAuthenticatedReason;

    constructor(message: string, cause?: Error, reason?: NotAuthenticatedReason) {
        super(message, AnalyticalBackendErrorTypes.NOT_AUTHENTICATED, cause);
        this.reason = reason;
    }
}

/**
 * Error converter
 *
 * @public
 */
export type ErrorConverter = (e: Error) => AnalyticalBackendError;

/**
 * Type guard checking whether input is an instance of {@link AnalyticalBackendError}
 *
 * @public
 */
export function isAnalyticalBackendError(obj: unknown): obj is AnalyticalBackendError {
    return !isEmpty(obj) && (obj as AnalyticalBackendError).abeType !== undefined;
}

/**
 * Type guard checking whether input is an instance of {@link NoDataError}
 *
 * @public
 */
export function isNoDataError(obj: unknown): obj is NoDataError {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.NO_DATA;
}

/**
 * Type guard checking whether input is an instance of {@link DataTooLargeError}
 *
 * @public
 */
export function isDataTooLargeError(obj: unknown): obj is DataTooLargeError {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.DATA_TOO_LARGE;
}

/**
 * Type guard checking whether input is an instance of {@link ProtectedDataError}
 *
 * @public
 */
export function isProtectedDataError(obj: unknown): obj is ProtectedDataError {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.PROTECTED_DATA;
}

/**
 * Type guard checking whether input is an instance of {@link UnexpectedResponseError}
 *
 * @public
 */
export function isUnexpectedResponseError(obj: unknown): obj is UnexpectedResponseError {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.UNEXPECTED_HTTP;
}

/**
 * Type guard checking whether input is an instance of {@link UnexpectedResponseError}
 *
 * @public
 */
export function isUnexpectedError(obj: unknown): obj is UnexpectedError {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.UNEXPECTED;
}

/**
 * Type guard checking whether input is an instance of {@link NotSupported}
 *
 * @public
 */
export function isNotSupported(obj: unknown): obj is NotSupported {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.NOT_SUPPORTED;
}

/**
 * Type guard checking whether input is an instance of {@link NotImplemented}
 *
 * @public
 */
export function isNotImplemented(obj: unknown): obj is NotImplemented {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.NOT_IMPLEMENTED;
}

/**
 * Type guard checking whether input is an instance of {@link NotAuthenticated}
 *
 * @public
 */
export function isNotAuthenticated(obj: unknown): obj is NotAuthenticated {
    return isAnalyticalBackendError(obj) && obj.abeType === AnalyticalBackendErrorTypes.NOT_AUTHENTICATED;
}
