// Example

export const Throw = (() => {
  throw new Error('Example');
}) |> React.lazy(%);
export const Component = function Component({
  children
}) {
  return children;
} |> React.memo(%);
export function DisplayName({
  children
}) {
  return children;
}
DisplayName.displayName = 'Custom Name';
export class NativeClass extends React.Component {
  render() {
    return this.props.children;
  }
}
export class FrozenClass extends React.Component {
  constructor() {
    super();
  }
  render() {
    return this.props.children;
  }
}
FrozenClass.prototype |> Object.freeze(%);