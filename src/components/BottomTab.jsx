import { motion } from 'framer-motion';

import { getPressMotion } from '../motion';
import { assets } from '../uiAssets';

export default function BottomTab({ activeTab = 'db', compact, onDbClick, onManageClick, onMenuClick }) {
  let db = compact ? assets.tabDbCompact : assets.tabDb;
  let manage = compact ? assets.tabManageCompact : assets.tabManage;
  let menu = compact ? assets.tabMenuCompact : assets.tabMenu;

  if (activeTab === 'menu') {
    db = assets.tabDbInactive;
    manage = assets.tabManageInactive;
    menu = assets.tabMenuActive;
  } else if (activeTab === 'manage') {
    db = assets.manageTabDb;
    manage = assets.manageTabActive;
    menu = assets.manageTabMenu;
  }

  return (
    <nav className="bottom-tab" aria-label="하단 탭">
      <motion.button
        className={`bottom-tab__item pressable-control pressable-control--tab ${activeTab === 'db' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onDbClick}
        {...getPressMotion('button')}
      >
        <img src={db} alt="" />
        <span>DB</span>
      </motion.button>
      <motion.button
        className={`bottom-tab__item pressable-control pressable-control--tab ${activeTab === 'manage' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onManageClick}
        {...getPressMotion('button')}
      >
        <img src={manage} alt="" />
        <span>데이터 관리</span>
      </motion.button>
      <motion.button
        className={`bottom-tab__item pressable-control pressable-control--tab ${activeTab === 'menu' ? 'bottom-tab__item--active' : ''}`}
        type="button"
        onClick={onMenuClick}
        {...getPressMotion('button')}
      >
        <img src={menu} alt="" />
        <span>메뉴</span>
      </motion.button>
    </nav>
  );
}
