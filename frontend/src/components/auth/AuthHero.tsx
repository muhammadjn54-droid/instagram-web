import React from 'react';

export default function AuthHero() {
  return (
    <div className="flex flex-col justify-between h-full max-w-[540px] py-4">
      {/* Instagram Gradient Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-12 h-12 rounded-2xl p-[2.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] flex items-center justify-center border-2 border-white/90">
            {/* Camera lens circle */}
            <div className="w-5 h-5 rounded-full border-2 border-white/90 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
            </div>
            {/* Flash dot */}
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white/90" />
          </div>
        </div>
      </div>

      {/* Main Headline */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-neutral-900 leading-[1.25] tracking-tight">
          Посмотрите, какими моментами из жизни поделились ваши{' '}
          <span className="text-[#FF3040]">близкие</span>{' '}
          <span className="text-[#D300C5]">друзья</span>.
        </h1>
      </div>

      {/* Visual Story Collage */}
      <div className="relative w-full h-[400px] flex items-center justify-center select-none">
        {/* Ambient background soft glow */}
        <div className="absolute w-72 h-72 bg-gradient-to-tr from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 rounded-full blur-3xl -z-10" />

        {/* Left Tilted Story Card */}
        <div className="absolute -left-2 sm:left-4 z-10 w-[200px] h-[300px] rounded-[28px] overflow-hidden border-[4px] border-neutral-900 shadow-2xl -rotate-12 transform -translate-y-2 hover:rotate-[-8deg] transition-all duration-300">
          <img
            src="/images/neon-story.jpg"
            alt="Story preview"
            className="w-full h-full object-cover"
          />
          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
          {/* Story top indicator */}
          <div className="absolute top-3 left-3 right-3 h-1 bg-white/40 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-white" />
          </div>
        </div>

        {/* Floating 3D Heart Sticker on Left */}
        <div className="absolute left-6 bottom-12 z-30 transform -rotate-12 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF3366] to-[#FF0055] shadow-lg flex items-center justify-center border-2 border-white text-white text-xl">
            ❤️
          </div>
        </div>

        {/* Center Main Phone / Story Card */}
        <div className="relative z-20 w-[240px] h-[360px] rounded-[34px] overflow-hidden border-[5px] border-neutral-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] bg-neutral-900">
          <img
            src="/images/friends-story.jpg"
            alt="Close friends story"
            className="w-full h-full object-cover"
          />

          {/* Story Header */}
          <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/70 to-transparent">
            {/* Progress Bars */}
            <div className="flex gap-1 mb-2">
              <div className="flex-1 h-0.5 bg-white rounded-full" />
              <div className="flex-1 h-0.5 bg-white/40 rounded-full" />
            </div>
            {/* User row */}
            <div className="flex items-center justify-between text-white text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
                  <img src="/images/friends-story.jpg" alt="chloe" className="w-full h-full object-cover" />
                </div>
                <span>chloe</span>
                <span className="text-white/70 font-normal">2h</span>
              </div>
              <span className="text-white/80">•••</span>
            </div>
          </div>

          {/* Floating Emoji Pill on Top of Story */}
          <div className="absolute top-16 left-3 bg-purple-900/80 backdrop-blur-md border border-white/30 text-white text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <span>👀</span>
            <span>🥳</span>
          </div>

          {/* Green Close Friends Star Badge */}
          <div className="absolute top-28 right-3 bg-[#00C73C] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-white/60">
            ★
          </div>

          {/* Mini Avatar in bottom corner with green ring */}
          <div className="absolute bottom-16 right-3 w-8 h-8 rounded-full p-[1.5px] bg-[#00C73C] shadow-md">
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-800">
              <img src="/images/neon-story.jpg" alt="friend" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Story Bottom Reply Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-2">
            <div className="flex-1 h-7 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 flex items-center text-white/60 text-[11px]">
              Ответить...
            </div>
            <div className="w-7 h-7 flex items-center justify-center text-white text-sm">
              ♡
            </div>
          </div>
        </div>

        {/* Right Tilted Story Card */}
        <div className="absolute -right-2 sm:right-4 z-10 w-[200px] h-[300px] rounded-[28px] overflow-hidden border-[4px] border-neutral-900 shadow-2xl rotate-12 transform -translate-y-2 hover:rotate-[8deg] transition-all duration-300">
          <img
            src="/images/friends-story.jpg"
            alt="Story background"
            className="w-full h-full object-cover brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
