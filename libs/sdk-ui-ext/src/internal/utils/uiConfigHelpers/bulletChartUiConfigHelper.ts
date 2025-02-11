// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { IntlShape } from "react-intl";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { UICONFIG } from "../../constants/uiConfig";
import { setBucketTitles, getItemsCount } from "./../bucketHelper";
import { getTranslation } from "../translations";
import { BucketNames } from "@gooddata/sdk-ui";

// If you need to edit these icons
// reflect changes also in gdc-analytical-designer
// https://github.com/gooddata/gdc-analytical-designer/blob/develop/app/components/buckets/BucketIcon.tsx
const bulletPrimaryMeasureIcon = "local:bullet/bucket-title-primary.svg";
const bulletTargetMeasureIcon = "local:bullet/bucket-title-target.svg";
const bulletComparativeMeasureIcon = "local:bullet/bucket-title-comparative.svg";
const bulletViewByIcon = "local:bullet/bucket-title-view-by.svg";

export function getBulletChartUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);

    referencePointConfigured[UICONFIG] = setBucketTitles(referencePointConfigured, visualizationType, intl);

    const buckets = referencePoint?.buckets ?? [];

    const primaryMeasuresCount = getItemsCount(buckets, BucketNames.MEASURES);
    const secondaryMeasuresCount = getItemsCount(buckets, BucketNames.SECONDARY_MEASURES);
    const tertiaryMeasuresCount = getItemsCount(buckets, BucketNames.TERTIARY_MEASURES);

    referencePointConfigured[UICONFIG].buckets[BucketNames.MEASURES] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.MEASURES],
        canAddItems: primaryMeasuresCount < 1,
        icon: bulletPrimaryMeasureIcon as any,
    };

    referencePointConfigured[UICONFIG].buckets[BucketNames.SECONDARY_MEASURES] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.SECONDARY_MEASURES],
        canAddItems: secondaryMeasuresCount < 1,
        icon: bulletTargetMeasureIcon as any,
    };

    referencePointConfigured[UICONFIG].buckets[BucketNames.TERTIARY_MEASURES] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.TERTIARY_MEASURES],
        canAddItems: tertiaryMeasuresCount < 1,
        icon: bulletComparativeMeasureIcon as any,
    };

    referencePointConfigured[UICONFIG].buckets[BucketNames.VIEW] = {
        ...referencePointConfigured[UICONFIG].buckets[BucketNames.VIEW],
        icon: bulletViewByIcon as any,
    };

    if (primaryMeasuresCount === 0 && (secondaryMeasuresCount !== 0 || tertiaryMeasuresCount !== 0)) {
        referencePointConfigured[UICONFIG].customError = {
            heading: getTranslation("dashboard.error.missing_primary_bucket_item.heading", intl),
            text: getTranslation("dashboard.error.missing_primary_bucket_item.text", intl),
        };
    }

    return referencePointConfigured;
}
