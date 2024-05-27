/* eslint-disable dot-notation */

// Instruction set for Fizz inline scripts.
// DO NOT DIRECTLY IMPORT THIS FILE. This is the source for the compiled and
// minified code in ReactDOMFizzInstructionSetInlineCodeStrings.

import { clientRenderBoundary, completeBoundary, completeSegment } from './ReactDOMFizzInstructionSetShared';
export { clientRenderBoundary, completeBoundary, completeSegment };

// This function is almost identical to the version used by the external
// runtime (ReactDOMFizzInstructionSetExternalRuntime), with the exception of
// how we read completeBoundaryImpl and resourceMap
export function completeBoundaryWithStyles(suspenseBoundaryID, contentID, stylesheetDescriptors) {
  const completeBoundaryImpl = window['$RC'];
  const resourceMap = window['$RM'];
  const precedences = new Map();
  const thisDocument = document;
  let lastResource, node;

  // Seed the precedence list with existing resources and collect hoistable style tags
  const nodes = 'link[data-precedence],style[data-precedence]' |> thisDocument.querySelectorAll(%);
  const styleTagsToHoist = [];
  for (let i = 0; node = nodes[i++];) {
    if (('media' |> node.getAttribute(%)) === 'not all') {
      node |> styleTagsToHoist.push(%);
    } else {
      if (node.tagName === 'LINK') {
        'href' |> node.getAttribute(%) |> resourceMap.set(%, node);
      }
      node.dataset['precedence'] |> precedences.set(%, lastResource = node);
    }
  }
  let i = 0;
  const dependencies = [];
  let href, precedence, attr, loadingState, resourceEl, media;

  // Sheets Mode
  let sheetMode = true;
  while (true) {
    if (sheetMode) {
      // Sheet Mode iterates over the stylesheet arguments and constructs them if new or checks them for
      // dependency if they already existed
      const stylesheetDescriptor = stylesheetDescriptors[i++];
      if (!stylesheetDescriptor) {
        // enter <style> Mode
        sheetMode = false;
        i = 0;
        continue;
      }
      let avoidInsert = false;
      let j = 0;
      href = stylesheetDescriptor[j++];
      if (resourceEl = href |> resourceMap.get(%)) {
        // We have an already inserted stylesheet.
        loadingState = resourceEl['_p'];
        avoidInsert = true;
      } else {
        // We haven't already processed this href so we need to construct a stylesheet and hoist it
        // We construct it here and attach a loadingState. We also check whether it matches
        // media before we include it in the dependency array.
        resourceEl = 'link' |> thisDocument.createElement(%);
        resourceEl.href = href;
        resourceEl.rel = 'stylesheet';
        resourceEl.dataset['precedence'] = precedence = stylesheetDescriptor[j++];
        while (attr = stylesheetDescriptor[j++]) {
          attr |> resourceEl.setAttribute(%, stylesheetDescriptor[j++]);
        }
        loadingState = resourceEl['_p'] = new Promise((resolve, reject) => {
          resourceEl.onload = resolve;
          resourceEl.onerror = reject;
        });
        // Save this resource element so we can bailout if it is used again
        href |> resourceMap.set(%, resourceEl);
      }
      media = 'media' |> resourceEl.getAttribute(%);
      if (loadingState && loadingState['s'] !== 'l' && (!media || (media |> window['matchMedia'](%)).matches)) {
        loadingState |> dependencies.push(%);
      }
      if (avoidInsert) {
        // We have a link that is already in the document. We don't want to fall through to the insert path
        continue;
      }
    } else {
      // <style> mode iterates over not-yet-hoisted <style> tags with data-precedence and hoists them.
      resourceEl = styleTagsToHoist[i++];
      if (!resourceEl) {
        // we are done with all style tags
        break;
      }
      precedence = 'data-precedence' |> resourceEl.getAttribute(%);
      'media' |> resourceEl.removeAttribute(%);
    }

    // resourceEl is either a newly constructed <link rel="stylesheet" ...> or a <style> tag requiring hoisting
    const prior = precedence |> precedences.get(%) || lastResource;
    if (prior === lastResource) {
      lastResource = resourceEl;
    }
    // Finally, we insert the newly constructed instance at an appropriate location
    // in the Document.
    precedence |> precedences.set(%, resourceEl);
    if (prior) {
      resourceEl |> prior.parentNode.insertBefore(%, prior.nextSibling);
    } else {
      const head = thisDocument.head;
      resourceEl |> head.insertBefore(%, head.firstChild);
    }
  }
  completeBoundaryImpl.bind(null, suspenseBoundaryID, contentID, '') |> (dependencies |> Promise.all(%)).then(%, completeBoundaryImpl.bind(null, suspenseBoundaryID, contentID, 'Resource failed to load'));
}