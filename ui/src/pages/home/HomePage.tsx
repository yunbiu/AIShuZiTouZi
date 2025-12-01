import React from 'react';
import styles from './index.less';
import { FileTextOutlined, UngroupOutlined, TableOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import homeJpeg from '@/pages/home/home.jpeg';
import { history } from 'umi';

const HomePage = () => {
    const navigateToBasicInfo = (pathname: string) => {
        localStorage.setItem('curpath', pathname);
        history.push('/' + pathname);
    };

    // 定义菜单项图标颜色
    const iconColors = {
        basicInfo: '#3b82f6',
        cryptoAi: '#8b5cf6',
        business: '#0d9488',
        visualQuery: '#22c55e',
        intelligent: '#f97316'
    };

    return (
        <div className={styles.container} style={{ backgroundImage: `url(${homeJpeg})` }}>
            <div className={styles.title}>软件开发前后端融合学习平台</div>
            <div className={styles.menuGrid}>
                {/* 左上：基础信息管理 */}
                <div className={`${styles.menuItem} ${styles.topLeft}`}>
                    <button onClick={() => navigateToBasicInfo("basic-info")} className={styles.menuButton}>
                        <FileTextOutlined style={{ fontSize: '5rem', color: iconColors.basicInfo }} />
                        <div>基础信息管理</div>
                    </button>
                </div>

                {/* 右上：AI驱动数字货币投资辅助系统 */}
                <div className={`${styles.menuItem} ${styles.topRight}`}>
                    <button onClick={() => navigateToBasicInfo("crypto-ai")} className={styles.menuButton}>
                        <BarChartOutlined style={{ fontSize: '5rem', color: iconColors.cryptoAi }} />
                        <div>AI驱动数字货币投资辅助系统</div>
                    </button>
                </div>

                {/* 中间：业务操作管理 */}
                <div className={`${styles.menuItem} ${styles.center}`}>
                    <button onClick={() => navigateToBasicInfo("warehouse-mng")} className={styles.menuButton}>
                        <SettingOutlined style={{ fontSize: '6rem', color: iconColors.business }} />
                        <div>业务操作管理</div>
                    </button>
                </div>

                {/* 左中：可视化查询管理 */}
                <div className={`${styles.menuItem} ${styles.bottomLeft}`}>
                    <button onClick={() => navigateToBasicInfo("warehouse-mng")} className={styles.menuButton}>
                        <TableOutlined style={{ fontSize: '5rem', color: iconColors.visualQuery }} />
                        <div>可视化查询管理</div>
                    </button>
                </div>

                {/* 右下：智能化集成管理 */}
                <div className={`${styles.menuItem} ${styles.bottomRight}`}>
                    <button onClick={() => navigateToBasicInfo("warehouse-mng")} className={styles.menuButton}>
                        <UngroupOutlined style={{ fontSize: '5rem', color: iconColors.intelligent }} />
                        <div>智能化集成管理</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;