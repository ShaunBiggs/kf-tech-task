import { getEnvironmentVariable } from '../helpers/environment/environment-variables';
import { callApiWith500Retry } from '../helpers/kf-api/retry-api';
import { filterBeforeDateSchema } from '../helpers/schemas/filter-before-date.schema';
import { getOutages, getSiteInfo, postSiteOutages } from '../services/kf-api';
import { DeviceOutage } from '../types';

export const executeSiteOutages = async () => {
  const siteId = getEnvironmentVariable('SITE_ID');
  const beginFilterDate = getEnvironmentVariable('FILTER_BEFORE_DATE');

  const validatedBeginFilterDate = filterBeforeDateSchema.safeParse(beginFilterDate);
  if (!validatedBeginFilterDate.success) {
    const message = `Invalid value provided for filter date, expected an ISO DateTime string of format YYYY-MM-DDTHH:MM:SS.MMMZ but received: ${beginFilterDate}`;
    console.error(message);
    throw Error(message);
  }

  const [outages, siteInfo] = await Promise.all([
    callApiWith500Retry(() => getOutages()),
    callApiWith500Retry(() => getSiteInfo(siteId)),
  ]);

  const dateFilteredOutages = outages.filter((outage) => {
    return new Date(outage.begin) >= new Date(beginFilterDate);
  });

  const outagesOnSite = siteInfo.devices.flatMap((device) => {
    let deviceOutages: DeviceOutage[] = [];
    dateFilteredOutages.forEach((outage) => {
      if (device.id === outage.id) {
        deviceOutages.push({
          ...outage,
          name: device.name,
        });
      }
    });
    return deviceOutages;
  });

  await callApiWith500Retry(() => postSiteOutages(siteId, outagesOnSite));
};
