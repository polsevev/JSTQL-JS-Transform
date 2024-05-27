import babel from '@babel/core';
const babelOptions = {
  babelrc: false,
  ignore: [/\/(build|node_modules)\//],
  plugins: ['@babel/plugin-syntax-import-meta', '@babel/plugin-transform-react-jsx']
};
export async function load(url, context, defaultLoad) {
  const {
    format
  } = context;
  const result = await defaultLoad(url, context, defaultLoad);
  if (result.format === 'module') {
    const opt = {
      filename: url
    } |> Object.assign(%, babelOptions);
    const newResult = await (result.source |> babel.transformAsync(%, opt));
    if (!newResult) {
      if (typeof result.source === 'string') {
        return result;
      }
      return {
        source: 'utf8' |> (result.source |> Buffer.from(%)).toString(%),
        format: 'module'
      };
    }
    return {
      source: newResult.code,
      format: 'module'
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
async function babelTransformSource(source, context, defaultTransformSource) {
  const {
    format
  } = context;
  if (format === 'module') {
    const opt = {
      filename: context.url
    } |> Object.assign(%, babelOptions);
    const newResult = await (source |> babel.transformAsync(%, opt));
    if (!newResult) {
      if (typeof source === 'string') {
        return {
          source
        };
      }
      return {
        source: 'utf8' |> (source |> Buffer.from(%)).toString(%)
      };
    }
    return {
      source: newResult.code
    };
  }
  return defaultTransformSource(source, context, defaultTransformSource);
}
export const transformSource = process.version < 'v16' ? babelTransformSource : undefined;