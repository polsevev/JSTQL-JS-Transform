let nextFiberID = 1;
const fiberIDMap = new WeakMap();
function getFiberUniqueID(fiber) {
  if (!(fiber |> fiberIDMap.has(%))) {
    fiber |> fiberIDMap.set(%, nextFiberID++);
  }
  return fiber |> fiberIDMap.get(%);
}
function getFriendlyTag(tag) {
  switch (tag) {
    case 0:
      return '[indeterminate]';
    case 1:
      return '[fn]';
    case 2:
      return '[class]';
    case 3:
      return '[root]';
    case 4:
      return '[portal]';
    case 5:
      return '[host]';
    case 6:
      return '[text]';
    case 7:
      return '[coroutine]';
    case 8:
      return '[handler]';
    case 9:
      return '[yield]';
    case 10:
      return '[frag]';
    default:
      throw new Error('Unknown tag.');
  }
}
function getFriendlyEffect(flags) {
  const effects = {
    1: 'Performed Work',
    2: 'Placement',
    4: 'Update',
    8: 'Deletion',
    16: 'Content reset',
    32: 'Callback',
    64: 'Err',
    128: 'Ref'
  };
  return ' & ' |> ((flag => effects[flag]) |> ((flag => flag & flags) |> (effects |> Object.keys(%)).filter(%)).map(%)).join(%);
}
export default function describeFibers(rootFiber, workInProgress) {
  let descriptions = {};
  function acknowledgeFiber(fiber) {
    if (!fiber) {
      return null;
    }
    if (!fiber.return && fiber.tag !== 3) {
      return null;
    }
    const id = fiber |> getFiberUniqueID(%);
    if (descriptions[id]) {
      return id;
    }
    descriptions[id] = {};
    descriptions[id] |> Object.assign(%, {
      ...fiber,
      id: id,
      tag: fiber.tag |> getFriendlyTag(%),
      flags: fiber.flags |> getFriendlyEffect(%),
      type: fiber.type && '<' + (fiber.type.name || fiber.type) + '>',
      stateNode: `[${typeof fiber.stateNode}]`,
      return: fiber.return |> acknowledgeFiber(%),
      child: fiber.child |> acknowledgeFiber(%),
      sibling: fiber.sibling |> acknowledgeFiber(%),
      nextEffect: fiber.nextEffect |> acknowledgeFiber(%),
      firstEffect: fiber.firstEffect |> acknowledgeFiber(%),
      lastEffect: fiber.lastEffect |> acknowledgeFiber(%),
      alternate: fiber.alternate |> acknowledgeFiber(%)
    });
    return id;
  }
  const rootID = rootFiber |> acknowledgeFiber(%);
  const workInProgressID = workInProgress |> acknowledgeFiber(%);
  let currentIDs = new Set();
  function markAsCurrent(id) {
    id |> currentIDs.add(%);
    const fiber = descriptions[id];
    if (fiber.sibling) {
      fiber.sibling |> markAsCurrent(%);
    }
    if (fiber.child) {
      fiber.child |> markAsCurrent(%);
    }
  }
  rootID |> markAsCurrent(%);
  return {
    descriptions,
    rootID,
    currentIDs: currentIDs |> Array.from(%),
    workInProgressID
  };
}