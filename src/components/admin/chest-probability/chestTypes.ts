
export const chestTypes = {
  silver: { name: 'Baú de Prata', price: 10 },
  gold: { name: 'Baú de Ouro', price: 25 },
  delas: { name: 'Baú Delas', price: 50 },
  diamond: { name: 'Baú de Diamante', price: 100 },
  ruby: { name: 'Baú de Rubi', price: 250 },
  premium: { name: 'Baú Premium', price: 500 }
} as const;

export type ChestType = keyof typeof chestTypes;
