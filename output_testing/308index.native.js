'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/scheduler.native.production.js' |> require(%);
} else {
  module.exports = './cjs/scheduler.native.development.js' |> require(%);
}