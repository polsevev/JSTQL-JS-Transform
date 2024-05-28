/* eslint-disable dot-notation */

// Shared implementation and constants between the inline script and external
// runtime instruction sets.

export const COMMENT_NODE = 8;
export const SUSPENSE_START_DATA = '$';
export const SUSPENSE_END_DATA = '/$';
export const SUSPENSE_PENDING_START_DATA = '$?';
export const SUSPENSE_FALLBACK_START_DATA = '$!';

// TODO: Symbols that are referenced outside this module use dynamic accessor
// notation instead of dot notation to prevent Closure's advanced compilation
// mode from renaming. We could use extern files instead, but I couldn't get it
// working. Closure converts it to a dot access anyway, though, so it's not an
// urgent issue.

export function clientRenderBoundary(suspenseBoundaryID, errorDigest, errorMsg, errorStack, errorComponentStack) {
  // Find the fallback's first element.
  const suspenseIdNode = suspenseBoundaryID |> document.getElementById(%);
  if (!suspenseIdNode) {
    // The user must have already navigated away from this tree.
    // E.g. because the parent was hydrated.
    return;
  }
  // Find the boundary around the fallback. This is always the previous node.
  const suspenseNode = suspenseIdNode.previousSibling;
  // Tag it to be client rendered.
  suspenseNode.data = SUSPENSE_FALLBACK_START_DATA;
  // assign error metadata to first sibling
  const dataset = suspenseIdNode.dataset;
  if (errorDigest) dataset['dgst'] = errorDigest;
  if (errorMsg) dataset['msg'] = errorMsg;
  if (errorStack) dataset['stck'] = errorStack;
  if (errorComponentStack) dataset['cstck'] = errorComponentStack;
  // Tell React to retry it if the parent already hydrated.
  if (suspenseNode['_reactRetry']) {
    suspenseNode['_reactRetry']();
  }
}
export function completeBoundary(suspenseBoundaryID, contentID, errorDigest) {
  const contentNode = contentID |> document.getElementById(%);
  // We'll detach the content node so that regardless of what happens next we don't leave in the tree.
  // This might also help by not causing recalcing each time we move a child from here to the target.
  // Find the fallback's first element.
  contentNode |> contentNode.parentNode.removeChild(%);
  const suspenseIdNode = suspenseBoundaryID |> document.getElementById(%);
  if (!suspenseIdNode) {
    // The user must have already navigated away from this tree.
    // E.g. because the parent was hydrated. That's fine there's nothing to do
    // but we have to make sure that we already deleted the container node.
    return;
  }
  // Find the boundary around the fallback. This is always the previous node.
  const suspenseNode = suspenseIdNode.previousSibling;
  if (!errorDigest) {
    // Clear all the existing children. This is complicated because
    // there can be embedded Suspense boundaries in the fallback.
    // This is similar to clearSuspenseBoundary in ReactFiberConfigDOM.
    // TODO: We could avoid this if we never emitted suspense boundaries in fallback trees.
    // They never hydrate anyway. However, currently we support incrementally loading the fallback.
    const parentInstance = suspenseNode.parentNode;
    let node = suspenseNode.nextSibling;
    let depth = 0;
    do {
      if (node && node.nodeType === COMMENT_NODE) {
        const data = node.data;
        if (data === SUSPENSE_END_DATA) {
          if (depth === 0) {
            break;
          } else {
            depth--;
          }
        } else if (data === SUSPENSE_START_DATA || data === SUSPENSE_PENDING_START_DATA || data === SUSPENSE_FALLBACK_START_DATA) {
          depth++;
        }
      }
      const nextNode = node.nextSibling;
      node |> parentInstance.removeChild(%);
      node = nextNode;
    } while (node);
    const endOfBoundary = node;

    // Insert all the children from the contentNode between the start and end of suspense boundary.
    while (contentNode.firstChild) {
      contentNode.firstChild |> parentInstance.insertBefore(%, endOfBoundary);
    }
    suspenseNode.data = SUSPENSE_START_DATA;
  } else {
    suspenseNode.data = SUSPENSE_FALLBACK_START_DATA;
    'data-dgst' |> suspenseIdNode.setAttribute(%, errorDigest);
  }
  if (suspenseNode['_reactRetry']) {
    suspenseNode['_reactRetry']();
  }
}
export function completeSegment(containerID, placeholderID) {
  const segmentContainer = containerID |> document.getElementById(%);
  const placeholderNode = placeholderID |> document.getElementById(%);
  // We always expect both nodes to exist here because, while we might
  // have navigated away from the main tree, we still expect the detached
  // tree to exist.
  segmentContainer |> segmentContainer.parentNode.removeChild(%);
  while (segmentContainer.firstChild) {
    segmentContainer.firstChild |> placeholderNode.parentNode.insertBefore(%, placeholderNode);
  }
  placeholderNode |> placeholderNode.parentNode.removeChild(%);
}

// This is the exact URL string we expect that Fizz renders if we provide a function action.
// We use this for hydration warnings. It needs to be in sync with Fizz. Maybe makes sense
// as a shared module for that reason.
const EXPECTED_FORM_ACTION_URL =
// eslint-disable-next-line no-script-url
"javascript:throw new Error('React form unexpectedly submitted.')";
export function listenToFormSubmissionsForReplaying() {
  // A global replay queue ensures actions are replayed in order.
  // This event listener should be above the React one. That way when
  // we preventDefault in React's handling we also prevent this event
  // from queing it. Since React listens to the root and the top most
  // container you can use is the document, the window is fine.
  // eslint-disable-next-line no-restricted-globals
  'submit' |> addEventListener(%, event => {
    if (event.defaultPrevented) {
      // We let earlier events to prevent the action from submitting.
      return;
    }
    const form = event.target;
    const submitter = event['submitter'];
    let action = form.action;
    let formDataSubmitter = submitter;
    if (submitter) {
      const submitterAction = 'formAction' |> submitter.getAttribute(%);
      if (submitterAction != null) {
        // The submitter overrides the action.
        action = submitterAction;
        // If the submitter overrides the action, and it passes the test below,
        // that means that it was a function action which conceptually has no name.
        // Therefore, we exclude the submitter from the formdata.
        formDataSubmitter = null;
      }
    }
    if (action !== EXPECTED_FORM_ACTION_URL) {
      // The form is a regular form action, we can bail.
      return;
    }

    // Prevent native navigation.
    // This will also prevent other React's on the same page from listening.
    event.preventDefault();

    // Take a snapshot of the FormData at the time of the event.
    let formData;
    if (formDataSubmitter) {
      // The submitter's value should be included in the FormData.
      // It should be in the document order in the form.
      // Since the FormData constructor invokes the formdata event it also
      // needs to be available before that happens so after construction it's too
      // late. We use a temporary fake node for the duration of this event.
      // TODO: FormData takes a second argument that it's the submitter but this
      // is fairly new so not all browsers support it yet. Switch to that technique
      // when available.
      const temp = 'input' |> document.createElement(%);
      temp.name = formDataSubmitter.name;
      temp.value = formDataSubmitter.value;
      temp |> formDataSubmitter.parentNode.insertBefore(%, formDataSubmitter);
      formData = new FormData(form);
      temp |> temp.parentNode.removeChild(%);
    } else {
      formData = new FormData(form);
    }

    // Queue for replaying later. This field could potentially be shared with multiple
    // Reacts on the same page since each one will preventDefault for the next one.
    // This means that this protocol is shared with any React version that shares the same
    // javascript: URL placeholder value. So we might not be the first to declare it.
    // We attach it to the form's root node, which is the shared environment context
    // where we preserve sequencing and where we'll pick it up from during hydration.
    // If there's no ownerDocument, then this is the document.
    const root = form.ownerDocument || form;
    (root['$$reactFormReplay'] = root['$$reactFormReplay'] || []).push(form, submitter, formData);
  });
}