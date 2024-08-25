import { Point } from 'geojson';
import { ChainName } from './constants';

export interface Boba {
  title: string;
  address: string;
  phone: string;
  openingHours: string;
  location: Point | null;
  chain: ChainName;
}
