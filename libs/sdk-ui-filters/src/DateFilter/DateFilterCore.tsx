// (C) 2007-2019 GoodData Corporation
import React from "react";
import { DateFilterGranularity } from "@gooddata/sdk-backend-spi";
import Dropdown from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import MediaQuery from "react-responsive";
import { IExtendedDateFilterErrors, IDateFilterOptionsByType, DateFilterOption } from "./interfaces";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { MediaQueries } from "../constants";
import { DateFilterButtonLocalized } from "./DateFilterButtonLocalized/DateFilterButtonLocalized";
import { DateFilterBody } from "./DateFilterBody/DateFilterBody";
import { applyExcludeCurrentPeriod } from "./utils/PeriodExlusion";
import { formatAbsoluteDate } from "./utils/Translations/DateFilterTitle";
import { DEFAULT_DATE_FORMAT } from "./constants/Platform";

export interface IDateFilterCoreProps {
    dateFormat: string;
    filterOptions: IDateFilterOptionsByType;
    /**
     * Filter option currently selected, it would be applied on Apply click.
     */
    selectedFilterOption: DateFilterOption;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    /**
     * Filter option selected before the filter dialog was opened.
     */
    originalSelectedFilterOption: DateFilterOption;

    excludeCurrentPeriod: boolean;
    originalExcludeCurrentPeriod: boolean;
    isExcludeCurrentPeriodEnabled: boolean;
    onExcludeCurrentPeriodChange: (isExcluded: boolean) => void;

    availableGranularities: DateFilterGranularity[];

    isEditMode: boolean;
    locale?: string;

    customFilterName?: string;
    disabled?: boolean;

    onApplyClick: () => void;
    onCancelClick: () => void;
    onDropdownOpenChanged: (isOpen: boolean) => void;

    errors?: IExtendedDateFilterErrors;
}

const DropdownBody: React.FC<{
    isMobile?: boolean;
    closeDropdown?: () => void;
    children: (props: { isMobile: boolean; closeDropdown: () => void }) => React.ReactElement<any>;
}> = (props) => {
    return props.children({
        isMobile: props.isMobile,
        closeDropdown: props.closeDropdown,
    });
};

export const verifyDateFormat = (dateFormat: string): string => {
    try {
        // Try to format the current date to verify if dateFormat is a valid format.
        formatAbsoluteDate(new Date(), dateFormat);
        return dateFormat;
    } catch {
        // If an error occurs, then dateFormat is invalid and the default format should be used instead. Also, a warning is written in the console.
        // eslint-disable-next-line no-console
        console.warn(
            `Unsupported date format ${dateFormat}, the default format ${DEFAULT_DATE_FORMAT} is used instead.`,
        );
        return DEFAULT_DATE_FORMAT;
    }
};

export const DateFilterCore: React.FC<IDateFilterCoreProps> = ({
    originalSelectedFilterOption,
    originalExcludeCurrentPeriod,
    onDropdownOpenChanged,
    customFilterName,
    dateFormat,
    disabled,
    locale,
    ...dropdownBodyProps
}) => {
    const verifiedDateFormat = verifyDateFormat(dateFormat);
    return (
        <IntlWrapper locale={locale || "en-US"}>
            <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                {(isMobile) => {
                    const dateFilterButton = (
                        <DateFilterButtonLocalized
                            isMobile={isMobile}
                            dateFilterOption={applyExcludeCurrentPeriod(
                                originalSelectedFilterOption,
                                originalExcludeCurrentPeriod,
                            )}
                            dateFormat={verifiedDateFormat}
                            customFilterName={customFilterName}
                        />
                    );
                    return (
                        <Dropdown
                            closeOnParentScroll={true}
                            closeOnMouseDrag={true}
                            closeOnOutsideClick={true}
                            enableEventPropagation={true}
                            alignPoints={[
                                { align: "bl tl" },
                                { align: "tr tl" },
                                { align: "tr tl", offset: { x: 0, y: -100 } },
                                { align: "tr tl", offset: { x: 0, y: -50 } },
                            ]}
                            onOpenStateChanged={onDropdownOpenChanged}
                            disabled={disabled}
                            // Dropdown component passes "isOpen" prop automatically to the component in "button" prop
                            // In Mobile case this is also rendered in the open dropdown
                            button={dateFilterButton}
                            ignoreClicksOn={[
                                ".s-do-not-close-dropdown-on-click",
                                ".DayPicker-Day", // absolute range picker calendar items
                            ]}
                            body={
                                // Dropdown component uses React.Children.map and adds special props to this component
                                // https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children
                                <DropdownBody>
                                    {({ closeDropdown }) => (
                                        <DateFilterBody
                                            {...dropdownBodyProps}
                                            isMobile={isMobile}
                                            closeDropdown={closeDropdown}
                                            dateFilterButton={dateFilterButton}
                                            dateFormat={verifiedDateFormat}
                                        />
                                    )}
                                </DropdownBody>
                            }
                        />
                    );
                }}
            </MediaQuery>
        </IntlWrapper>
    );
};
