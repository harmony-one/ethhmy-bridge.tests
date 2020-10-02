export const config = {
  servers: [
    'https://bridge.harmony.one:8080',
    'https://bridge.harmony.one:8081',
    'https://bridge.harmony.one:8082',
  ],
  accounts: [
    {
      ethPK: '',
      hmyPK: '',
    },
  ],
  erc20Address: '0xd975f1e987f24a5decfb656bebe7cc492969389a',
  logLevel: 2, // 2: full, 1; errors + success, 0; only errors
};
