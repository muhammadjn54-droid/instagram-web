'use client';

import { Eye, Heart, Star } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Marketing column of the authentication screens.
 *
 * Server Component: it contains no state and no interactivity.
 */
export function AuthHero() {
  const t = useT();
  return (
    <div className="flex w-full max-w-[540px] flex-col justify-between">
      <div className="mb-6">
        <Logo showWordmark={false} iconClassName="h-10 w-10 sm:h-11 sm:w-11 rounded-[12px]" />
      </div>

      <h1 className="mb-8 text-3xl font-semibold leading-[1.25] tracking-tight text-neutral-900 sm:text-4xl lg:text-[40px]">
        {t('Посмотрите, какими моментами из жизни поделились ваши')}{' '}
        <span className="bg-gradient-to-r from-[#ff7a00] to-[#ff0169] bg-clip-text text-transparent">
          {t('близкие')}
        </span>{' '}
        <span className="text-[#d62976]">{t('друзья')}</span>.
      </h1>

      <div className="relative flex h-[400px] w-full items-center justify-center select-none">
        <div
          aria-hidden="true"
          className="absolute h-72 w-72 rounded-pill bg-gradient-to-tr from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 blur-3xl"
        />

        <div className="absolute -left-2 z-10 h-[300px] w-[200px] -translate-y-2 -rotate-12 overflow-hidden rounded-[28px] border-[4px] border-neutral-900 shadow-2xl transition-transform duration-300 hover:-rotate-[8deg] sm:left-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static asset in /public */}
          <img
            src="/images/neon-story.jpg"
            alt={t('Пример истории')}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          <div className="absolute left-3 right-3 top-3 h-1 overflow-hidden rounded-pill bg-white/40">
            <div className="h-full w-2/3 bg-white" />
          </div>
        </div>

        <div className="relative z-20 h-[360px] w-[240px] overflow-hidden rounded-[34px] border-[5px] border-neutral-950 bg-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static asset in /public */}
          <img
            src="/images/friends-story.jpg"
            alt={t('История близких друзей')}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-3">
            <div className="mb-2 flex gap-1">
              <div className="h-0.5 flex-1 rounded-pill bg-white" />
              <div className="h-0.5 flex-1 rounded-pill bg-white/40" />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <span className="h-6 w-6 overflow-hidden rounded-pill border border-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local static asset in /public */}
                  <img
                    src="/images/friends-story.jpg"
                    alt={t('Аватар автора истории')}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span>chloe</span>
                <span className="font-normal text-white/70">{t('2 ч.')}</span>
              </span>
              <span className="text-white/80">•••</span>
            </div>
          </div>

          <div className="absolute left-3 top-16 flex items-center gap-1.5 rounded-pill border border-white/30 bg-neutral-900/80 px-2.5 py-1 text-xs text-white backdrop-blur-md">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('Только близкие')}</span>
          </div>

          <div className="absolute right-3 top-28 flex h-6 w-6 items-center justify-center rounded-pill border border-white/60 bg-[#00C73C] text-xs font-bold text-white shadow-md">
            <Star className="h-3 w-3" aria-hidden="true" />
          </div>

          <div className="absolute bottom-16 right-3 h-8 w-8 rounded-pill border-2 border-white bg-neutral-800 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element -- local static asset in /public */}
            <img
              src="/images/neon-story.jpg"
              alt={t('Аватар друга')}
              className="h-full w-full rounded-pill object-cover"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
            <div className="flex h-7 flex-1 items-center rounded-pill border border-white/40 bg-white/10 px-3 text-[11px] text-white/60 backdrop-blur-sm">
              {t('Ответить…')}
            </div>
            <span className="flex h-7 w-7 items-center justify-center text-white">
              <Heart className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="absolute -right-2 z-10 h-[300px] w-[200px] -translate-y-2 rotate-12 overflow-hidden rounded-[28px] border-[4px] border-neutral-900 shadow-2xl transition-transform duration-300 hover:rotate-[8deg] sm:right-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static asset in /public */}
          <img
            src="/images/friends-story.jpg"
            alt={t('Фон истории')}
            className="h-full w-full object-cover brightness-75 contrast-125"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#bc1888]/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}
