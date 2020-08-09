import 'ts-polyfill/lib/es2019-array';
import { ACCollectibleType, ACCollectible, Bank, BankATM } from './models';

async function scraper() {
  const [dbsBank] = await Bank.findOrCreate({
    where: {
      name: 'DBS',
    },
  });
  const atm = await BankATM.create({
    title: 'Amazing ATM',
    address: '123 ABC Road',
    opening_hours: '24/7',
    location: {
      type: 'Point',
      coordinates: [103, 1],
    },
    bank_id: dbsBank.id,
  });

  console.log(atm);
}

scraper()
  .then(() => process.exit(0))
  .catch((e) => {
    throw e;
  });
