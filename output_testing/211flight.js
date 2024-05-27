'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-flight.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-flight.development.js' |> require(%);
}