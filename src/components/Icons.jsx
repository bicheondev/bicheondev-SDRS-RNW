const ICON_PRESETS = {
  default: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0,
    opticalSize: 24,
    slotSize: 24,
  },
  action: {
    glyphSize: 22,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 24,
    slotSize: 24,
  },
  checkbox: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0,
    opticalSize: 24,
    slotSize: 24,
  },
  closeChip: {
    glyphSize: 20,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 20,
    slotSize: 24,
  },
  disclosure: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0.5,
    opticalSize: 24,
    slotSize: 24,
  },
  emptyState: {
    glyphSize: 46,
    offsetX: 0,
    offsetY: 0.5,
    opticalSize: 48,
    slotSize: 48,
  },
  iosArrow: {
    glyphSize: 24,
    offsetX: -0.25,
    offsetY: 0.25,
    opticalSize: 24,
    slotSize: 24,
  },
  modalClose: {
    glyphSize: 20,
    offsetX: 0,
    offsetY: 0,
    opticalSize: 24,
    slotSize: 20,
  },
  plus: {
    glyphSize: 30,
    offsetX: 0,
    offsetY: 0,
    opticalSize: 24,
    slotSize: 24,
  },
  reorder: {
    glyphSize: 18,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 20,
    slotSize: 18,
  },
  search: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 24,
    slotSize: 24,
  },
  statusCompact: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 24,
    slotSize: 24,
  },
  statusSmall: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 24,
    slotSize: 24,
  },
  tab: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 24,
    slotSize: 24,
  },
  viewMode: {
    glyphSize: 24,
    offsetX: 0,
    offsetY: 0.25,
    opticalSize: 24,
    slotSize: 24,
  },
};

export function AppIcon({
  className = '',
  glyphSize,
  label,
  name,
  offsetX,
  offsetY,
  opticalSize,
  preset = 'default',
  slotSize,
  style,
  tone = 'current',
}) {
  const basePreset = ICON_PRESETS[preset] ?? ICON_PRESETS.default;
  const resolvedSlotSize = slotSize ?? basePreset.slotSize;
  const resolvedGlyphSize = glyphSize ?? basePreset.glyphSize;
  const resolvedOpticalSize = opticalSize ?? basePreset.opticalSize;
  const resolvedOffsetX = offsetX ?? basePreset.offsetX;
  const resolvedOffsetY = offsetY ?? basePreset.offsetY;

  return (
    <span
      className={`app-icon material-symbols-rounded app-icon--tone-${tone} ${className}`.trim()}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      role={label ? 'img' : undefined}
      style={{
        '--app-icon-glyph-size': `${resolvedGlyphSize}px`,
        '--app-icon-offset-x': `${resolvedOffsetX}px`,
        '--app-icon-offset-y': `${resolvedOffsetY}px`,
        '--app-icon-opsz': String(resolvedOpticalSize),
        '--app-icon-slot-size': `${resolvedSlotSize}px`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
