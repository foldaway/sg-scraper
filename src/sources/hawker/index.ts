import { orderBy } from 'lodash';
import moment, { Moment } from 'moment-timezone';

import { Hawker, HawkerRaw } from './model';
import dataGovApi from '../../util/data-gov-api';

const TODAY = moment();
const KEYS = ['q1', 'q2', 'q3', 'q4', 'others'];
const RESOURCE_ID = 'b80cb643-a732-480d-86b5-e03957bc82aa';

/**
 * Get the upcoming close date and the reason behind the closure
 *
 * assumption is made that the dates are sequential and will not overlap,
 * hence only enddate is only use to find the closest event
 */
const getCloseDetails = (hawker: HawkerRaw) => {
  const upcomingClosures: { key: string; endDate: Moment }[] = [];

  for (const key of KEYS) {
    const tempKey =
      key === 'others' ? 'other_works_enddate' : `${key}_cleaningenddate`;
    const rawEndDate = moment.tz(
      `${hawker[tempKey]} 00:00`,
      'DD/MM/YYYY',
      'Asia/Singapore'
    );
    rawEndDate.add(1, 'days');

    if (TODAY.isBefore(rawEndDate)) {
      upcomingClosures.push({ key, endDate: rawEndDate });
    }
  }

  if (upcomingClosures.length === 0) {
    return null;
  }

  const upcomingSorted = orderBy(upcomingClosures, ['endDate'], ['asc']);

  const hawkerClosure = upcomingSorted.map((upcoming) => {
    const key =
      upcoming.key === 'others'
        ? 'other_works_startdate'
        : `${upcoming.key}_cleaningstartdate`;

    const closeStartDate = moment.tz(
      `${hawker[key]} 00:00`,
      'DD/MM/YYYY',
      'Asia/Singapore'
    );

    return {
      closeStartDate: closeStartDate.valueOf(),
      closeEndDate: upcoming.endDate.valueOf(),
      closeReason:
        upcoming.key === 'others' ? hawker.remarks_other_works : 'cleaning',
    };
  });

  return hawkerClosure;
};

const removeHttp = (url: string) => {
  return url.replace(/(^\w+:|^)\/\//, '');
};

export default async function hawker(): Promise<Hawker[]> {
  const params = {
    limit: 150,
  };
  const response = await dataGovApi<HawkerRaw>(RESOURCE_ID, params);
  const hawkersList = response?.result.records;

  const result = hawkersList.map((hawkerObj) => {
    const hawkerClosure = getCloseDetails(hawkerObj);
    return {
      title: hawkerObj.name,
      address: hawkerObj.address_myenv,
      status: hawkerObj.status,
      location: {
        type: 'Point',
        coordinates: [hawkerObj.longitude_hc, hawkerObj.latitude_hc],
      },
      imageUrl: removeHttp(hawkerObj.photourl),
      hawkerClosure: hawkerClosure,
    };
  });

  console.log(`Fetched ${result.length} hawkers' results`);

  return result;
}
