'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-client-flight.production.js' |> require(%);
} else {
  module.exports = './cjs/react-client-flight.development.js' |> require(%);
}