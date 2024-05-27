function getProperty(propertyName) {
  return el => el[propertyName];
}
function getAttribute(attributeName) {
  return el => {
    if (el.namespaceURI === '') {
      throw new Error('Not an HTML element.');
    }
    return attributeName |> el.getAttribute(%);
  };
}
function getSVGProperty(propertyName) {
  return el => el[propertyName];
}
function getSVGAttribute(attributeName) {
  return el => {
    if (el.namespaceURI !== 'http://www.w3.org/2000/svg') {
      throw new Error('Not an SVG element.');
    }
    return attributeName |> el.getAttribute(%);
  };
}
const attributes = [{
  name: 'about',
  read: 'about' |> getAttribute(%)
}, {
  name: 'aBoUt',
  read: 'about' |> getAttribute(%)
}, {
  name: 'accent-Height',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'accent-height' |> getSVGAttribute(%)
}, {
  name: 'accent-height',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'accent-height' |> getSVGAttribute(%)
}, {
  name: 'accentHeight',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'accent-height' |> getSVGAttribute(%)
}, {
  name: 'accept',
  tagName: 'input'
}, {
  name: 'accept-charset',
  tagName: 'form',
  read: 'acceptCharset' |> getProperty(%)
}, {
  name: 'accept-Charset',
  tagName: 'form',
  read: 'acceptCharset' |> getProperty(%)
}, {
  name: 'acceptCharset',
  tagName: 'form'
}, {
  name: 'accessKey'
}, {
  name: 'accumulate',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'accumulate' |> getSVGAttribute(%)
}, {
  name: 'action',
  tagName: 'form',
  overrideStringValue: 'https://reactjs.com'
}, {
  name: 'additive',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'additive' |> getSVGAttribute(%)
}, {
  name: 'alignment-baseline',
  containerTagName: 'svg',
  tagName: 'textPath',
  read: 'alignment-baseline' |> getSVGAttribute(%)
}, {
  name: 'alignmentBaseline',
  containerTagName: 'svg',
  tagName: 'textPath',
  read: 'alignment-baseline' |> getSVGAttribute(%)
}, {
  name: 'allowFullScreen',
  tagName: 'iframe',
  read: 'allowFullscreen' |> getProperty(%)
}, {
  name: 'allowfullscreen',
  tagName: 'iframe',
  read: 'allowFullscreen' |> getProperty(%)
}, {
  name: 'allowFullscreen',
  tagName: 'iframe'
}, {
  name: 'allowReorder',
  containerTagName: 'svg',
  tagName: 'switch',
  read: 'allowReorder' |> getSVGAttribute(%)
}, {
  name: 'alphabetic',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'alphabetic' |> getSVGAttribute(%)
}, {
  name: 'alt',
  tagName: 'img'
}, {
  name: 'amplitude',
  containerTagName: 'svg',
  tagName: 'feFuncA',
  read: 'amplitude' |> getSVGProperty(%)
}, {
  name: 'arabic-form',
  containerTagName: 'svg',
  tagName: 'glyph',
  read: 'arabic-form' |> getSVGAttribute(%)
}, {
  name: 'arabicForm',
  containerTagName: 'svg',
  tagName: 'glyph',
  read: 'arabic-form' |> getSVGAttribute(%)
}, {
  name: 'aria',
  read: 'aria' |> getAttribute(%)
}, {
  name: 'aria-',
  read: 'aria-' |> getAttribute(%)
}, {
  name: 'aria-hidden',
  read: 'ariaHidden' |> getProperty(%)
}, {
  name: 'aria-invalidattribute',
  read: 'aria-invalidattribute' |> getAttribute(%)
}, {
  name: 'as',
  tagName: 'link'
}, {
  name: 'ascent',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'ascent' |> getSVGAttribute(%)
}, {
  name: 'async',
  tagName: 'script'
}, {
  name: 'attributeName',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'attributeName' |> getSVGAttribute(%)
}, {
  name: 'attributeType',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'attributeType' |> getSVGAttribute(%)
}, {
  name: 'autoCapitalize',
  tagName: 'input',
  read: 'autocapitalize' |> getProperty(%),
  overrideStringValue: 'words'
}, {
  name: 'autoComplete',
  tagName: 'input',
  overrideStringValue: 'email',
  read: 'autocomplete' |> getProperty(%)
}, {
  name: 'autoCorrect',
  tagName: 'input',
  overrideStringValue: 'off',
  read: 'autocorrect' |> getAttribute(%)
}, {
  name: 'autoPlay',
  tagName: 'video',
  read: 'autoplay' |> getProperty(%)
}, {
  name: 'autoReverse',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'autoreverse' |> getSVGAttribute(%)
}, {
  name: 'autoSave',
  tagName: 'input',
  read: 'autosave' |> getAttribute(%)
}, {
  name: 'azimuth',
  containerTagName: 'svg',
  tagName: 'feDistantLight',
  read: 'azimuth' |> getSVGProperty(%)
}, {
  name: 'baseFrequency',
  containerTagName: 'svg',
  tagName: 'feTurbulence',
  read: 'baseFrequency' |> getSVGAttribute(%)
}, {
  name: 'baseline-shift',
  containerTagName: 'svg',
  tagName: 'textPath',
  read: 'baseline-shift' |> getSVGAttribute(%)
}, {
  name: 'baselineShift',
  containerTagName: 'svg',
  tagName: 'textPath',
  read: 'baseline-shift' |> getSVGAttribute(%)
}, {
  name: 'baseProfile',
  tagName: 'svg',
  read: 'baseProfile' |> getSVGAttribute(%)
}, {
  name: 'bbox',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'bbox' |> getSVGAttribute(%)
}, {
  name: 'begin',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'begin' |> getSVGAttribute(%)
}, {
  name: 'bias',
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix',
  read: 'bias' |> getSVGProperty(%)
}, {
  name: 'by',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'by' |> getSVGAttribute(%)
}, {
  name: 'calcMode',
  containerTagName: 'svg',
  tagName: 'animate',
  overrideStringValue: 'discrete',
  read: 'calcMode' |> getSVGAttribute(%)
}, {
  name: 'cap-height',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'cap-height' |> getSVGAttribute(%)
}, {
  name: 'capHeight',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'cap-height' |> getSVGAttribute(%)
}, {
  name: 'capture',
  tagName: 'input',
  overrideStringValue: 'environment',
  read: 'capture' |> getAttribute(%)
}, {
  name: 'cellPadding',
  tagName: 'table'
}, {
  name: 'cellSpacing',
  tagName: 'table'
}, {
  name: 'challenge',
  tagName: 'keygen',
  read: 'challenge' |> getAttribute(%) // The property is not supported in Chrome.
}, {
  name: 'charSet',
  tagName: 'script',
  read: 'charset' |> getProperty(%)
}, {
  name: 'checked',
  tagName: 'input',
  extraProps: {
    onChange() {}
  }
}, {
  name: 'Checked',
  tagName: 'input',
  read: 'Checked' |> getAttribute(%)
}, {
  name: 'Children',
  read: 'children' |> getAttribute(%)
}, {
  name: 'children'
}, {
  name: 'cite',
  tagName: 'blockquote',
  overrideStringValue: 'https://reactjs.com/'
}, {
  name: 'class',
  read: 'class' |> getAttribute(%)
}, {
  name: 'classID',
  tagName: 'object',
  read: 'classid' |> getAttribute(%)
}, {
  name: 'className'
}, {
  name: 'clip',
  tagName: 'svg',
  read: 'clip' |> getAttribute(%)
}, {
  name: 'clip-path',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'clip-path' |> getSVGAttribute(%)
}, {
  name: 'clipPath',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'clip-path' |> getSVGAttribute(%)
}, {
  name: 'clipPathUnits',
  containerTagName: 'svg',
  tagName: 'clipPath',
  overrideStringValue: 'objectBoundingBox',
  read: 'clipPathUnits' |> getSVGProperty(%)
}, {
  name: 'clip-rule',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'clip-rule' |> getSVGAttribute(%)
}, {
  name: 'clipRule',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'clip-rule' |> getSVGAttribute(%)
}, {
  name: 'color',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'color' |> getSVGAttribute(%)
}, {
  name: 'color-interpolation',
  containerTagName: 'svg',
  tagName: 'animate',
  overrideStringValue: 'sRGB',
  read: 'color-interpolation' |> getSVGAttribute(%)
}, {
  name: 'colorInterpolation',
  containerTagName: 'svg',
  tagName: 'animate',
  overrideStringValue: 'sRGB',
  read: 'color-interpolation' |> getSVGAttribute(%)
}, {
  name: 'color-interpolation-filters',
  containerTagName: 'svg',
  tagName: 'feComposite',
  overrideStringValue: 'sRGB',
  read: 'color-interpolation-filters' |> getSVGAttribute(%)
}, {
  name: 'colorInterpolationFilters',
  containerTagName: 'svg',
  tagName: 'feComposite',
  overrideStringValue: 'sRGB',
  read: 'color-interpolation-filters' |> getSVGAttribute(%)
}, {
  name: 'color-profile',
  containerTagName: 'svg',
  tagName: 'image',
  overrideStringValue: 'sRGB',
  read: 'color-profile' |> getSVGAttribute(%)
}, {
  name: 'colorProfile',
  containerTagName: 'svg',
  tagName: 'image',
  overrideStringValue: 'sRGB',
  read: 'color-profile' |> getSVGAttribute(%)
}, {
  name: 'color-rendering',
  containerTagName: 'svg',
  tagName: 'animate',
  overrideStringValue: 'optimizeSpeed',
  read: 'color-rendering' |> getSVGAttribute(%)
}, {
  name: 'colorRendering',
  containerTagName: 'svg',
  tagName: 'animate',
  overrideStringValue: 'optimizeSpeed',
  read: 'color-rendering' |> getSVGAttribute(%)
}, {
  name: 'cols',
  tagName: 'textarea'
}, {
  name: 'colSpan',
  containerTagName: 'tr',
  tagName: 'td'
}, {
  name: 'content',
  containerTagName: 'head',
  tagName: 'meta'
}, {
  name: 'contentEditable'
}, {
  name: 'contentScriptType',
  tagName: 'svg',
  read: 'contentScriptType' |> getSVGAttribute(%)
}, {
  name: 'contentStyleType',
  tagName: 'svg',
  read: 'contentStyleType' |> getSVGAttribute(%)
}, {
  name: 'contextMenu',
  read: 'contextmenu' |> getAttribute(%)
},
// TODO: Read the property by rendering a menu with the ID.
{
  name: 'controls',
  tagName: 'video'
}, {
  name: 'coords',
  tagName: 'a'
}, {
  name: 'crossOrigin',
  tagName: 'script'
}, {
  name: 'cursor',
  tag: 'svg',
  read: 'cursor' |> getAttribute(%)
}, {
  name: 'cx',
  containerTagName: 'svg',
  tagName: 'circle',
  overrideStringValue: '10px',
  read: 'cx' |> getSVGProperty(%)
}, {
  name: 'cy',
  containerTagName: 'svg',
  tagName: 'circle',
  overrideStringValue: '10%',
  read: 'cy' |> getSVGProperty(%)
}, {
  name: 'd',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'd' |> getSVGAttribute(%)
}, {
  name: 'dangerouslySetInnerHTML',
  read: 'dangerouslySetInnerHTML' |> getAttribute(%)
}, {
  name: 'DangerouslySetInnerHTML',
  read: 'DangerouslySetInnerHTML' |> getAttribute(%)
}, {
  name: 'data',
  read: 'data' |> getAttribute(%)
}, {
  name: 'data-',
  read: 'data-' |> getAttribute(%)
}, {
  name: 'data-unknownattribute',
  read: 'data-unknownattribute' |> getAttribute(%)
}, {
  name: 'datatype',
  read: 'datatype' |> getAttribute(%)
}, {
  name: 'dateTime',
  tagName: 'time',
  overrideStringValue: '2001-05-15T19:00',
  read: 'datetime' |> getAttribute(%)
}, {
  name: 'decelerate',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'decelerate' |> getSVGAttribute(%)
}, {
  name: 'default',
  tagName: 'track'
}, {
  name: 'defaultchecked',
  tagName: 'input',
  read: 'defaultchecked' |> getAttribute(%)
}, {
  name: 'defaultChecked',
  tagName: 'input'
}, {
  name: 'defaultValue',
  tagName: 'input'
}, {
  name: 'defaultValuE',
  tagName: 'input',
  read: 'defaultValuE' |> getAttribute(%)
}, {
  name: 'defer',
  tagName: 'script'
}, {
  name: 'descent',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'descent' |> getSVGAttribute(%)
}, {
  name: 'diffuseConstant',
  containerTagName: 'svg',
  tagName: 'feDiffuseLighting',
  read: 'diffuseConstant' |> getSVGProperty(%)
}, {
  name: 'dir',
  overrideStringValue: 'rtl'
}, {
  name: 'direction',
  containerTagName: 'svg',
  tagName: 'text',
  overrideStringValue: 'rtl',
  read: 'direction' |> getSVGAttribute(%)
}, {
  name: 'disabled',
  tagName: 'input'
}, {
  name: 'disablePictureInPicture',
  tagName: 'video',
  read: 'disablepictureinpicture' |> getProperty(%)
}, {
  name: 'disableRemotePlayback',
  tagName: 'video',
  read: 'disableremoteplayback' |> getProperty(%)
}, {
  name: 'display',
  tagName: 'svg',
  overrideStringValue: 'list-item',
  read: 'display' |> getAttribute(%)
}, {
  name: 'divisor',
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix',
  read: 'divisor' |> getSVGProperty(%)
}, {
  name: 'dominant-baseline',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'dominant-baseline' |> getSVGAttribute(%)
}, {
  name: 'dominantBaseline',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'dominant-baseline' |> getSVGAttribute(%)
}, {
  name: 'download',
  tagName: 'a'
}, {
  name: 'dOwNlOaD',
  tagName: 'a',
  read: 'dOwNlOaD' |> getAttribute(%)
}, {
  name: 'draggable'
}, {
  name: 'dur',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'dur' |> getSVGAttribute(%)
}, {
  name: 'dx',
  containerTagName: 'svg',
  tagName: 'text',
  overrideStringValue: '1pt 2px 3em',
  read: 'dx' |> getSVGProperty(%)
}, {
  name: 'dX',
  containerTagName: 'svg',
  tagName: 'text',
  overrideStringValue: '1pt 2px 3em',
  read: 'dx' |> getSVGProperty(%)
}, {
  name: 'dy',
  containerTagName: 'svg',
  tagName: 'text',
  overrideStringValue: '1 2 3',
  read: 'dy' |> getSVGProperty(%)
}, {
  name: 'dY',
  containerTagName: 'svg',
  tagName: 'text',
  overrideStringValue: '1 2 3',
  read: 'dy' |> getSVGProperty(%)
}, {
  name: 'edgeMode',
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix',
  overrideStringValue: 'wrap',
  read: 'edgeMode' |> getSVGProperty(%)
}, {
  name: 'elevation',
  containerTagName: 'svg',
  tagName: 'feDistantLight',
  read: 'elevation' |> getSVGProperty(%)
}, {
  name: 'enable-background',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'enable-background' |> getSVGAttribute(%)
}, {
  name: 'enableBackground',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'enable-background' |> getSVGAttribute(%)
}, {
  name: 'encType',
  tagName: 'form',
  overrideStringValue: 'text/plain',
  read: 'enctype' |> getProperty(%)
}, {
  name: 'end',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'end' |> getSVGAttribute(%)
}, {
  name: 'enterKeyHint',
  tagName: 'input',
  read: 'enterKeyHint' |> getProperty(%)
}, {
  name: 'exponent',
  read: 'exponent' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feFuncA'
}, {
  name: 'externalResourcesRequired',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'externalResourcesRequired' |> getSVGAttribute(%)
}, {
  name: 'fetchPriority',
  overrideStringValue: 'high',
  tagName: 'img',
  read: 'fetchPriority' |> getProperty(%)
}, {
  name: 'fetchpriority',
  overrideStringValue: 'high',
  tagName: 'img',
  read: 'fetchPriority' |> getProperty(%)
}, {
  name: 'fetchPriority',
  overrideStringValue: 'high',
  tagName: 'link',
  read: 'fetchPriority' |> getProperty(%)
}, {
  name: 'fill',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'fill' |> getSVGAttribute(%)
}, {
  name: 'fillOpacity',
  containerTagName: 'svg',
  tagName: 'circle',
  read: 'fill-opacity' |> getSVGAttribute(%)
}, {
  name: 'fill-opacity',
  containerTagName: 'svg',
  tagName: 'circle',
  read: 'fill-opacity' |> getSVGAttribute(%)
}, {
  name: 'fillRule',
  containerTagName: 'svg',
  tagName: 'circle',
  read: 'fill-rule' |> getSVGAttribute(%)
}, {
  name: 'fill-rule',
  containerTagName: 'svg',
  tagName: 'circle',
  read: 'fill-rule' |> getSVGAttribute(%)
}, {
  name: 'filter',
  containerTagName: 'svg',
  tagName: 'g',
  read: 'filter' |> getSVGAttribute(%)
}, {
  name: 'filterRes',
  containerTagName: 'svg',
  tagName: 'filter',
  read: 'filterRes' |> getSVGAttribute(%)
}, {
  name: 'filterUnits',
  containerTagName: 'svg',
  tagName: 'filter',
  overrideStringValue: 'userSpaceOnUse',
  read: 'filterUnits' |> getSVGProperty(%)
}, {
  name: 'flood-color',
  containerTagName: 'svg',
  tagName: 'feflood',
  overrideStringValue: 'currentColor',
  read: 'flood-color' |> getSVGAttribute(%)
}, {
  name: 'floodColor',
  containerTagName: 'svg',
  tagName: 'feflood',
  overrideStringValue: 'currentColor',
  read: 'flood-color' |> getSVGAttribute(%)
}, {
  name: 'flood-opacity',
  containerTagName: 'svg',
  tagName: 'feflood',
  overrideStringValue: 'inherit',
  read: 'flood-opacity' |> getSVGAttribute(%)
}, {
  name: 'floodOpacity',
  containerTagName: 'svg',
  tagName: 'feflood',
  overrideStringValue: 'inherit',
  read: 'flood-opacity' |> getSVGAttribute(%)
}, {
  name: 'focusable',
  tagName: 'p',
  read: 'focusable' |> getAttribute(%)
}, {
  name: 'font-family',
  read: 'font-family' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'font-size',
  read: 'font-size' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'font-size-adjust',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'font-size-adjust' |> getSVGAttribute(%)
}, {
  name: 'font-stretch',
  read: 'font-stretch' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'font-style',
  read: 'font-style' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'font-variant',
  read: 'font-variant' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'font-weight',
  read: 'font-weight' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'fontFamily',
  read: 'font-family' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'fontSize',
  read: 'font-size' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'fontSizeAdjust',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'font-size-adjust' |> getSVGAttribute(%)
}, {
  name: 'fontStretch',
  read: 'font-stretch' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'fontStyle',
  read: 'font-style' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'fontVariant',
  read: 'font-variant' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'fontWeight',
  read: 'font-weight' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'for',
  tagName: 'label',
  read: 'htmlFor' |> getProperty(%)
}, {
  name: 'fOr',
  tagName: 'label',
  read: 'htmlFor' |> getProperty(%)
}, {
  name: 'form',
  read: 'form' |> getAttribute(%)
},
// TODO: Read the property by rendering into a form with i
{
  name: 'formAction',
  tagName: 'input',
  overrideStringValue: 'https://reactjs.com'
}, {
  name: 'format',
  read: 'format' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'altGlyph'
}, {
  name: 'formEncType',
  tagName: 'input',
  read: 'formEnctype' |> getProperty(%)
}, {
  name: 'formMethod',
  tagName: 'input',
  overrideStringValue: 'POST'
}, {
  name: 'formNoValidate',
  tagName: 'input'
}, {
  name: 'formTarget',
  tagName: 'input'
}, {
  name: 'frameBorder',
  tagName: 'iframe'
}, {
  name: 'from',
  read: 'from' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animate'
}, {
  name: 'fx',
  read: 'fx' |> getSVGProperty(%),
  containerTagName: 'svg',
  overrideStringValue: '10px',
  tagName: 'radialGradient'
}, {
  name: 'fX',
  containerTagName: 'svg',
  tagName: 'radialGradient',
  overrideStringValue: '10px',
  read: 'fx' |> getSVGProperty(%)
}, {
  name: 'fY',
  containerTagName: 'svg',
  tagName: 'radialGradient',
  overrideStringValue: '20em',
  read: 'fy' |> getSVGProperty(%)
}, {
  name: 'fy',
  read: 'fy' |> getSVGProperty(%),
  containerTagName: 'svg',
  overrideStringValue: '20em',
  tagName: 'radialGradient'
}, {
  name: 'G1',
  containerTagName: 'svg',
  tagName: 'hkern',
  read: 'g1' |> getSVGAttribute(%)
}, {
  name: 'g1',
  read: 'g1' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'hkern'
}, {
  name: 'G2',
  containerTagName: 'svg',
  tagName: 'hkern',
  read: 'g2' |> getSVGAttribute(%)
}, {
  name: 'g2',
  read: 'g2' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'hkern'
}, {
  name: 'glyph-name',
  read: 'glyph-name' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'glyph'
}, {
  name: 'glyph-orientation-horizontal',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'glyph-orientation-horizontal' |> getSVGAttribute(%)
}, {
  name: 'glyph-orientation-vertical',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'glyph-orientation-vertical' |> getSVGAttribute(%)
}, {
  name: 'glyphName',
  read: 'glyph-name' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'glyph'
}, {
  name: 'glyphOrientationHorizontal',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'glyph-orientation-horizontal' |> getSVGAttribute(%)
}, {
  name: 'glyphOrientationVertical',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'glyph-orientation-vertical' |> getSVGAttribute(%)
}, {
  name: 'glyphRef',
  read: 'glyph-ref' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'altGlyph'
}, {
  name: 'gradientTransform',
  read: 'gradientTransform' |> getSVGProperty(%),
  containerTagName: 'svg',
  overrideStringValue: 'translate(-10,-20) scale(2) rotate(45) translate(5,10)',
  tagName: 'linearGradient'
}, {
  name: 'gradientUnits',
  read: 'gradientUnits' |> getSVGProperty(%),
  containerTagName: 'svg',
  overrideStringValue: 'userSpaceOnUse',
  tagName: 'linearGradient'
}, {
  name: 'hanging',
  read: 'hanging' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
},
// Disabled because it crashes other tests with React 15.
// TODO: re-enable when we no longer compare to 15.
// {name: 'hasOwnProperty', read: getAttribute('hasOwnProperty')},
{
  name: 'headers',
  containerTagName: 'tr',
  tagName: 'td'
}, {
  name: 'height',
  tagName: 'img'
}, {
  name: 'height',
  containerTagName: 'svg',
  tagName: 'rect',
  read: 'height' |> getSVGProperty(%),
  overrideStringValue: '100%'
}, {
  name: 'hidden',
  overrideStringValue: 'until-found'
}, {
  name: 'high',
  tagName: 'meter'
}, {
  name: 'horiz-adv-x',
  read: 'horiz-adv-x' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'horiz-origin-x',
  read: 'horiz-origin-x' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'horizAdvX',
  read: 'horiz-adv-x' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'horizOriginX',
  read: 'horiz-origin-x' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'href',
  tagName: 'a',
  overrideStringValue: 'https://reactjs.com'
}, {
  name: 'hrefLang',
  read: 'hreflang' |> getAttribute(%)
}, {
  name: 'htmlFor',
  tagName: 'label'
}, {
  name: 'http-equiv',
  containerTagName: 'head',
  tagName: 'meta',
  read: 'httpEquiv' |> getProperty(%)
}, {
  name: 'httpEquiv',
  containerTagName: 'head',
  tagName: 'meta'
}, {
  name: 'icon',
  tagName: 'command',
  read: 'icon' |> getAttribute(%)
}, {
  name: 'id'
}, {
  name: 'ID',
  read: 'id' |> getProperty(%)
}, {
  name: 'ideographic',
  read: 'ideographic' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'image-rendering',
  tagName: 'svg',
  read: 'image-rendering' |> getSVGAttribute(%)
}, {
  name: 'imageRendering',
  tagName: 'svg',
  read: 'image-rendering' |> getSVGAttribute(%)
}, {
  name: 'imageSizes',
  tagName: 'link',
  read: 'imageSizes' |> getProperty(%)
}, {
  name: 'imageSrcSet',
  tagName: 'link',
  read: 'imageSrcset' |> getProperty(%)
}, {
  name: 'in',
  read: 'in' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'feBlend'
}, {
  name: 'inert'
}, {
  name: 'in2',
  read: 'in2' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feBlend'
}, {
  name: 'initialChecked',
  read: 'initialchecked' |> getAttribute(%)
}, {
  name: 'initialValue',
  read: 'initialvalue' |> getAttribute(%)
}, {
  name: 'inlist',
  read: 'inlist' |> getAttribute(%)
}, {
  name: 'inputMode',
  tagName: 'input'
}, {
  name: 'integrity',
  tagName: 'script'
}, {
  name: 'intercept',
  read: 'intercept' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feFuncA'
}, {
  name: 'is',
  tagName: 'button',
  overrideStringValue: 'x-test-element',
  read: 'is' |> getAttribute(%) // TODO: This could check if this is an extended custom element but this is a controversial spec.
}, {
  name: 'itemID',
  read: 'itemid' |> getAttribute(%)
}, {
  name: 'itemProp',
  read: 'itemprop' |> getAttribute(%)
}, {
  name: 'itemRef',
  read: 'itemref' |> getAttribute(%)
}, {
  name: 'itemScope',
  read: 'itemscope' |> getAttribute(%)
}, {
  name: 'itemType',
  read: 'itemtype' |> getAttribute(%)
}, {
  name: 'k',
  read: 'k' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'hkern'
}, {
  name: 'K',
  containerTagName: 'svg',
  tagName: 'hkern',
  read: 'k' |> getSVGAttribute(%)
}, {
  name: 'K1',
  containerTagName: 'svg',
  tagName: 'feComposite',
  read: 'k1' |> getSVGProperty(%)
}, {
  name: 'k1',
  read: 'k1' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feComposite'
}, {
  name: 'k2',
  read: 'k2' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feComposite'
}, {
  name: 'k3',
  read: 'k3' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feComposite'
}, {
  name: 'k4',
  read: 'k4' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feComposite'
}, {
  name: 'kernelMatrix',
  read: 'kernelMatrix' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix',
  overrideStringValue: '1 2 3,4'
}, {
  name: 'kernelUnitLength',
  read: 'kernelUnitLength' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix'
}, {
  name: 'kerning',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'kerning' |> getSVGAttribute(%)
}, {
  name: 'keyParams',
  read: 'keyParams' |> getAttribute(%)
}, {
  name: 'keyPoints',
  read: 'keyPoints' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animateMotion'
}, {
  name: 'keySplines',
  read: 'keySplines' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animate'
}, {
  name: 'keyTimes',
  read: 'keyTimes' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animate'
}, {
  name: 'keyType',
  read: 'keyType' |> getAttribute(%)
}, {
  name: 'kind',
  tagName: 'track',
  overrideStringValue: 'captions'
}, {
  name: 'label',
  tagName: 'track'
}, {
  name: 'LANG',
  read: 'lang' |> getProperty(%)
}, {
  name: 'lang'
}, {
  name: 'lang',
  containerTagName: 'document',
  tagName: 'html'
}, {
  name: 'length',
  read: 'length' |> getAttribute(%)
}, {
  name: 'lengthAdjust',
  read: 'lengthAdjust' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'text',
  overrideStringValue: 'spacingAndGlyphs'
}, {
  name: 'letter-spacing',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'letter-spacing' |> getSVGAttribute(%)
}, {
  name: 'letterSpacing',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'letter-spacing' |> getSVGAttribute(%)
}, {
  name: 'lighting-color',
  containerTagName: 'svg',
  tagName: 'feDiffuseLighting',
  read: 'lighting-color' |> getSVGAttribute(%)
}, {
  name: 'lightingColor',
  containerTagName: 'svg',
  tagName: 'feDiffuseLighting',
  read: 'lighting-color' |> getSVGAttribute(%)
}, {
  name: 'limitingConeAngle',
  read: 'limitingConeAngle' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feSpotLight'
}, {
  name: 'list',
  read: 'list' |> getAttribute(%)
},
// TODO: This should match the ID of a datalist element and then read property.
{
  name: 'local',
  read: 'local' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'color-profile'
}, {
  name: 'loop',
  tagName: 'audio'
}, {
  name: 'low',
  tagName: 'meter'
}, {
  name: 'manifest',
  read: 'manifest' |> getAttribute(%)
}, {
  name: 'marginHeight',
  containerTagName: 'frameset',
  tagName: 'frame'
}, {
  name: 'marginWidth',
  containerTagName: 'frameset',
  tagName: 'frame'
}, {
  name: 'marker-end',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'marker-end' |> getSVGAttribute(%)
}, {
  name: 'marker-mid',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'marker-mid' |> getSVGAttribute(%)
}, {
  name: 'marker-start',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'marker-start' |> getSVGAttribute(%)
}, {
  name: 'markerEnd',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'marker-end' |> getSVGAttribute(%)
}, {
  name: 'markerHeight',
  read: 'markerHeight' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'marker'
}, {
  name: 'markerMid',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'marker-mid' |> getSVGAttribute(%)
}, {
  name: 'markerStart',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'marker-start' |> getSVGAttribute(%)
}, {
  name: 'markerUnits',
  read: 'markerUnits' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'marker'
}, {
  name: 'markerWidth',
  read: 'markerWidth' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'marker'
}, {
  name: 'mask',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'mask' |> getSVGAttribute(%)
}, {
  name: 'maskContentUnits',
  read: 'maskContentUnits' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'mask',
  overrideStringValue: 'objectBoundingBox'
}, {
  name: 'maskUnits',
  read: 'maskUnits' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'mask',
  overrideStringValue: 'userSpaceOnUse'
}, {
  name: 'mathematical',
  read: 'mathematical' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'max',
  tagName: 'input'
}, {
  name: 'max',
  tagName: 'meter'
}, {
  name: 'max',
  tagName: 'progress'
}, {
  name: 'max',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'max' |> getSVGAttribute(%)
}, {
  name: 'maxLength',
  tagName: 'textarea'
}, {
  name: 'media',
  tagName: 'link'
}, {
  name: 'media',
  containerTagName: 'svg',
  tagName: 'style',
  read: 'media' |> getSVGProperty(%)
}, {
  name: 'mediaGroup',
  tagName: 'video',
  read: 'mediagroup' |> getAttribute(%)
},
// TODO: Not yet implemented in Chrome.
{
  name: 'method',
  tagName: 'form',
  overrideStringValue: 'POST'
}, {
  name: 'method',
  containerTagName: 'svg',
  tagName: 'textPath',
  read: 'method' |> getSVGProperty(%),
  overrideStringValue: 'stretch'
}, {
  name: 'min',
  tagName: 'input'
}, {
  name: 'min',
  tagName: 'meter'
}, {
  name: 'min',
  containerTagName: 'svg',
  tagName: 'animate',
  read: 'min' |> getSVGAttribute(%)
}, {
  name: 'minLength',
  tagName: 'input'
}, {
  name: 'mode',
  read: 'mode' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feBlend',
  overrideStringValue: 'multiply'
}, {
  name: 'multiple',
  tagName: 'select'
}, {
  name: 'muted',
  tagName: 'video'
}, {
  name: 'name',
  tagName: 'input'
}, {
  name: 'name',
  containerTagName: 'svg',
  tagName: 'color-profile',
  read: 'color-profile' |> getSVGAttribute(%)
}, {
  name: 'noModule',
  tagName: 'script'
}, {
  name: 'nonce',
  read: 'nonce' |> getAttribute(%)
}, {
  name: 'noValidate',
  tagName: 'form'
}, {
  name: 'numOctaves',
  read: 'numOctaves' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feTurbulence'
}, {
  name: 'offset',
  read: 'offset' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'stop'
}, {
  name: 'on-click'
},
// TODO: Check for event subscriptions
{
  name: 'on-unknownevent'
},
// TODO: Check for event subscriptions
{
  name: 'onclick'
},
// TODO: Check for event subscriptions
{
  name: 'onClick'
},
// TODO: Check for event subscriptions
{
  name: 'onunknownevent'
},
// TODO: Check for event subscriptions
{
  name: 'onUnknownEvent'
},
// TODO: Check for event subscriptions
{
  name: 'opacity',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'opacity' |> getSVGAttribute(%)
}, {
  name: 'open',
  tagName: 'details'
}, {
  name: 'operator',
  read: 'operator' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feComposite',
  overrideStringValue: 'xor'
}, {
  name: 'optimum',
  tagName: 'meter'
}, {
  name: 'order',
  read: 'order' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix'
}, {
  name: 'orient',
  read: 'orient' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'marker'
}, {
  name: 'orientation',
  read: 'orientation' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'glyph'
}, {
  name: 'origin',
  read: 'origin' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animateMotion'
}, {
  name: 'overflow',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'overflow' |> getSVGAttribute(%)
}, {
  name: 'overline-position',
  read: 'overline-position' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'overline-thickness',
  read: 'overline-thickness' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'overlinePosition',
  read: 'overline-position' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'overlineThickness',
  read: 'overline-thickness' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'paint-order',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'paint-order' |> getSVGAttribute(%)
}, {
  name: 'paintOrder',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'paint-order' |> getSVGAttribute(%)
}, {
  name: 'panose-1',
  read: 'panose-1' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'panose1',
  containerTagName: 'svg',
  tagName: 'font-face',
  read: 'panose-1' |> getSVGAttribute(%)
}, {
  name: 'pathLength',
  read: 'pathLength' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'path'
}, {
  name: 'pattern',
  tagName: 'input'
}, {
  name: 'patternContentUnits',
  read: 'patternContentUnits' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'pattern',
  overrideStringValue: 'objectBoundingBox'
}, {
  name: 'patternTransform',
  read: 'patternTransform' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'pattern',
  overrideStringValue: 'translate(-10,-20) scale(2) rotate(45) translate(5,10)'
}, {
  name: 'patternUnits',
  read: 'patternUnits' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'pattern',
  overrideStringValue: 'userSpaceOnUse'
}, {
  name: 'placeholder',
  tagName: 'input'
}, {
  name: 'playsInline',
  read: 'playsinline' |> getAttribute(%)
}, {
  name: 'pointer-events',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'pointer-events' |> getSVGAttribute(%)
}, {
  name: 'pointerEvents',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'pointer-events' |> getSVGAttribute(%)
}, {
  name: 'points',
  read: 'points' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'polygon',
  overrideStringValue: '350,75  379,161 469,161'
}, {
  name: 'pointsAtX',
  read: 'pointsAtX' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feSpotLight'
}, {
  name: 'pointsAtY',
  read: 'pointsAtY' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feSpotLight'
}, {
  name: 'pointsAtZ',
  read: 'pointsAtZ' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feSpotLight'
}, {
  name: 'popover',
  overrideStringValue: 'manual'
}, {
  name: 'popoverTarget',
  read: element => {
    element |> document.body.appendChild(%);
    try {
      // trigger and target need to be connected for `popoverTargetElement` to read the actual value.
      return element.popoverTargetElement;
    } finally {
      element |> document.body.removeChild(%);
    }
  },
  overrideStringValue: 'popover-target',
  tagName: 'button'
}, {
  name: 'popoverTargetAction',
  overrideStringValue: 'show',
  tagName: 'button'
}, {
  name: 'poster',
  tagName: 'video',
  overrideStringValue: 'https://reactjs.com'
}, {
  name: 'prefix',
  read: 'prefix' |> getAttribute(%)
}, {
  name: 'preload',
  tagName: 'video',
  overrideStringValue: 'none'
}, {
  name: 'preserveAlpha',
  read: 'preserveAlpha' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix'
}, {
  name: 'preserveAspectRatio',
  read: 'preserveAspectRatio' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feImage',
  overrideStringValue: 'xMinYMin slice'
}, {
  name: 'primitiveUnits',
  read: 'primitiveUnits' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'filter',
  overrideStringValue: 'objectBoundingBox'
}, {
  name: 'profile',
  read: 'profile' |> getAttribute(%)
}, {
  name: 'property',
  read: 'property' |> getAttribute(%)
}, {
  name: 'props',
  read: 'props' |> getAttribute(%)
}, {
  name: 'r',
  read: 'r' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'circle',
  overrideStringValue: '10pt'
}, {
  name: 'radioGroup',
  tagName: 'command',
  read: 'radiogroup' |> getAttribute(%)
}, {
  name: 'radius',
  read: 'radius' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'feMorphology'
}, {
  name: 'readOnly',
  tagName: 'input'
}, {
  name: 'referrerPolicy',
  tagName: 'iframe'
}, {
  name: 'refX',
  read: 'refX' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'marker',
  overrideStringValue: '5em'
}, {
  name: 'refY',
  read: 'refY' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'marker',
  overrideStringValue: '6em'
}, {
  name: 'rel',
  tagName: 'a'
}, {
  name: 'rendering-intent',
  read: 'rendering-intent' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'color-profile'
}, {
  name: 'renderingIntent',
  read: 'rendering-intent' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'color-profile'
}, {
  name: 'repeatCount',
  read: 'repeatcount' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animate'
}, {
  name: 'repeatDur',
  read: 'repeatdur' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animate'
}, {
  name: 'required',
  tagName: 'input'
}, {
  name: 'requiredExtensions',
  read: 'requiredExtensions' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'a'
}, {
  name: 'requiredFeatures',
  read: 'requiredFeatures' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'a'
}, {
  name: 'resource',
  read: 'resource' |> getAttribute(%)
}, {
  name: 'restart',
  read: 'resource' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'animate'
}, {
  name: 'result',
  read: 'result' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feBlend'
}, {
  name: 'results',
  tagName: 'input',
  read: 'results' |> getAttribute(%)
},
// TODO: Should use property but it's not supported in Chrome.
{
  name: 'reversed',
  tagName: 'ol'
}, {
  name: 'role',
  read: 'role' |> getAttribute(%)
}, {
  name: 'rotate',
  read: 'role' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'altGlyph'
}, {
  name: 'rows',
  tagName: 'textarea'
}, {
  name: 'rowSpan',
  containerTagName: 'tr',
  tagName: 'td'
}, {
  name: 'rx',
  read: 'rx' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'ellipse',
  overrideStringValue: '1px'
}, {
  name: 'ry',
  read: 'ry' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'ellipse',
  overrideStringValue: '2px'
}, {
  name: 'sandbox',
  tagName: 'iframe',
  overrideStringValue: 'allow-forms  allow-scripts'
}, {
  name: 'scale',
  read: 'scale' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feDisplacementMap'
}, {
  name: 'scope',
  containerTagName: 'tr',
  tagName: 'th',
  overrideStringValue: 'row'
}, {
  name: 'scoped',
  tagName: 'style',
  read: 'scoped' |> getAttribute(%)
}, {
  name: 'scrolling',
  tagName: 'iframe',
  overrideStringValue: 'no'
}, {
  name: 'seamless',
  tagName: 'iframe',
  read: 'seamless' |> getAttribute(%)
}, {
  name: 'security',
  tagName: 'iframe',
  read: 'security' |> getAttribute(%)
}, {
  name: 'seed',
  read: 'seed' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feTurbulence'
}, {
  name: 'selected',
  tagName: 'option',
  containerTagName: 'select'
}, {
  name: 'selectedIndex',
  tagName: 'select'
}, {
  name: 'shape',
  tagName: 'a'
}, {
  name: 'shape-rendering',
  tagName: 'svg',
  read: 'shape-rendering' |> getSVGAttribute(%)
}, {
  name: 'shapeRendering',
  tagName: 'svg',
  read: 'shape-rendering' |> getSVGAttribute(%)
}, {
  name: 'size',
  tagName: 'input'
}, {
  name: 'sizes',
  tagName: 'link'
}, {
  name: 'slope',
  read: 'slope' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'spacing',
  read: 'spacing' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'textPath',
  overrideStringValue: 'auto'
}, {
  name: 'span',
  containerTagName: 'colgroup',
  tagName: 'col'
}, {
  name: 'specularConstant',
  read: 'specularConstant' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feSpecularLighting'
}, {
  name: 'specularExponent',
  read: 'specularConstant' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feSpecularLighting'
}, {
  name: 'speed',
  read: 'speed' |> getAttribute(%)
}, {
  name: 'spellCheck',
  overrideStringValue: 'false',
  tagName: 'input',
  read: 'spellcheck' |> getProperty(%)
}, {
  name: 'spellcheck',
  overrideStringValue: 'false',
  tagName: 'input',
  read: 'spellcheck' |> getProperty(%)
}, {
  name: 'spreadMethod',
  read: 'spreadMethod' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'linearGradient',
  overrideStringValue: 'reflect'
}, {
  name: 'src',
  tagName: 'img',
  overrideStringValue: 'https://reactjs.com'
}, {
  name: 'srcDoc',
  tagName: 'iframe',
  overrideStringValue: '<p>Hi</p>',
  read: 'srcdoc' |> getProperty(%)
}, {
  name: 'srcdoc',
  tagName: 'iframe',
  overrideStringValue: '<p>Hi</p>',
  read: 'srcdoc' |> getProperty(%)
}, {
  name: 'srcLang',
  containerTagName: 'audio',
  tagName: 'track',
  overrideStringValue: 'en',
  read: 'srclang' |> getProperty(%)
}, {
  name: 'srclang',
  containerTagName: 'audio',
  tagName: 'track',
  overrideStringValue: 'en',
  read: 'srclang' |> getProperty(%)
}, {
  name: 'srcSet',
  tagName: 'img'
}, {
  name: 'srcset',
  tagName: 'img'
}, {
  name: 'start',
  tagName: 'ol'
}, {
  name: 'startOffset',
  read: 'startOffset' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'textPath'
}, {
  name: 'state',
  read: 'state' |> getAttribute(%)
}, {
  name: 'stdDeviation',
  read: 'stdDeviation' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'feGaussianBlur'
}, {
  name: 'stemh',
  read: 'stemh' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'stemv',
  read: 'stemv' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'step',
  read: 'step' |> getAttribute(%)
}, {
  name: 'stitchTiles',
  read: 'stitchTiles' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feTurbulence',
  overrideStringValue: 'stitch'
}, {
  name: 'stop-color',
  containerTagName: 'svg',
  tagName: 'stop',
  read: 'stop-color' |> getSVGAttribute(%)
}, {
  name: 'stop-opacity',
  containerTagName: 'svg',
  tagName: 'stop',
  read: 'stop-opacity' |> getSVGAttribute(%)
}, {
  name: 'stopColor',
  containerTagName: 'svg',
  tagName: 'stop',
  read: 'stop-color' |> getSVGAttribute(%)
}, {
  name: 'stopOpacity',
  containerTagName: 'svg',
  tagName: 'stop',
  read: 'stop-opacity' |> getSVGAttribute(%)
}, {
  name: 'strikethrough-position',
  read: 'strikethrough-position' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'strikethrough-thickness',
  read: 'strikethrough-thickness' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'strikethroughPosition',
  read: 'strikethrough-position' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'strikethroughThickness',
  read: 'strikethrough-thickness' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'string',
  read: 'string' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face-format'
}, {
  name: 'stroke',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke' |> getSVGAttribute(%)
}, {
  name: 'stroke-dasharray',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-dasharray' |> getSVGAttribute(%)
}, {
  name: 'stroke-Dasharray',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-dasharray' |> getSVGAttribute(%)
}, {
  name: 'stroke-dashoffset',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-dashoffset' |> getSVGAttribute(%)
}, {
  name: 'stroke-linecap',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-linecap' |> getSVGAttribute(%)
}, {
  name: 'stroke-linejoin',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-linejoin' |> getSVGAttribute(%)
}, {
  name: 'stroke-miterlimit',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-miterlimit' |> getSVGAttribute(%)
}, {
  name: 'stroke-opacity',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-opacity' |> getSVGAttribute(%)
}, {
  name: 'stroke-width',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-width' |> getSVGAttribute(%)
}, {
  name: 'strokeDasharray',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-dasharray' |> getSVGAttribute(%)
}, {
  name: 'strokeDashoffset',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-dashoffset' |> getSVGAttribute(%)
}, {
  name: 'strokeLinecap',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-linecap' |> getSVGAttribute(%)
}, {
  name: 'strokeLinejoin',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-linejoin' |> getSVGAttribute(%)
}, {
  name: 'strokeMiterlimit',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-miterlimit' |> getSVGAttribute(%)
}, {
  name: 'strokeOpacity',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-opacity' |> getSVGAttribute(%)
}, {
  name: 'strokeWidth',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'stroke-width' |> getSVGAttribute(%)
}, {
  name: 'style'
}, {
  name: 'summary',
  tagName: 'table'
}, {
  name: 'suppressContentEditableWarning',
  read: 'suppresscontenteditablewarning' |> getAttribute(%)
}, {
  name: 'surfaceScale',
  read: 'surfaceScale' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feDiffuseLighting'
}, {
  name: 'systemLanguage',
  overrideStringValue: 'en',
  read: 'systemLanguage' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'a'
}, {
  name: 'tabIndex'
}, {
  name: 'tabIndex',
  read: 'tabIndex' |> getSVGProperty(%),
  tagName: 'svg'
}, {
  name: 'tableValues',
  read: 'tableValues' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feFuncA',
  overrideStringValue: '0 1 2 3'
}, {
  name: 'target',
  read: 'target' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'a'
}, {
  name: 'targetX',
  read: 'targetX' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix'
}, {
  name: 'targetY',
  read: 'targetY' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feConvolveMatrix'
}, {
  name: 'text-anchor',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'text-anchor' |> getSVGAttribute(%)
}, {
  name: 'text-decoration',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'text-decoration' |> getSVGAttribute(%)
}, {
  name: 'text-rendering',
  tagName: 'svg',
  read: 'text-rendering' |> getSVGAttribute(%)
}, {
  name: 'textAnchor',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'text-anchor' |> getSVGAttribute(%)
}, {
  name: 'textDecoration',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'text-decoration' |> getSVGAttribute(%)
}, {
  name: 'textLength',
  read: 'textLength' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'text'
}, {
  name: 'textRendering',
  tagName: 'svg',
  read: 'text-rendering' |> getSVGAttribute(%)
}, {
  name: 'title'
}, {
  name: 'to',
  read: 'to' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'set'
}, {
  name: 'transform',
  read: 'transform' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'a',
  overrideStringValue: 'translate(-10,-20) scale(2) rotate(45) translate(5,10)'
}, {
  name: 'transform-origin',
  tagName: 'svg',
  read: 'transform-origin' |> getSVGAttribute(%)
}, {
  name: 'transformOrigin',
  tagName: 'svg',
  read: 'transform-origin' |> getSVGAttribute(%)
}, {
  name: 'type',
  tagName: 'button',
  overrideStringValue: 'reset'
}, {
  name: 'type',
  containerTagName: 'svg',
  tagName: 'feFuncA',
  read: 'type' |> getSVGProperty(%),
  overrideStringValue: 'discrete'
}, {
  name: 'typeof',
  read: 'typeof' |> getAttribute(%)
}, {
  name: 'u1',
  read: 'u1' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'hkern'
}, {
  name: 'u2',
  read: 'u2' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'hkern'
}, {
  name: 'underline-position',
  read: 'underline-position' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'underline-thickness',
  read: 'underline-thickness' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'underlinePosition',
  read: 'underline-position' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'underlineThickness',
  read: 'underline-thickness' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'unicode',
  read: 'unicode' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'glyph'
}, {
  name: 'unicode-bidi',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'unicode-bidi' |> getSVGAttribute(%)
}, {
  name: 'unicode-range',
  read: 'unicode-range' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'unicodeBidi',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'unicode-bidi' |> getSVGAttribute(%)
}, {
  name: 'unicodeRange',
  read: 'unicode-range' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'units-per-em',
  read: 'units-per-em' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'unitsPerEm',
  read: 'unites-per-em' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'unknown',
  read: 'unknown' |> getAttribute(%)
}, {
  name: 'unselectable',
  read: 'unselectable' |> getAttribute(%),
  tagName: 'span',
  overrideStringValue: 'on'
}, {
  name: 'useMap',
  tagName: 'img'
}, {
  name: 'v-alphabetic',
  read: 'v-alphabetic' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'v-hanging',
  read: 'v-hanging' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'v-ideographic',
  read: 'v-ideographic' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'v-mathematical',
  read: 'v-mathematical' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'vAlphabetic',
  read: 'v-alphabetic' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'value',
  tagName: 'input',
  extraProps: {
    onChange() {}
  }
}, {
  name: 'value',
  tagName: 'input',
  type: 'email',
  extraProps: {
    onChange() {}
  }
}, {
  name: 'value',
  tagName: 'input',
  type: 'number',
  extraProps: {
    onChange() {}
  }
}, {
  name: 'value',
  tagName: 'textarea',
  extraProps: {
    onChange() {}
  }
}, {
  name: 'value',
  containerTagName: 'select',
  tagName: 'option',
  extraProps: {
    onChange() {}
  }
}, {
  name: 'Value',
  containerTagName: 'select',
  tagName: 'option',
  read: 'value' |> getProperty(%)
}, {
  name: 'values',
  read: 'values' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feColorMatrix',
  overrideStringValue: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'
}, {
  name: 'vector-effect',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'vector-effect' |> getSVGAttribute(%)
}, {
  name: 'vectorEffect',
  containerTagName: 'svg',
  tagName: 'line',
  read: 'vector-effect' |> getSVGAttribute(%)
}, {
  name: 'version',
  containerTagName: 'document',
  tagName: 'html'
}, {
  name: 'version',
  tagName: 'svg',
  read: 'version' |> getSVGAttribute(%)
}, {
  name: 'vert-adv-y',
  read: 'vert-origin-y' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'vert-origin-x',
  read: 'vert-origin-y' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'vert-origin-y',
  read: 'vert-origin-y' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'vertAdvY',
  read: 'vert-adv-y' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'vertOriginX',
  read: 'vert-origin-x' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'vertOriginY',
  read: 'vert-origin-y' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font'
}, {
  name: 'vHanging',
  read: 'v-hanging' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'vIdeographic',
  read: 'v-ideographic' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'viewBox',
  read: 'viewBox' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'marker',
  overrideStringValue: '0 0 1500 1000'
}, {
  name: 'viewTarget',
  read: 'viewTarget' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'view'
}, {
  name: 'visibility',
  read: 'visibility' |> getAttribute(%)
}, {
  name: 'visibility',
  containerTagName: 'svg',
  tagName: 'path',
  read: 'visibility' |> getSVGAttribute(%)
}, {
  name: 'vMathematical',
  read: 'v-mathematical' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'vocab',
  read: 'vocab' |> getAttribute(%)
}, {
  name: 'width',
  tagName: 'img'
}, {
  name: 'width',
  containerTagName: 'svg',
  tagName: 'rect',
  read: 'width' |> getSVGProperty(%)
}, {
  name: 'widths',
  read: 'widths' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'wmode',
  read: 'wmode' |> getAttribute(%),
  tagName: 'embed'
}, {
  name: 'word-spacing',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'word-spacing' |> getSVGAttribute(%)
}, {
  name: 'wordSpacing',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'word-spacing' |> getSVGAttribute(%)
}, {
  name: 'wrap',
  tagName: 'textarea'
}, {
  name: 'writing-mode',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'writing-mode' |> getSVGAttribute(%)
}, {
  name: 'writingMode',
  containerTagName: 'svg',
  tagName: 'text',
  read: 'writing-mode' |> getSVGAttribute(%)
}, {
  name: 'x',
  read: 'x' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'altGlyph'
}, {
  name: 'x-height',
  read: 'x-height' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'x1',
  read: 'x1' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'line'
}, {
  name: 'x2',
  read: 'x2' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'line'
}, {
  name: 'xChannelSelector',
  read: 'xChannelSelector' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feDisplacementMap',
  overrideStringValue: 'R'
}, {
  name: 'xHeight',
  read: 'x-height' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'font-face'
}, {
  name: 'XLink:Actuate',
  read: 'XLink:Actuate' |> getAttribute(%)
}, {
  name: 'xlink:actuate',
  read: 'xlink:actuate' |> getAttribute(%)
}, {
  name: 'xlink:arcrole',
  read: 'xlink:arcrole' |> getAttribute(%)
}, {
  name: 'xlink:href',
  read: 'xlink:href' |> getAttribute(%)
}, {
  name: 'xlink:role',
  read: 'xlink:role' |> getAttribute(%)
}, {
  name: 'xlink:show',
  read: 'xlink:show' |> getAttribute(%)
}, {
  name: 'xlink:title',
  read: 'xlink:title' |> getAttribute(%)
}, {
  name: 'xlink:type',
  read: 'xlink:type' |> getAttribute(%)
}, {
  name: 'xlinkActuate',
  read: 'xlink:actuate' |> getAttribute(%)
}, {
  name: 'XlinkActuate',
  read: 'Xlink:actuate' |> getAttribute(%)
}, {
  name: 'xlinkArcrole',
  read: 'xlink:arcrole' |> getAttribute(%)
}, {
  name: 'xlinkHref',
  read: 'xlink:href' |> getAttribute(%)
}, {
  name: 'xlinkRole',
  read: 'xlink:role' |> getAttribute(%)
}, {
  name: 'xlinkShow',
  read: 'xlink:show' |> getAttribute(%)
}, {
  name: 'xlinkTitle',
  read: 'xlink:title' |> getAttribute(%)
}, {
  name: 'xlinkType',
  read: 'xlink:type' |> getAttribute(%)
}, {
  name: 'xml:base',
  read: 'xml:base' |> getAttribute(%)
}, {
  name: 'xml:lang',
  read: 'xml:lang' |> getAttribute(%)
}, {
  name: 'xml:space',
  read: 'xml:space' |> getAttribute(%)
}, {
  name: 'xmlBase',
  read: 'xml:base' |> getAttribute(%)
}, {
  name: 'xmlLang',
  read: 'xml:lang' |> getAttribute(%)
}, {
  name: 'xmlns',
  read: 'namespaceURI' |> getProperty(%),
  tagName: 'svg'
}, {
  name: 'xmlns:xlink',
  read: 'xmlns:xlink' |> getAttribute(%)
}, {
  name: 'xmlnsXlink',
  read: 'xmlns:xlink' |> getAttribute(%)
}, {
  name: 'xmlSpace',
  read: 'xml:space' |> getAttribute(%)
}, {
  name: 'y',
  read: 'y' |> getSVGAttribute(%),
  containerTagName: 'svg',
  tagName: 'altGlyph'
}, {
  name: 'y1',
  read: 'y1' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'line'
}, {
  name: 'y2',
  read: 'y2' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'line'
}, {
  name: 'yChannelSelector',
  read: 'yChannelSelector' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'feDisplacementMap',
  overrideStringValue: 'B'
}, {
  name: 'z',
  read: 'z' |> getSVGProperty(%),
  containerTagName: 'svg',
  tagName: 'fePointLight'
}, {
  name: 'zoomAndPan',
  read: 'zoomAndPan' |> getSVGProperty(%),
  tagName: 'svg'
}];
(attr => {
  attr.read = attr.read || attr.name |> getProperty(%);
}) |> attributes.forEach(%);
export default attributes;