import { motion } from 'framer-motion';

import { getPressMotion } from '../../motion.js';
import { AppIcon } from '../../components/Icons.jsx';

export function MenuSubpageTopBar({ title, onBack }) {
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
          <AppIcon
            className="detail-back-button__icon"
            name="arrow_back_ios_new"
            preset="iosArrow"
            tone="secondary"
          />
        </motion.button>
      </header>
      <h1 className="menu-screen__title menu-screen__title--subpage">{title}</h1>
    </>
  );
}
