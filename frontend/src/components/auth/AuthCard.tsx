'use client';

import React, { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

interface AuthCardProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export default function AuthCard({ onSuccess, initialMode = 'login' }: AuthCardProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'email-login'>(initialMode);

  // Form states
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regUserName, setRegUserName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick fill test account for quick testing
  const handleQuickFill = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setError(null);
  };

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const data = await apiRequest<{ accessToken: string; user?: any }>(
        '/account/login',
        {
          method: 'POST',
          body: JSON.stringify({
            userName: identifier.trim(),
            password,
          }),
        }
      );

      saveAuth(data.accessToken, data.user || { userName: identifier.trim() });
      setSuccessMsg('Успешный вход!');
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (regPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      // 1. Register account
      await apiRequest('/account/register', {
        method: 'POST',
        body: JSON.stringify({
          email: regEmail.trim(),
          fullName: regFullName.trim(),
          userName: regUserName.trim(),
          password: regPassword,
          confirmPassword: regConfirmPassword,
        }),
      });

      // 2. Automatically log in after registration
      const authData = await apiRequest<{ accessToken: string; user?: any }>(
        '/account/login',
        {
          method: 'POST',
          body: JSON.stringify({
            userName: regUserName.trim(),
            password: regPassword,
          }),
        }
      );

      saveAuth(authData.accessToken, authData.user || { userName: regUserName.trim() });
      setSuccessMsg('Аккаунт успешно создан!');
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Введите адрес электронной почты');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await apiRequest('/account/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: identifier.trim() }),
      });
      setSuccessMsg('Ссылка для восстановления отправлена на ваш email (если аккаунт существует).');
    } catch (err: any) {
      setError(err.message || 'Не удалось отправить ссылку.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-white border border-neutral-200/90 rounded-2xl p-7 sm:p-9 shadow-sm transition-all duration-300">
      {/* Alerts */}
      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl leading-relaxed animate-fadeIn">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl leading-relaxed animate-fadeIn">
          {successMsg}
        </div>
      )}

      {/* ===================== 1. LOGIN MODE ===================== */}
      {mode === 'login' && (
        <div>
          <h2 className="text-[22px] font-semibold text-neutral-900 mb-6 tracking-tight">
            Войти в Instagram
          </h2>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Username or Email Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Имя пользователя, номер мобильного телефона или электронный адрес"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-3.5 py-3 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-3 pr-16 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
              />
              {password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 select-none"
                >
                  {showPassword ? 'Скрыть' : 'Показать'}
                </button>
              )}
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="w-full py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081d6] text-white font-semibold text-sm rounded-xl transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Войти'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center my-4">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('forgot');
              }}
              className="text-xs sm:text-[13px] font-medium text-neutral-800 hover:text-neutral-500 transition"
            >
              Забыли пароль?
            </button>
          </div>

          {/* Login with Email Button (Requested explicitly instead of Facebook) */}
          <div className="mb-3.5">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('email-login');
              }}
              className="w-full py-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:bg-[#D8DADF] text-neutral-800 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2.5"
            >
              {/* Mail Icon */}
              <svg
                className="w-4 h-4 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Войти с Email</span>
            </button>
          </div>

          {/* Create New Account Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setMode('register');
              }}
              className="w-full py-3 border border-[#0095F6] text-[#0095F6] hover:bg-[#0095F6]/5 active:bg-[#0095F6]/10 font-semibold text-sm rounded-xl transition"
            >
              Создать новый аккаунт
            </button>
          </div>

          {/* Test Accounts Quick Select */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 text-center mb-2">
              Тестовые аккаунты для быстрой проверки:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('alex_photographer', 'Password123!')}
                className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition"
              >
                alex_photographer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('maria_art', 'Password123!')}
                className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition"
              >
                maria_art
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('john_traveler', 'Password123!')}
                className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition"
              >
                john_traveler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 2. REGISTER MODE ===================== */}
      {mode === 'register' && (
        <div>
          <h2 className="text-[22px] font-semibold text-neutral-900 mb-2 tracking-tight">
            Регистрация в Instagram
          </h2>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            Зарегистрируйтесь, чтобы смотреть фото и видео ваших друзей.
          </p>

          <form onSubmit={handleRegister} className="space-y-3">
            <input
              type="email"
              placeholder="Электронный адрес"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <input
              type="text"
              placeholder="Имя и фамилия"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <input
              type="text"
              placeholder="Имя пользователя"
              value={regUserName}
              onChange={(e) => setRegUserName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <input
              type="password"
              placeholder="Пароль"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <input
              type="password"
              placeholder="Подтверждение пароля"
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <p className="text-[11px] text-neutral-400 py-1 leading-normal">
              Регистрируясь, вы принимаете наши Условия, Политику конфиденциальности и Политику в отношении файлов cookie.
            </p>

            <button
              type="submit"
              disabled={loading || !regEmail || !regUserName || !regPassword || !regConfirmPassword}
              className="w-full py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081d6] text-white font-semibold text-sm rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-neutral-100 text-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="text-xs sm:text-[13px] text-neutral-700 hover:text-neutral-950 transition"
            >
              Есть аккаунт? <span className="font-semibold text-[#0095F6]">Войти</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================== 3. EMAIL LOGIN QUICK MODE ===================== */}
      {mode === 'email-login' && (
        <div>
          <h2 className="text-[22px] font-semibold text-neutral-900 mb-2 tracking-tight">
            Вход по Email
          </h2>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            Введите ваш электронный адрес и пароль от аккаунта для быстрого входа.
          </p>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <input
              type="email"
              placeholder="Электронный адрес"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-3.5 py-3 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-3 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="w-full py-3 bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-sm rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Войти по Email'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="text-xs sm:text-[13px] font-medium text-neutral-600 hover:text-neutral-950 transition"
            >
              ← Вернуться к стандартному входу
            </button>
          </div>
        </div>
      )}

      {/* ===================== 4. FORGOT PASSWORD MODE ===================== */}
      {mode === 'forgot' && (
        <div>
          <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-neutral-900 flex items-center justify-center text-2xl">
            🔒
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2 text-center tracking-tight">
            Не удается войти?
          </h2>
          <p className="text-xs text-neutral-500 mb-6 text-center leading-relaxed">
            Введите ваш электронный адрес, и мы отправим ссылку для восстановления доступа.
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <input
              type="email"
              placeholder="Электронный адрес"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-3.5 py-3 text-xs sm:text-[13px] bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] transition"
            />

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full py-3 bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-sm rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Получить ссылку для входа'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="text-xs sm:text-[13px] font-semibold text-neutral-800 hover:text-neutral-950 transition"
            >
              Вернуться ко входу
            </button>
          </div>
        </div>
      )}

      {/* Meta Branding at Card Bottom */}
      <div className="mt-7 flex items-center justify-center gap-1.5 text-neutral-600 select-none">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" className="hidden" />
          <path d="M16.99 7.23c-1.74 0-3.32.94-4.22 2.38-.9-1.44-2.48-2.38-4.22-2.38-3.04 0-5.45 2.65-4.8 5.89.5 2.47 2.67 4.38 5.17 4.38 1.93 0 3.66-1.12 4.45-2.76.79 1.64 2.52 2.76 4.45 2.76 2.5 0 4.67-1.91 5.17-4.38.65-3.24-1.76-5.89-4.8-5.89zm-8.44 8.27c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm8.88 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
        </svg>
        <span className="text-xs font-semibold tracking-wide text-neutral-500">Meta</span>
      </div>
    </div>
  );
}
