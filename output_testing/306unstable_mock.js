'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/scheduler-unstable_mock.production.js' |> require(%);
} else {
  module.exports = './cjs/scheduler-unstable_mock.development.js' |> require(%);
}