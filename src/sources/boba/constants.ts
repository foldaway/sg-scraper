export const ChainNames = {
  blackball: 'Blackball' as const,
  chicha: 'ChiCha' as const,
  eachACup: 'Each-A-Cup' as const,
  gongCha: 'Gong Cha' as const,
  koi: 'KOI' as const,
  liho: 'LiHO' as const,
  mrCoconut: 'Mr Coconut' as const,
  playmade: 'Playmade' as const,
  tigerSugar: 'Tiger Sugar' as const,
};

export type ChainName = typeof ChainNames[keyof typeof ChainNames];
