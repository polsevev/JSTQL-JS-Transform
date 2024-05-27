'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/scheduler.production.js' |> require(%);
} else {
  module.exports = './cjs/scheduler.development.js' |> require(%);
}