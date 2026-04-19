import { motion } from 'framer-motion';

import { getPressMotion } from '../../motion.js';
import { colorModeLabels } from '../../assets/assets.js';
import { AppIcon } from '../../components/Icons.jsx';

function MenuRow({ children, detail, onClick, showArrow = false }) {
  return (
    <motion.button
      className="menu-row pressable-control pressable-control--surface"
      type="button"
      onClick={onClick}
      {...getPressMotion('row')}
    >
      <span className="menu-row__label">{children}</span>
      {detail || showArrow ? (
        <span className="menu-row__detail-group">
          {detail ? <span className="menu-row__detail">{detail}</span> : null}
          <AppIcon
            className="menu-row__arrow"
            name="arrow_forward_ios"
            preset="iosArrow"
            tone="muted"
          />
        </span>
      ) : null}
    </motion.button>
  );
}

export function MenuPage({ colorMode, onColorModeOpen, onInfoOpen, onLogout }) {
  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu">
        <h1 className="menu-screen__title">메뉴</h1>

        <div className="menu-screen__content">
          <MenuRow detail={colorModeLabels[colorMode]} onClick={onColorModeOpen}>
            화면 모드
          </MenuRow>

          <div className="menu-screen__divider" />

          <div className="menu-screen__group">
            <MenuRow showArrow onClick={onInfoOpen}>
              앱 정보
            </MenuRow>
            <MenuRow onClick={onLogout}>로그아웃</MenuRow>
          </div>
        </div>
      </section>
    </main>
  );
}
