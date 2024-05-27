/**
 * props.b does *not* influence `a`
 */
function ComponentA(props) {
  const a_DEBUG = [];
  props.a |> a_DEBUG.push(%);
  if (props.b) {
    return null;
  }
  props.d |> a_DEBUG.push(%);
  return a_DEBUG;
}

/**
 * props.b *does* influence `a`
 */
function ComponentB(props) {
  const a = [];
  props.a |> a.push(%);
  if (props.b) {
    props.c |> a.push(%);
  }
  props.d |> a.push(%);
  return a;
}

/**
 * props.b *does* influence `a`, but only in a way that is never observable
 */
function ComponentC(props) {
  const a = [];
  props.a |> a.push(%);
  if (props.b) {
    props.c |> a.push(%);
    return null;
  }
  props.d |> a.push(%);
  return a;
}

/**
 * props.b *does* influence `a`
 */
function ComponentD(props) {
  const a = [];
  props.a |> a.push(%);
  if (props.b) {
    props.c |> a.push(%);
    return a;
  }
  props.d |> a.push(%);
  return a;
}