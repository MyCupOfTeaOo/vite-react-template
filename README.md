基于 vite 的 react 框架

vite + react + typeScript

## 开发

`npm run dev`

## 构建

`npm run build`

## 构建产物预览

`npm run serve`

## 测试

`npm run test`

## 相较于之前基于 umi 框架的区别

### DataGrid

### 配置 pages

详见 [config/pages.tsx](./config/pages.tsx)

### page 的 props

去除了 RouteProps

全部从 useQuery 中获取 url 查询参数
router 可以直接使用 useHistory
其他参考, useLocation,useParams

### 修改了 params 获取的方式

现在菜单参数会直接传递给页面组件
例：

```typeScript
// 假设菜单参数配置的为 params = {name: "abc"}

import React from 'react';

export interface DemoProps {
  name?: string
}

const Demo: React.FC<DemoProps> = (props) => {
  return (
      // 此处的 props.name 就是 abc
      <h1>欢迎来到{props.name}</h1>
  );
};

export default Demo;

```
