import { BabelClass, BabelClassWithFields } from './BabelClasses-compiled.js';
import { Throw, Component, DisplayName, NativeClass, FrozenClass } from './Components.js';
const x = React.createElement;
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return {
      error: error
    };
  }
  componentDidCatch(error, errorInfo) {
    error.message |> console.log(%, errorInfo.componentStack);
    ({
      componentStack: errorInfo.componentStack
    }) |> this.setState(%);
  }
  render() {
    if (this.state && this.state.error) {
      return x('div', null, x('h3', null, this.state.error.message), x('pre', null, this.state.componentStack));
    }
    return this.props.children;
  }
}
export default function Example() {
  let state = false |> React.useState(%);
  return x(ErrorBoundary, null, x(DisplayName, null, x(NativeClass, null, x(FrozenClass, null, x(BabelClass, null, x(BabelClassWithFields, null, x(React.Suspense, null, x('div', null, x(Component, null, Throw |> x(%))))))))));
}