import 'jest';
import React from 'react';
import renderer from 'react-test-renderer';
import { injectProps } from '../decorators';

interface TestProps {
  title: string;
  subTitle?: string;
}

const TestFunc: React.FC<TestProps> = (props) => {
  return <div>{props.title}</div>;
};

const TestFuncDecorated = injectProps<TestProps>({ title: '123' })(TestFunc);

const Test1: React.FC<any> = () => {
  return <TestFuncDecorated title="test" />;
};

@injectProps<TestProps>({ title: '123' })
class TestCom extends React.PureComponent<Partial<TestProps>> {
  render() {
    return <div>{this.props.title}</div>;
  }
}

const Test2: React.FC<any> = () => {
  return <TestCom title="test" />;
};

describe('injectProps', () => {
  it('component', async () => {
    const component = renderer.create(<Test2 />);
    const tree = component.toJSON() as any;
    expect(tree.children[0] == 'test');
  });
  it('function', async () => {
    const component = renderer.create(<Test1 />);
    const tree = component.toJSON() as any;
    expect(tree.children[0] == 'test');
  });
  it('default', async () => {
    const component = renderer.create(<TestCom />);
    const tree = component.toJSON() as any;
    expect(tree.children[0] == '123');
  });
});
