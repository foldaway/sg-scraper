export interface Hawker {
  title: string;
  address: string;
  status: string;
  closeStartDate?: number;
  closeEndDate?: number;
  closeReason?: string;
  imageUrl: string;
  location: {
    type: string;
    coordinates: string[];
  };
}

export interface HawkerRaw {
  serial_no: string;
  name: string;
  address_myenv: string;
  longitude_hc: string;
  latitude_hc: string;
  status: string;
  no_of_market_stalls: string;
  no_of_food_stalls: string;
  description_myenv: string;
  google_for_stall: string;
  google_3d_view: string;
  photourl: string;
  q1_cleaningstartdate: string;
  q2_cleaningstartdate: string;
  q3_cleaningstartdate: string;
  q4_cleaningstartdate: string;
  other_works_startdate: string;
  q1_cleaningenddate: string;
  q2_cleaningenddate: string;
  q3_cleaningenddate: string;
  q4_cleaningenddate: string;
  other_works_enddate: string;
  remark_q1: string;
  remark_q2: string;
  remark_q3: string;
  remark_q4: string;
  remarks_other_works: string;
  _id: number;
}
