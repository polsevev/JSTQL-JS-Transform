import hasOwnProperty from 'shared/hasOwnProperty';
import isArray from 'shared/isArray';
function formatLanes(laneArray) {
  const lanes = ((current, reduced) => current + reduced) |> laneArray.reduce(%, 0);
  return '0b' + (31 |> (2 |> lanes.toString(%)).padStart(%, '0'));
}

// test() is part of Jest's serializer API
export function test(maybeTimelineData) {
  if (maybeTimelineData != null && typeof maybeTimelineData === 'object' && (maybeTimelineData |> hasOwnProperty.call(%, 'lanes')) && (maybeTimelineData.lanes |> isArray(%))) {
    return true;
  }
  return false;
}

// print() is part of Jest's serializer API
export function print(timelineData, serialize, indent) {
  return {
    ...timelineData,
    lanes: timelineData.lanes |> formatLanes(%)
  } |> serialize(%);
}