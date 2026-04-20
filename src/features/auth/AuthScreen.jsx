import { motion } from 'framer-motion';
import { useRef } from 'react';

export function AuthScreen({
  focusedField,
  isFilled,
  onFieldBlur,
  onFieldFocus,
  onPasswordChange,
  onSubmit,
  onUsernameChange,
  password,
  username,
}) {
  const passwordInputRef = useRef(null);

  const handleUsernameKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  return (
    <main className="app-shell app-shell--login">
      <section className="phone-screen phone-screen--login">
        <header className="login-header">
          <h1 className="login-title">
            <span className="login-title__accent">로그인 정보</span>를
            <br />
            입력하세요.
          </h1>
        </header>

        <form
          id="login-form"
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault();

            if (isFilled) {
              onSubmit();
            }
          }}
        >
          <label
            className={`input-shell ${focusedField === 'username' ? 'input-shell--focused' : ''}`}
          >
            <input
              className="login-input"
              type="text"
              value={username}
              placeholder="아이디"
              enterKeyHint="next"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => onUsernameChange(event.target.value)}
              onFocus={() => onFieldFocus('username')}
              onBlur={onFieldBlur}
              onKeyDown={handleUsernameKeyDown}
            />
          </label>

          <label
            className={`input-shell ${focusedField === 'password' ? 'input-shell--focused' : ''}`}
          >
            <input
              ref={passwordInputRef}
              className="login-input"
              type="password"
              value={password}
              placeholder="비밀번호"
              enterKeyHint="go"
              onChange={(event) => onPasswordChange(event.target.value)}
              onFocus={() => onFieldFocus('password')}
              onBlur={onFieldBlur}
            />
          </label>
        </form>

        <p
          className={`app-version ${focusedField ? 'app-version--hidden' : ''}`}
          aria-hidden={focusedField ? 'true' : undefined}
        >
          선박DB정보체계 버전 1.0
        </p>

        <motion.button
          className={`login-button pressable-control pressable-control--filled ${isFilled ? 'login-button--active' : ''}`}
          form="login-form"
          type="submit"
          disabled={!isFilled}
        >
          로그인
        </motion.button>
      </section>
    </main>
  );
}
