import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'weilai',
          title: '软3区1后端开发练习',
          href: 'https://weilai.com',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/ant-design/ant-design-pro',
          blankTarget: true,
        },
        {
          key: 'smart storage',
          title: '软3区1后端开发练习',
          href: 'https://weilai.com',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
