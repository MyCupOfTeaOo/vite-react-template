import React from 'react';

export interface InjectOptions {
  forwardedRef?: boolean;
}

export function injectProps<T extends {}>(
  props?: Partial<T>,
  options?: InjectOptions,
) {
  return function <P extends Partial<T>, S extends {}>(
    WrappedComponent: React.ComponentType<P>,
  ) {
    const Com = class Component extends React.PureComponent<P, S> {
      render() {
        const { forwardedRef, ...rest } = this.props as any;
        return <WrappedComponent {...props} {...rest} ref={forwardedRef} />;
      }
    };
    if (options?.forwardedRef) {
      return React.forwardRef((p, ref) => {
        const TheCom = Com as any;
        return <TheCom {...p} forwardedRef={ref} />;
      }) as any as typeof Com;
    }
    return Com;
  };
}

type GetContextType<C extends React.Context<any>> = C extends React.Context<
  infer T
>
  ? T
  : any;

export function contextToProps<T extends {}, C extends React.Context<any>>(
  context: C,
  mapToProps: (context: GetContextType<C>) => Partial<T>,
  options?: InjectOptions,
) {
  return function <P extends T, S extends {}>(
    WrappedComponent: React.ComponentType<P>,
  ) {
    const Com = class Component extends React.PureComponent<P, S> {
      render() {
        const { forwardedRef, ...rest } = this.props as any;
        return (
          <context.Consumer>
            {(theContext) => (
              <WrappedComponent
                {...mapToProps(theContext)}
                {...rest}
                ref={forwardedRef}
              />
            )}
          </context.Consumer>
        );
      }
    };
    if (options?.forwardedRef) {
      return React.forwardRef((p, ref) => {
        const TheCom = Com as any;
        return <TheCom {...p} forwardedRef={ref} />;
      }) as any as typeof Com;
    }
    return Com;
  };
}
