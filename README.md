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

## TODO

- [ ] 支持 block 安装
- [ ] 支持 mock

## 目录结构

```
├─config 项目配置目录
│  ├─pages.tsx 页面与菜单id绑定
│  ├─projectConfig.ts 项目配置文件,如前缀,项目名,打包base路径等等
│  ├─proxy.ts 代理 dev环境下代理接口路径配置
│  └─route.tsx 路由配置文件(除非本地路由,不然不需要动这个问题,直接去`pages.ts`绑定菜单id即可)
├─public 公共资源文件
├─src
│  ├─assets 静态的资产(图片,svg,json等等)
│  ├─block 业务组件 (与业务强关联的组件,甚至可以是一个页面)
│  ├─components 通用组件 (与业务无关的通用型组件)
│  ├─hooks react hooks
│  ├─layouts 页面框架,不需要动
│  ├─models 业务建模
│  ├─pages 路由页面  改文件夹下也可以定义 Component 文件夹用来区别非页面的业务强关联非多个页面复用的组件
│  ├─service 接口(所有接口的聚合)
│  ├─stores 全局状态库
│  ├─styles 全局样式,主题,样式工具等
│  ├─utils
│  │  ├─authority.ts 权限封装
│  │  ├─cache.ts 缓存封装
│  │  ├─request.ts request请求封装
│  │  ├─utils.ts 工具集
│  ├─App.tsx 不需要动
│  ├─constant.ts 常量
├─tests 测试集
├─types 全局类型声明
├─...

```

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
