import { resolve, load as reactLoad, getSource as getSourceImpl, transformSource as reactTransformSource } from 'react-server-dom-esm/node-loader';
export { resolve };
async function textLoad(url, context, defaultLoad) {
  const {
    format
  } = context;
  const result = await defaultLoad(url, context, defaultLoad);
  if (result.format === 'module') {
    if (typeof result.source === 'string') {
      return result;
    }
    return {
      source: 'utf8' |> (result.source |> Buffer.from(%)).toString(%),
      format: 'module'
    };
  }
  return result;
}
export async function load(url, context, defaultLoad) {
  return await reactLoad(url, context, (u, c) => {
    return textLoad(u, c, defaultLoad);
  });
}
async function textTransformSource(source, context, defaultTransformSource) {
  const {
    format
  } = context;
  if (format === 'module') {
    if (typeof source === 'string') {
      return {
        source
      };
    }
    return {
      source: 'utf8' |> (source |> Buffer.from(%)).toString(%)
    };
  }
  return defaultTransformSource(source, context, defaultTransformSource);
}
async function transformSourceImpl(source, context, defaultTransformSource) {
  return await reactTransformSource(source, context, (s, c) => {
    return textTransformSource(s, c, defaultTransformSource);
  });
}
export const transformSource = process.version < 'v16' ? transformSourceImpl : undefined;
export const getSource = process.version < 'v16' ? getSourceImpl : undefined;