import { motion } from 'framer-motion';

import { getPressMotion } from '../motion';
import { assets, colorModeLabels } from '../uiAssets';
import BottomTab from './BottomTab';

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
          <img className="menu-row__arrow" src={assets.menuArrowForward} alt="" />
        </span>
      ) : null}
    </motion.button>
  );
}

function SubpageTopBar({ title, onBack }) {
  return (
    <>
      <header className="detail-top-bar detail-top-bar--menu">
        <motion.button
          className="detail-back-button pressable-control pressable-control--icon"
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          {...getPressMotion('icon')}
        >
          <img src={assets.menuBack} alt="" />
        </motion.button>
      </header>
      <h1 className="menu-screen__title menu-screen__title--subpage">{title}</h1>
    </>
  );
}

export function MenuScreen({ colorMode, compact, onColorModeOpen, onDbOpen, onInfoOpen, onLogout, onManageOpen }) {
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

        <BottomTab activeTab="menu" compact={compact} onDbClick={onDbOpen} onManageClick={onManageOpen} onMenuClick={undefined} />
      </section>
    </main>
  );
}

export function MenuModeScreen({ colorMode, onBack, onSelectMode }) {
  const modeOptions = [
    { value: 'system', label: '시스템 설정' },
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
  ];

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu-subpage">
        <SubpageTopBar title="화면 모드" onBack={onBack} />

        <div className="menu-subpage__section">
          {modeOptions.map((modeOption) => (
            <motion.button
              key={modeOption.value}
              className="menu-subpage__row menu-subpage__row--button pressable-control pressable-control--surface"
              type="button"
              onClick={() => onSelectMode(modeOption.value)}
              {...getPressMotion('row')}
            >
              <span className="menu-subpage__label">{modeOption.label}</span>
              {colorMode === modeOption.value ? <img className="menu-subpage__check" src={assets.menuCheck} alt="" /> : null}
            </motion.button>
          ))}
        </div>
      </section>
    </main>
  );
}

export function MenuInfoScreen({ onBack }) {
  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu-subpage">
        <SubpageTopBar title="앱 정보" onBack={onBack} />

        <div className="menu-info">
          <div className="menu-info__background" />
          <div className="menu-info__content">
            <img className="menu-info__mark" src={assets.menuInfoMark} alt="" />
            <div className="menu-info__logo-wrap">
              <img className="menu-info__logo" src={assets.menuInfoLogo} alt="SDRS 선박DB조회체계" />
            </div>
            <p className="menu-info__version">버전 1.0</p>
          </div>
        </div>
      </section>
    </main>
  );
}
