const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../android/build/generated/autolinking/autolinking.json');

const config = {
  android: {
    packageName: 'com.kurbai.geochallenge',
  },
};

fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
