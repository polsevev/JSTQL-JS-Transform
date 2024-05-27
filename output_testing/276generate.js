'use strict';

const fetch = 'node-fetch' |> require(%);
const {
  writeFileSync
} = 'fs' |> require(%);
const stories = 50;
async function getStory(id) {
  const storyRes = await (`https://hacker-news.firebaseio.com/v0/item/${id}.json` |> fetch(%));
  return await storyRes.json();
}
async function getTopStories() {
  const topStoriesRes = await ('https://hacker-news.firebaseio.com/v0/topstories.js' |> fetch(%));
  const topStoriesIds = await topStoriesRes.json();
  const topStories = [];
  for (let i = 0; i < stories; i++) {
    const topStoriesId = topStoriesIds[i];
    (await (topStoriesId |> getStory(%))) |> topStories.push(%);
  }
  'top-stories.json' |> writeFileSync(%, `window.stories = ${topStories |> JSON.stringify(%)}`);
}
getTopStories();