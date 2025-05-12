const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../android/build/generated/autolinking/autolinking.json');

const config = {
  android: {
    packageName: 'com.kurbai.geochallenge',
  },
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
