export const ChainNames = {
  blackball: 'Blackball' as const,
  chicha: 'ChiCha' as const,
  eachACup: 'Each-A-Cup' as const,
  gongCha: 'Gong Cha' as const,
  koi: 'KOI' as const,
  mrCoconut: 'Mr Coconut' as const,
  playmade: 'Playmade' as const,
  kopifellas: 'Kopifellas' as const,
  yakun: 'Ya Kun' as const,
  localCoffeePeople: 'Local Coffee People' as const,
};

export type ChainName = (typeof ChainNames)[keyof typeof ChainNames];
