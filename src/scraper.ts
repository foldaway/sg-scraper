import { ACCollectibleType, ACCollectible } from './models';

async function scraper() {
  const x = await ACCollectibleType.create({
    name: 'test',
  });
  console.log(x);

  const y = ACCollectible.build({
    name: 'test ac',
    location: 'somewhere',
    sell_price: 99,
    time: 'some time',
    season: 'some season',
    type_id: x.id,
  });

  await y.save();

  console.log(y);
}

scraper()
  .then(() => process.exit(0))
  .catch((e) => {
    throw e;
  });
