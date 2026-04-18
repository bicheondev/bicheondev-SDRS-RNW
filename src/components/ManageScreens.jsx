import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';

import { emptyManageShipCard } from '../appDomain';
import { getModalBackdropMotion, getModalCardMotion, getPressMotion, getToastMotion } from '../motion';
import { assets, manageHomeSecondaryRows } from '../uiAssets';
import BottomTab from './BottomTab';
import { DeleteIcon, PlusIcon, StatusIcon } from './Icons';

function DataManagementHomeRow({ label, onClick, tone = 'default', value }) {
  const Tag = onClick ? motion.button : 'div';

  return (
    <Tag
      {...(onClick
        ? {
            type: 'button',
            onClick,
            ...getPressMotion('row'),
          }
        : {})}
      className={`manage-home__row ${onClick ? 'manage-home__row--button pressable-control pressable-control--surface' : ''}`}
    >
      <span className="manage-home__label">{label}</span>
      {value ? (
        <span className="manage-home__value-group">
          <span className={`manage-home__value ${tone === 'blue' ? 'manage-home__value--blue' : ''}`}>{value}</span>
          <img className="manage-home__chevron" src={assets.manageChevron} alt="" />
        </span>
      ) : null}
    </Tag>
  );
}

export function DataManagementHomeScreen({
  importAlert,
  pendingShipImport,
  rows,
  onDbOpen,
  onExport,
  onImagesImport,
  onImportAlertDismiss,
  onMenuOpen,
  onPendingShipImportDismiss,
  onPendingShipImportKeepExisting,
  onPendingShipImportReplaceAll,
  onPendingShipImportReplaceSameRegistrationChange,
  onShipEditOpen,
  onShipImport,
}) {
  const shipInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const primaryRowActions = {
    '선박 DB (.csv)': () => shipInputRef.current?.click(),
    '이미지 압축 파일 (.zip)': () => imagesInputRef.current?.click(),
  };

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--menu phone-screen--manage-home">
        <h1 className="manage-screen__title">데이터 관리</h1>

        <div className="manage-home__content">
          <div className="manage-home__group">
            {rows.map((row) => (
              <DataManagementHomeRow
                key={row.label}
                label={row.label}
                onClick={primaryRowActions[row.label]}
                tone={row.tone}
                value={row.value}
              />
            ))}
          </div>

          <div className="section-divider" />

          <div className="manage-home__group">
            {manageHomeSecondaryRows.map((label) => (
              <DataManagementHomeRow
                key={label}
                label={label}
                onClick={label === '선박 DB 편집하기' ? onShipEditOpen : onExport}
              />
            ))}
          </div>
        </div>

        <input
          ref={shipInputRef}
          hidden
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            onShipImport(event.target.files?.[0] ?? null);
            event.target.value = '';
          }}
        />
        <input
          ref={imagesInputRef}
          hidden
          type="file"
          accept=".zip,application/zip"
          onChange={(event) => {
            onImagesImport(event.target.files?.[0] ?? null);
            event.target.value = '';
          }}
        />

        <BottomTab activeTab="manage" compact={false} onDbClick={onDbOpen} onManageClick={undefined} onMenuClick={onMenuOpen} />

        <AnimatePresence>
          {importAlert ? (
            <ManageAlertModal
              title={importAlert.title}
              copy={importAlert.copy}
              confirmLabel="확인"
              confirmTone="neutral"
              hideCancel
              onConfirm={onImportAlertDismiss}
            />
          ) : null}
          {pendingShipImport ? (
            <ManageShipImportModal
              onDismiss={onPendingShipImportDismiss}
              onKeepExisting={onPendingShipImportKeepExisting}
              onReplaceAll={onPendingShipImportReplaceAll}
              onReplaceSameRegistrationChange={onPendingShipImportReplaceSameRegistrationChange}
              replaceSameRegistration={pendingShipImport.replaceSameRegistration}
            />
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}

function ManageSubpageTopBar({ saveActive = false, saveLabel = '저장', title, onAdd, onBack, onSave }) {
  return (
    <>
      <header className="manage-subpage__top-bar">
        <motion.button
          className="detail-back-button pressable-control pressable-control--icon"
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          {...getPressMotion('icon')}
        >
          <img src={assets.manageBack} alt="" />
        </motion.button>
        <div className="manage-subpage__actions">
          {onAdd ? (
            <motion.button
              className="manage-subpage__add pressable-control pressable-control--icon"
              type="button"
              aria-label="추가"
              onClick={onAdd}
              {...getPressMotion('icon')}
            >
              <PlusIcon className="manage-subpage__add-icon" />
            </motion.button>
          ) : null}
          <motion.button
            className={`manage-subpage__save pressable-control pressable-control--pill ${saveActive ? 'manage-subpage__save--active' : ''}`}
            type="button"
            disabled={!saveActive}
            onClick={onSave}
            {...getPressMotion('button', { enabled: saveActive })}
          >
            {saveLabel}
          </motion.button>
        </div>
      </header>
      <h1 className="manage-screen__title manage-screen__title--subpage">{title}</h1>
    </>
  );
}

function ManageSearchBar({ onChange, onClear, placeholder = '검색', value = '' }) {
  return (
    <div className="manage-search-bar">
      <img className="manage-search-bar__icon" src={assets.manageSearch} alt="" />
      <input
        className={`manage-search-bar__input ${value ? 'manage-search-bar__input--filled' : ''}`}
        type="text"
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <motion.button
          className="manage-search-bar__cancel-button pressable-control pressable-control--icon"
          type="button"
          aria-label="검색 지우기"
          onClick={onClear}
          {...getPressMotion('icon')}
        >
          <img className="manage-search-bar__cancel" src={assets.manageCancel} alt="" />
        </motion.button>
      ) : null}
    </div>
  );
}

function ManageFieldInput({ edited = false, onChange, readOnly = false, value }) {
  return (
    <label className={`manage-field-pill ${edited ? 'manage-field-pill--edited' : ''}`}>
      <input
        className="manage-field-pill__input"
        type="text"
        value={value}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : 0}
        spellCheck={false}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function ManageTextBox({
  active = false,
  edited = false,
  fullWidth = false,
  onChange,
  readOnly = false,
  value,
  variant = 'title',
}) {
  return (
    <label
      className={[
        'manage-textbox',
        `manage-textbox--${variant}`,
        active ? 'manage-textbox--active' : '',
        edited ? 'manage-textbox--edited' : '',
        fullWidth ? 'manage-textbox--full' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        className="manage-textbox__input"
        type="text"
        value={value}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : 0}
        spellCheck={false}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function ManageShipCard({
  card,
  editable = false,
  originalCard,
  showDeleteButton = false,
  showEditButton = false,
  onDelete,
  onEditActivate,
  onFieldChange,
  onImageChange,
}) {
  const imageInputRef = useRef(null);
  const baselineCard = originalCard ?? emptyManageShipCard;
  const titleEdited = editable ? card.title !== baselineCard.title : false;
  const registrationEdited = editable ? card.registration !== baselineCard.registration : false;
  const portEdited = editable ? card.port !== baselineCard.port : false;
  const businessEdited = editable ? card.business !== baselineCard.business : false;
  const tonnageEdited = editable ? card.tonnage !== baselineCard.tonnage : false;
  const sonarEdited = editable ? Boolean(card.sonar) !== Boolean(baselineCard.sonar) : false;
  const detectorEdited = editable ? Boolean(card.detector) !== Boolean(baselineCard.detector) : false;
  const imageSource = card.image ?? assets.manageImage;

  const handleImageInputChange = (event) => {
    const [file] = event.target.files ?? [];
    if (file) {
      onImageChange?.(file);
    }
    event.target.value = '';
  };

  return (
    <article className={`manage-ship-card ${card.selected ? 'manage-ship-card--selected' : ''}`}>
      <div className="manage-ship-card__hero">
        <div className="manage-ship-card__identity">
          <ManageTextBox
            edited={titleEdited}
            onChange={(nextValue) => onFieldChange?.('title', nextValue)}
            readOnly={!editable}
            value={card.title}
            variant="title"
          />
          <ManageTextBox
            active={card.selected}
            edited={registrationEdited}
            onChange={(nextValue) => onFieldChange?.('registration', nextValue)}
            readOnly={!editable}
            value={card.registration}
            variant="subtitle"
          />
        </div>
        {editable ? (
          <>
            <motion.button
              className="manage-ship-card__image-button pressable-control pressable-control--media"
              type="button"
              aria-label="선박 이미지 선택"
              onClick={() => imageInputRef.current?.click()}
              {...getPressMotion('card')}
            >
              <img className="manage-ship-card__image" src={imageSource} alt="" />
            </motion.button>
            <input
              ref={imageInputRef}
              className="manage-ship-card__image-input"
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
            />
          </>
        ) : (
          <img className="manage-ship-card__image" src={imageSource} alt="" />
        )}
        {showEditButton ? (
          <motion.button
            className="manage-ship-card__edit-button pressable-control pressable-control--icon"
            type="button"
            aria-label="선박 정보 수정"
            onClick={onEditActivate}
            {...getPressMotion('icon')}
          >
            <img src={assets.manageEdit} alt="" />
          </motion.button>
        ) : null}
      </div>

      <div className="manage-ship-card__details">
        <div className="manage-ship-card__row">
          <span className="manage-ship-card__label">항포구</span>
          <ManageFieldInput edited={portEdited} onChange={(nextValue) => onFieldChange?.('port', nextValue)} readOnly={!editable} value={card.port} />
        </div>
        <div className="manage-ship-card__row">
          <span className="manage-ship-card__label">업종</span>
          <ManageFieldInput edited={businessEdited} onChange={(nextValue) => onFieldChange?.('business', nextValue)} readOnly={!editable} value={card.business} />
        </div>
        <div className="manage-ship-card__row">
          <span className="manage-ship-card__label">총톤수</span>
          <ManageFieldInput edited={tonnageEdited} onChange={(nextValue) => onFieldChange?.('tonnage', nextValue)} readOnly={!editable} value={card.tonnage} />
        </div>
      </div>

      <div className="manage-ship-card__rule" />

      <div className="manage-ship-card__equipment">
        <motion.button
          className={`manage-ship-card__equipment-item pressable-control pressable-control--surface ${
            sonarEdited
              ? 'manage-ship-card__equipment-item--blue'
              : card.sonar
                ? 'manage-ship-card__equipment-item--violet'
                : 'manage-ship-card__equipment-item--muted'
          }`}
          type="button"
          aria-label={`소나 ${card.sonar ? '켜짐' : '꺼짐'}`}
          aria-pressed={card.sonar}
          onClick={() => onFieldChange?.('sonar', !card.sonar)}
          {...getPressMotion('button')}
        >
          <span className="manage-ship-card__equipment-label">소나</span>
          <StatusIcon name={card.sonar ? 'check' : 'close'} className="status-icon--manage" />
        </motion.button>
        <motion.button
          className={`manage-ship-card__equipment-item pressable-control pressable-control--surface ${
            detectorEdited
              ? 'manage-ship-card__equipment-item--blue'
              : card.detector
                ? 'manage-ship-card__equipment-item--violet'
                : 'manage-ship-card__equipment-item--muted'
          }`}
          type="button"
          aria-label={`어군 탐지기 ${card.detector ? '켜짐' : '꺼짐'}`}
          aria-pressed={card.detector}
          onClick={() => onFieldChange?.('detector', !card.detector)}
          {...getPressMotion('button')}
        >
          <span className="manage-ship-card__equipment-label">어군 탐지기</span>
          <StatusIcon name={card.detector ? 'check' : 'close'} className="status-icon--manage" />
        </motion.button>
      </div>

      {showDeleteButton ? (
        <motion.button
          className="manage-ship-card__delete pressable-control pressable-control--filled pressable-control--danger"
          type="button"
          aria-label="선박 삭제"
          onClick={onDelete}
          {...getPressMotion('button')}
        >
          <DeleteIcon className="manage-ship-card__delete-icon" />
        </motion.button>
      ) : null}
    </article>
  );
}

function ManageAlertModal({
  cancelLabel = '아니요',
  confirmLabel = '네',
  confirmTone = 'danger',
  copy = '저장되지 않은 사항은 모두 삭제돼요.\n진행하시겠어요?',
  hideCancel = false,
  onCancel,
  onConfirm,
  title = '경고 사항',
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const backdropMotion = getModalBackdropMotion(reducedMotion);
  const cardMotion = getModalCardMotion(reducedMotion);
  const confirmButtonClassName = [
    'manage-discard-modal__button',
    confirmTone === 'danger' ? 'manage-discard-modal__button--danger' : 'manage-discard-modal__button--neutral',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="manage-discard-modal">
      <motion.div className="manage-discard-modal__scrim" {...backdropMotion} />
      <motion.div className="manage-discard-modal__card" {...cardMotion}>
        <h2 className="manage-discard-modal__title">{title}</h2>
        <p className="manage-discard-modal__copy">{copy}</p>
        <div className="manage-discard-modal__actions">
          {!hideCancel ? (
            <motion.button
              className="manage-discard-modal__button manage-discard-modal__button--ghost pressable-control pressable-control--surface"
              type="button"
              onClick={onCancel}
              {...getPressMotion('button')}
            >
              {cancelLabel}
            </motion.button>
          ) : null}
          <motion.button
            className={`${confirmButtonClassName} pressable-control pressable-control--filled`}
            type="button"
            onClick={onConfirm}
            {...getPressMotion('button')}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function ManageShipImportModal({
  onDismiss,
  onKeepExisting,
  onReplaceAll,
  onReplaceSameRegistrationChange,
  replaceSameRegistration = true,
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const backdropMotion = getModalBackdropMotion(reducedMotion);
  const cardMotion = getModalCardMotion(reducedMotion);

  return (
    <div className="manage-discard-modal">
      <motion.button
        className="manage-discard-modal__scrim-button interaction-reset"
        type="button"
        aria-label="선박 DB 불러오기 닫기"
        onClick={onDismiss}
        {...backdropMotion}
      />
      <motion.div className="manage-discard-modal__card" {...cardMotion}>
        <div className="manage-ship-import-modal__content">
          <div className="manage-ship-import-modal__header">
            <h2 className="manage-discard-modal__title">선박 DB 불러오기</h2>
            <p className="manage-discard-modal__copy">기존에 있던 데이터는 삭제할까요?</p>
          </div>
          <label className="manage-ship-import-modal__checkbox-row interaction-reset">
            <input
              className="manage-ship-import-modal__checkbox"
              type="checkbox"
              checked={replaceSameRegistration}
              onChange={(event) => onReplaceSameRegistrationChange(event.target.checked)}
            />
            <span className={`manage-ship-import-modal__checkbox-box ${replaceSameRegistration ? 'manage-ship-import-modal__checkbox-box--checked' : ''}`}>
              {replaceSameRegistration ? <img className="manage-ship-import-modal__checkbox-icon" src={assets.manageImportCheck} alt="" /> : null}
            </span>
            <span className="manage-ship-import-modal__checkbox-label">어선정보가 같은 어선은 대체하기</span>
          </label>
        </div>
        <div className="manage-discard-modal__actions">
          <motion.button
            className="manage-discard-modal__button manage-ship-import-modal__button manage-ship-import-modal__button--overwrite pressable-control pressable-control--surface"
            type="button"
            onClick={onReplaceAll}
            {...getPressMotion('button')}
          >
            기존 데이터 삭제
          </motion.button>
          <motion.button
            className="manage-discard-modal__button manage-ship-import-modal__button manage-ship-import-modal__button--keep pressable-control pressable-control--filled"
            type="button"
            onClick={onKeepExisting}
            {...getPressMotion('button')}
          >
            기존 데이터 유지
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function ManageSavedToast({ message, onDismiss }) {
  const reducedMotion = useReducedMotion() ?? false;
  const toastMotion = getToastMotion(reducedMotion);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef(0);
  const dragPointerIdRef = useRef(null);
  const dragStartYRef = useRef(0);

  const resetDragState = () => {
    setDragging(false);
    setDragOffset(0);
    dragOffsetRef.current = 0;
    dragPointerIdRef.current = null;
  };

  const handlePointerDown = (event) => {
    dragStartYRef.current = event.clientY;
    dragPointerIdRef.current = event.pointerId;
    setDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragging || dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    const nextDragOffset = Math.max(0, event.clientY - dragStartYRef.current);
    dragOffsetRef.current = nextDragOffset;
    setDragOffset(nextDragOffset);
  };

  const handlePointerUp = (event) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    if (dragOffsetRef.current > 56) {
      resetDragState();
      onDismiss();
      return;
    }

    resetDragState();
  };

  const handlePointerCancel = (event) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    resetDragState();
  };

  return (
    <div
      className={`manage-saved-toast-shell ${dragging ? 'manage-saved-toast-shell--dragging' : ''}`.trim()}
      role="status"
      aria-live="polite"
      style={{ '--manage-saved-toast-drag-offset': `${dragOffset}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <motion.div className="manage-saved-toast" {...toastMotion}>
        <StatusIcon name="check_circle" className="manage-saved-toast__icon" />
        <span className="manage-saved-toast__message">{message}</span>
      </motion.div>
    </div>
  );
}

export function DataManagementShipEditScreen({
  cards,
  dirty,
  originalCards,
  searchQuery,
  showDiscardModal,
  toast,
  onAdd,
  onBack,
  onConfirmDiscard,
  onDelete,
  onDismissDiscard,
  onDismissToast,
  onFieldChange,
  onImageChange,
  onSave,
  onSearchChange,
  onSearchClear,
}) {
  const loweredQuery = searchQuery.trim().toLowerCase();
  const visibleCards = loweredQuery
    ? cards.filter((card) =>
        [card.searchKey, card.title, card.registration, card.port, card.business].some((value) =>
          value.toLowerCase().includes(loweredQuery),
        ),
      )
    : cards;

  return (
    <main className="app-shell">
      <section className="phone-screen phone-screen--manage-edit">
        <ManageSubpageTopBar title="선박 DB 편집하기" saveActive={dirty} onAdd={onAdd} onBack={onBack} onSave={dirty ? onSave : undefined} />

        <div className="manage-edit-screen__content">
          {visibleCards.map((card, index) => (
            <div key={`${card.id}-${index}`}>
              <div className="manage-edit-screen__section">
                <ManageShipCard
                  card={card}
                  editable
                  originalCard={originalCards.find((item) => item.id === card.id)}
                  showDeleteButton
                  showEditButton={false}
                  onDelete={() => onDelete(card.id)}
                  onFieldChange={(field, value) => onFieldChange(card.id, field, value)}
                  onImageChange={(file) => onImageChange(card.id, file)}
                />
              </div>
              {index < visibleCards.length - 1 ? <div className="section-divider" /> : null}
            </div>
          ))}
        </div>

        <ManageSearchBar value={searchQuery} onChange={onSearchChange} onClear={onSearchClear} />

        <AnimatePresence>{toast ? <ManageSavedToast key={toast.id} message={toast.message} onDismiss={onDismissToast} /> : null}</AnimatePresence>
        <AnimatePresence>{showDiscardModal ? <ManageAlertModal onCancel={onDismissDiscard} onConfirm={onConfirmDiscard} /> : null}</AnimatePresence>
      </section>
    </main>
  );
}
