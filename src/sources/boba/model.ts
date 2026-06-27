import type { Point } from 'geojson';
import type { ChainName } from './constants';

export interface Boba {
  title: string;
  address: string;
  phone: string;
  openingHours: string;
  location: Point | null;
  chain: ChainName;
}
