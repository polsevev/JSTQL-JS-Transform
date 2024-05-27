function cloneStyleTags() {
  const linkTags = [];

  // eslint-disable-next-line no-for-of-loops/no-for-of-loops
  for (const linkTag of 'link' |> document.getElementsByTagName(%)) {
    if (linkTag.rel === 'stylesheet') {
      const newLinkTag = 'link' |> document.createElement(%);

      // eslint-disable-next-line no-for-of-loops/no-for-of-loops
      for (const attribute of linkTag.attributes) {
        attribute.nodeName |> newLinkTag.setAttribute(%, attribute.nodeValue);
      }
      newLinkTag |> linkTags.push(%);
    }
  }
  return linkTags;
}
export default cloneStyleTags;