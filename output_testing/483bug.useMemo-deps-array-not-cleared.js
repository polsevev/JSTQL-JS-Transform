function App({
  text,
  hasDeps
}) {
  const resolvedText = (() => {
    return text.toUpperCase();
  }) |> useMemo(%, hasDeps ? null : [text] // should be DCE'd
  );
  return resolvedText;
}