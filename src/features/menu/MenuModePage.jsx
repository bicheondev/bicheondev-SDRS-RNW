import { motion } from 'framer-motion';

import { getPressMotion } from '../../motion.js';
import { AppIcon } from '../../components/Icons.jsx';
import { MenuSubpageTopBar } from './MenuShared.jsx';

export function MenuModePage({ colorMode, onBack, onSelectMode }) {
  const modeOptions = [
    { value: 'system', label: '시스템 설정' },
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
  ];

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu-subpage">
        <MenuSubpageTopBar title="화면 모드" onBack={onBack} />

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
              {colorMode === modeOption.value ? (
                <AppIcon
                  className="menu-subpage__check"
                  name="check"
                  preset="checkbox"
                  tone="accent"
                />
              ) : null}
            </motion.button>
          ))}
        </div>
      </section>
    </main>
  );
}
