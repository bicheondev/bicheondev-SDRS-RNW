import { motion } from 'framer-motion';

import { getPressMotion } from '../../motion.js';
import { AppIcon } from '../Icons.jsx';

export default function BottomTab({
  activeTab = 'db',
  onDbClick,
  onManageClick,
  onMenuClick,
}) {
  return (
    <nav className="bottom-tab" aria-label="하단 탭">
      <motion.button
        className={`bottom-tab__item pressable-control pressable-control--tab ${activeTab === 'db' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onDbClick}
        {...getPressMotion('button')}
      >
        <AppIcon
          className="bottom-tab__icon"
          name="data_table"
          preset="tab"
          tone={activeTab === 'db' ? 'blue-500' : 'slate-400'}
        />
        <span className="bottom-tab__label">DB</span>
      </motion.button>
      <motion.button
        className={`bottom-tab__item pressable-control pressable-control--tab ${activeTab === 'manage' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onManageClick}
        {...getPressMotion('button')}
      >
        <AppIcon
          className="bottom-tab__icon"
          name="database"
          preset="tab"
          tone={activeTab === 'manage' ? 'blue-500' : 'slate-400'}
        />
        <span className="bottom-tab__label">데이터 관리</span>
      </motion.button>
      <motion.button
        className={`bottom-tab__item pressable-control pressable-control--tab ${activeTab === 'menu' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onMenuClick}
        {...getPressMotion('button')}
      >
        <AppIcon
          className="bottom-tab__icon"
          name="dehaze"
          preset="tab"
          tone={activeTab === 'menu' ? 'blue-500' : 'slate-400'}
        />
        <span className="bottom-tab__label">메뉴</span>
      </motion.button>
    </nav>
  );
}
