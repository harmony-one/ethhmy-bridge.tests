export const config = {
  servers: [
    'https://bridge.harmony.one:8080',
    'https://bridge.harmony.one:8081',
    'https://bridge.harmony.one:8082',
  ],
  accounts: [
    {
      ethPK: 'cbcf3af28e37d8b69c4ea5856f2727f57ad01d3e86bec054d71fa83fc246f35b',
      hmyPK: '0x8a08736a0b035fbba4108bd3d67d7dc61207f18605b8cdbb692faeefd27382fd',
    },
  ],
  erc20Address: '0xd975f1e987f24a5decfb656bebe7cc492969389a',
  logLevel: 2, // 2: full, 1; errors + success, 0; only errors
};
