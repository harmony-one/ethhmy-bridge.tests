# ethhmy-bridge.tests
Harmony Eth Bridge tests

## Install instructions

### Requirements 

* nodejs 

### Commands

* Fetch repo 

```
git clone git@github.com:harmony-one/ethhmy-bridge.tests.git
```

* Install dependencies

```
npm install
```

* Configure tests

```
vim tests/testConfig.ts
```

```
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
  logLevel: 2, // 2: full, 1; errors + success, 0; only errors
};
```


* Start e2e test

```
npm run test
```
