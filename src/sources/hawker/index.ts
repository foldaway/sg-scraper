import moment, { Moment } from 'moment-timezone';

import { Hawker, HawkerRaw } from './model';
import autoParse from '../../util/data-gov-api';

const TODAY = moment();
const KEYS = ['q1', 'q2', 'q3', 'q4', 'others'];
const RESOURCE_ID = 'b80cb643-a732-480d-86b5-e03957bc82aa';

const splitDate = (dateString: string) => {
  const data = dateString.split('/');
  if (data.length !== 3) {
    return undefined;
  }
  return {
    year: data[2],
    month: data[1].length === 1 ? '0' + data[1] : data[1],
    day: data[0].length === 1 ? '0' + data[0] : data[0],
  };
};

/**
 * Get the upcoming close date and the reason behind the closure
 *
 * assumption is made that the dates are sequential and will not overlap,
 * hence only enddate is only use to find the closest event
 */
const getCloseDetails = (hawker: HawkerRaw) => {
  const upcomingClosures: { key: string; endDate: Moment }[] = [];

  // Convert a date string into a Date object, factoring in SG timezone
  const convertFromDateString = (dateString: string): Moment => {
    const split = splitDate(dateString);
    if (!split) {
      return moment.tz(dateString, 'Asia/Singapore');
    }
    return moment.tz(
      `${split.year}-${split.month}-${split.day} 00:00`,
      'Asia/Singapore'
    );
  };

  for (const key of KEYS) {
    const tempKey =
      key === 'others' ? 'other_works_enddate' : `${key}_cleaningenddate`;
    const rawEndDate = convertFromDateString(hawker[tempKey]);
    rawEndDate.add(1, 'days');

    if (TODAY < rawEndDate) {
      upcomingClosures.push({ key, endDate: rawEndDate });
    }
  }

  if (upcomingClosures.length === 0) {
    return {
      closeStartDate: null,
      closeEndDate: null,
      closeReason: null,
    };
  }

  const upcoming = upcomingClosures.sort((a, b) =>
    a.endDate.diff(b.endDate)
  )[0];

  const closeStartDate =
    upcoming.key === 'others'
      ? convertFromDateString(hawker.other_works_startdate)
      : convertFromDateString(hawker[`${upcoming.key}_cleaningstartdate`]);
  const closeReason =
    upcoming.key === 'others' ? hawker.remarks_other_works : 'cleaning';

  return {
    closeStartDate: closeStartDate.valueOf(),
    closeEndDate: upcoming.endDate.valueOf(),
    closeReason,
  };
};

export default async function hawker(): Promise<Hawker[]> {
  const params = {
    limit: 150,
  };
  const response = await autoParse(RESOURCE_ID, params);
  const hawkersList = (<unknown>response?.result.records) as HawkerRaw[];

  const result = hawkersList.map((hawkerObj) => {
    const closureDetails = getCloseDetails(hawkerObj);
    return {
      title: hawkerObj.name,
      address: hawkerObj.address_myenv,
      status: hawkerObj.status,
      location: {
        type: 'Point',
        coordinates: [hawkerObj.longitude_hc, hawkerObj.latitude_hc],
      },
      imageUrl: hawkerObj.photourl,
      ...closureDetails,
    };
  });

  console.log(`Fetched ${result.length} hawkers' results`);

  return result;
}
