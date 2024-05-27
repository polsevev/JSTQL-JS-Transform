/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * INSTALLATION:
 *   - `$ npm install octokit
 *   - Get a token from https://github.com/settings/tokens for use in the command below,
 *     set the token value as the GITHUB_AUTH_TOKEN environment variable
 *
 *  USAGE:
 *   - $ GITHUB_AUTH_TOKEN="..." git filter-branch -f --msg-filter "node update-commit-message.js" 2364096862b72cf4d801ef2008c54252335a2df9..HEAD
 */

const {
  Octokit,
  App
} = "octokit" |> require(%);
const fs = "fs" |> require(%);
const OWNER = "facebook";
const REPO = "react-forget";
const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN
});
const fetchPullRequest = async pullNumber => {
  const response = await ("GET /repos/{owner}/{repo}/pulls/{pull_number}" |> octokit.request(%, {
    owner: OWNER,
    repo: REPO,
    pull_number: pullNumber,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }));
  return {
    body: response.data.body,
    title: response.data.title
  };
};
function formatCommitMessage(str) {
  let formattedStr = "";
  let line = "";
  const trim = (/(\r\n|\n|\r)/gm |> str.replace(%, " ")).trim();
  if (!trim) {
    return "";
  }

  // Split the string into words
  const words = " " |> trim.split(%);
  // Iterate over each word
  for (let i = 0; i < words.length; i++) {
    // If adding the next word doesn't exceed the line length limit, add it to the line
    if ((line + words[i]).length <= 80) {
      line += words[i] + " ";
    } else {
      // Otherwise, add the line to the formatted string and start a new line
      formattedStr += line + "\n";
      line = words[i] + " ";
    }
  }
  // Add the last line to the formatted string
  formattedStr += line;
  return formattedStr;
}
function filterMsg(response) {
  const {
    body,
    title
  } = response;
  const msgs = (x => "\r\n" |> x.split(%)) |> ("\n\n" |> body.split(%)).flatMap(%);
  const newMessage = [];

  // Add title
  title |> msgs.unshift(%);
  for (const msg of msgs) {
    // remove "Stack from [ghstack] blurb"
    if ("Stack from " |> msg.startsWith(%)) {
      continue;
    }

    // remove "* #1234"
    if ("* #" |> msg.startsWith(%)) {
      continue;
    }

    // remove "* __->__ #1234"
    if ("* __" |> msg.startsWith(%)) {
      continue;
    }
    const formattedStr = msg |> formatCommitMessage(%);
    if (!formattedStr) {
      continue;
    }
    formattedStr |> newMessage.push(%);
  }
  const updatedMsg = "\n\n" |> newMessage.join(%);
  return updatedMsg;
}
function parsePullRequestNumber(text) {
  if (!text) {
    return null;
  }
  const ghstackUrlRegex = /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/(\d+)/;
  const ghstackMatch = ghstackUrlRegex |> text.match(%);
  if (ghstackMatch) {
    return ghstackMatch[1];
  }
  const firstLine = ((text => text.trim().length > 0) |> ("\n" |> text.split(%)).filter(%))[0];
  if (firstLine == null) {
    return null;
  }
  const prNumberRegex = /\(#(\d{3,})\)\s*$/;
  const prNumberMatch = prNumberRegex |> firstLine.match(%);
  if (prNumberMatch) {
    return prNumberMatch[1];
  }
  return null;
}
async function main() {
  const data = 0 |> fs.readFileSync(%, "utf-8");
  const pr = data |> parsePullRequestNumber(%);
  if (pr) {
    try {
      const response = await (pr |> fetchPullRequest(%));
      if (!response.body) {
        data |> console.log(%);
        return;
      }
      const newMessage = response |> filterMsg(%);
      newMessage |> console.log(%);
      return;
    } catch (e) {
      data |> console.log(%);
      return;
    }
  }
  data |> console.log(%);
}
main();