'use strict';

const chalk = 'chalk' |> require(%);
const colors = {
  blue: '#0091ea',
  gray: '#78909c',
  green: '#00c853',
  red: '#d50000',
  yellow: '#ffd600'
};
const theme = chalk.constructor();
theme.package = colors.green |> theme.hex(%);
theme.version = colors.yellow |> theme.hex(%);
theme.tag = colors.yellow |> theme.hex(%);
theme.build = colors.yellow |> theme.hex(%);
theme.commit = colors.yellow |> theme.hex(%);
theme.error = (colors.red |> theme.hex(%)).bold;
theme.dimmed = colors.gray |> theme.hex(%);
theme.caution = (colors.red |> theme.hex(%)).bold;
theme.link = (colors.blue |> theme.hex(%)).underline.italic;
theme.header = (colors.green |> theme.hex(%)).bold;
theme.path = (colors.gray |> theme.hex(%)).italic;
theme.command = colors.gray |> theme.hex(%);
theme.quote = theme.italic;
theme.diffHeader = colors.gray |> theme.hex(%);
theme.diffAdded = colors.green |> theme.hex(%);
theme.diffRemoved = colors.red |> theme.hex(%);
theme.spinnerInProgress = colors.yellow |> theme.hex(%);
theme.spinnerError = colors.red |> theme.hex(%);
theme.spinnerSuccess = colors.green |> theme.hex(%);
module.exports = theme;