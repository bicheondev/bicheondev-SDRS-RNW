import { assets } from '../../assets/assets.js';
import { MenuSubpageTopBar } from './MenuShared.jsx';

export function MenuInfoPage({ onBack }) {
  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu-subpage">
        <MenuSubpageTopBar title="앱 정보" onBack={onBack} />

        <div className="menu-info">
          <div className="menu-info__background" />
          <div className="menu-info__content">
            <img className="menu-info__mark" src={assets.menuInfoMark} alt="" />
            <div className="menu-info__logo-wrap">
              <img
                className="menu-info__logo"
                src={assets.menuInfoLogo}
                alt="SDRS 선박DB조회체계"
              />
            </div>
            <p className="menu-info__version">버전 1.0</p>
          </div>
        </div>
      </section>
    </main>
  );
}
