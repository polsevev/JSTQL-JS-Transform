'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/scheduler-unstable_post_task.production.js' |> require(%);
} else {
  module.exports = './cjs/scheduler-unstable_post_task.development.js' |> require(%);
}