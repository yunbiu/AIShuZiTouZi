/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/',
    name: '首页',
    layout: false,
    component: './home/HomePage',
  },
  {
    path: '/crypto-ai',
    name: '加密货币AI分析',
    icon: 'area-chart',
    routes: [
      {
        path: '/crypto-ai',
        redirect: '/crypto-ai/dashboard',
      },
      {
        path: '/crypto-ai/dashboard',
        name: '系统概览',
        component: '@/pages/crypto-ai/Dashboard',
      },
      {
        path: '/crypto-ai/message-list',
        name: '消息列表',
        component: '@/pages/crypto-ai/MessageList',
      },
      {
        path: '/crypto-ai/portfolio-data',
        name: '持仓数据',
        component: '@/pages/crypto-ai/PortfolioData',
      },
      {
        path: '/crypto-ai/suggestion-report',
        name: '建议报告',
        component: '@/pages/crypto-ai/SuggestionReport',
      },
    ],
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/account',
    routes: [
      {
        name: 'acenter',
        path: '/account/center',
        component: './User/Center',
      },
      {
        name: 'asettings',
        path: '/account/settings',
        component: './User/Settings',
      },
    ],
  },
  {
    name: 'basic-info',
    path: '/basic-info',
    routes: [
      {
        name: '字典数据',
        path: '/basic-info/system/dict-data/index/:id',
        component: './System/DictData',
      },
      {
        name: '分配用户',
        path: '/basic-info/system/role-auth/user/:id',
        component: './System/Role/authUser',
      },
    ]
  },
  {
    name: 'wms',
    path: '/wms',
    routes: [
      {
        name: '盘库单',
        path: '/wms/order/check-edit',
        component: './Wms/Order/Check/edit',
      },
    ]
  },
  {
    name: 'monitor',
    path: '/monitor',
    routes: [
      {
        name: '任务日志',
        path: '/monitor/job-log/index/:id',
        component: './Monitor/JobLog',
      },
    ]
  },
  {
    name: 'tool',
    path: '/tool',
    routes: [
      {
        name: '导入表',
        path: '/tool/gen/import',
        component: './Tool/Gen/import',
      },
      {
        name: '编辑表',
        path: '/tool/gen/edit',
        component: './Tool/Gen/edit',
      },
    ]
  },

];
