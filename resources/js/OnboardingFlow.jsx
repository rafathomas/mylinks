import { useEffect, useMemo, useRef, useState } from 'react';

const themeSuggestions = [
    { id: 'midnight-echo', themeValue: 'graphite', name: 'Jesse Jordan', tagline: 'Rockstar, Activist, Writer', cardClass: 'bg-[#050505] text-white', lineClass: 'bg-white/10', socialClass: 'text-white' },
    { id: 'sky-bloom', themeValue: 'graphite', name: 'Mindy Frauke', tagline: 'Community artist, with a taste for everything local', cardClass: 'bg-[linear-gradient(180deg,#b8d7df_0%,#d9caea_64%,#e67c55_100%)] text-[#40333d]', lineClass: 'bg-white/85', socialClass: 'text-[#40333d]' },
    { id: 'retro-grid', themeValue: 'sand', name: 'Lowell Maxwell', tagline: 'Soul beats and mech from Hackney', cardClass: 'bg-[#5f4042] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px] text-[#f5e7ce]', lineClass: 'bg-[#faeecf]', socialClass: 'text-[#f5e7ce]' },
    { id: 'editorial-cream', themeValue: 'sand', name: 'Sergey Amir', tagline: 'Vintage photography for modern brands', cardClass: 'bg-[#f5eddf] text-[#de4a3d]', lineClass: 'border border-[#ef5a50] bg-transparent', socialClass: 'text-[#de4a3d]' },
    { id: 'forest-room', themeValue: 'mylinks', name: 'Roberto Leopoldo', tagline: 'Blending horticulture with the art of design', cardClass: 'bg-[#132f28] text-[#eef7e2]', lineClass: 'bg-[#edf9db]', socialClass: 'text-[#eef7e2]' },
    { id: 'paper-light', themeValue: 'graphite', name: 'Salka Ruslan', tagline: 'Reading my way through Brooklyn', cardClass: 'bg-[#eceef4] text-[#0a0a0a]', lineClass: 'bg-white', socialClass: 'text-[#0a0a0a]' },
    { id: 'grain-shadow', themeValue: 'sand', name: 'Monica Vera', tagline: 'Daily rituals', cardClass: 'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_18%),repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.06)_2px,transparent_2px,transparent_7px),#6f665e] text-[#f3ece5]', lineClass: 'bg-[#a59890]', socialClass: 'text-[#f3ece5]' },
    { id: 'plum-store', themeValue: 'graphite', name: 'Newlove Store', tagline: 'Vintage, always.', cardClass: 'bg-[linear-gradient(180deg,#471331_0%,#764a79_100%)] text-white', lineClass: 'border border-white/60 bg-transparent', socialClass: 'text-white' },
    { id: 'violet-pop', themeValue: 'graphite', name: 'Lexie Candis', tagline: 'Pastel artist from Melbourne', cardClass: 'bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_16%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.15),transparent_14%),radial-gradient(circle_at_25%_75%,rgba(76,29,149,0.38),transparent_18%),radial-gradient(circle_at_75%_65%,rgba(76,29,149,0.3),transparent_18%),#8a5db7] text-white', lineClass: 'bg-[#ead8fb]', socialClass: 'text-white' },
    { id: 'powder-air', themeValue: 'graphite', name: 'Indi Montana', tagline: 'Skincare blogger. Owner of too many plants.', cardClass: 'bg-[#c8d8e3] text-[#31424e]', lineClass: 'bg-[#d8e7ef]', socialClass: 'text-[#31424e]' },
    { id: 'mono-ink', themeValue: 'sand', name: 'Kevin Sikandar', tagline: 'Typography and Video Designer', cardClass: 'bg-[#e8e5d9] text-[#111111]', lineClass: 'border-[3px] border-[#332e33] bg-white', socialClass: 'text-[#111111]' },
    { id: 'sun-halo', themeValue: 'mylinks', name: 'Natazia', tagline: 'Indie pop and indoor plants', cardClass: 'bg-[radial-gradient(circle_at_50%_55%,#e96857_0%,#f0a95b_28%,#7fd0a9_100%)] text-white', lineClass: 'bg-white', socialClass: 'text-white' },
    { id: 'night-drive', themeValue: 'graphite', name: 'Ella Vibe', tagline: 'Hard times, Hard techno', cardClass: 'bg-[#1e1d1d] text-[#f3ede7]', lineClass: 'border border-white/12 bg-transparent', socialClass: 'text-[#f3ede7]' },
    { id: 'rose-cloud', themeValue: 'sand', name: 'Gabrielle Lacey', tagline: 'Can’t stop won’t stop', cardClass: 'bg-[#f3e5e8] text-[#3d3338]', lineClass: 'bg-white shadow-[0_10px_18px_rgba(255,255,255,0.6)]', socialClass: 'text-[#3d3338]' },
];

const platformOptions = [
    { id: 'instagram', name: 'Instagram', placeholder: '@username' },
    { id: 'whatsapp', name: 'WhatsApp', placeholder: '5511999999999' },
    { id: 'tiktok', name: 'TikTok', placeholder: '@username' },
    { id: 'youtube', name: 'YouTube', placeholder: 'youtube.com/@username' },
    { id: 'website', name: 'Website', placeholder: 'https://seusite.com' },
    { id: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/...' },
    { id: 'threads', name: 'Threads', placeholder: '@username' },
    { id: 'facebook', name: 'Facebook', placeholder: 'facebook.com/username' },
    { id: 'x', name: 'X', placeholder: '@username' },
];

function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}

function OnboardingButton({ children, className = '', variant = 'primary', ...props }) {
    const variants = {
        primary: 'bg-[#0f5c3f] text-white shadow-[0_18px_34px_rgba(15,92,63,0.22)] hover:bg-[#0b4b34] hover:translate-y-[-1px]',
        secondary: 'border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50',
        ghost: 'text-stone-500 hover:text-stone-900',
    };

    return (
        <button
            className={cx(
                'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition',
                variants[variant],
                className,
            )}
            type="button"
            {...props}
        >
            {children}
        </button>
    );
}

function ProgressBar({ step, total }) {
    const ratio = `${Math.max(0, Math.min(100, (step / total) * 100))}%`;

    return (
        <div className="mx-auto h-2 w-40 overflow-hidden rounded-full bg-stone-200/90">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#d946ef_0%,#9333ea_100%)] transition-all duration-300" style={{ width: ratio }} />
        </div>
    );
}

function BrandMark() {
    return (
        <div className="inline-flex items-center gap-2">
            <div className="relative h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] text-white shadow-[0_12px_28px_rgba(15,23,42,0.2)]">
                <span className="absolute inset-0 grid place-items-center text-lg font-black">*</span>
            </div>
            <div>
                <p className="text-xl font-black tracking-[-0.06em] text-stone-950">mylinks</p>
                <p className="-mt-1 text-xs uppercase tracking-[0.22em] text-stone-400">onboarding</p>
            </div>
        </div>
    );
}

function PlatformIcon({ id }) {
    if (id === 'instagram') {
        return (
            <svg aria-hidden="true" className="h-[44px] w-[44px]" viewBox="0 0 48 48">
                <defs>
                    <linearGradient id="ig-gradient" x1="0%" x2="100%" y1="100%" y2="0%">
                        <stop offset="0%" stopColor="#FEC053" />
                        <stop offset="35%" stopColor="#F2203E" />
                        <stop offset="70%" stopColor="#B729A8" />
                        <stop offset="100%" stopColor="#5342D6" />
                    </linearGradient>
                </defs>
                <rect width="48" height="48" rx="12" fill="url(#ig-gradient)" />
                <rect x="12" y="12" width="24" height="24" rx="8" fill="none" stroke="#fff" strokeWidth="3.6" />
                <circle cx="24" cy="24" r="5.8" fill="none" stroke="#fff" strokeWidth="3.6" />
                <circle cx="32.4" cy="15.8" r="2.2" fill="#fff" />
            </svg>
        );
    }

    if (id === 'whatsapp') {
        return (
            <svg aria-hidden="true" className="h-[46px] w-[46px]" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#67E35F" />
                <path d="M23.9 12.2c-6.7 0-12.1 5.2-12.1 11.7 0 2.2.6 4.2 1.8 6l-1.3 5.8 6-1.2a12.3 12.3 0 0 0 5.6 1.4c6.6 0 12-5.2 12-11.8 0-6.5-5.4-11.9-12-11.9Zm0 20.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.5.7.7-3.3-.2-.4a9.1 9.1 0 0 1-1.4-4.7c0-5 4.1-9 9.1-9 5 0 9 4.2 9 9.1s-4 9.2-9 9.2Z" fill="#fff" />
                <path d="M29 26.2c-.3-.2-2-1-2.3-1.1-.3-.1-.6-.2-.9.2l-.8 1c-.2.2-.4.3-.8.1-.4-.2-1.5-.6-2.8-1.8a10.5 10.5 0 0 1-1.9-2.3c-.2-.4 0-.6.1-.8l.6-.7c.2-.2.3-.4.4-.7.1-.2 0-.5-.1-.7l-1-2.4c-.3-.7-.6-.6-.9-.6h-.7c-.2 0-.7 0-1 .4-.4.4-1.4 1.3-1.4 3.2s1.5 3.6 1.7 3.9c.2.2 2.9 4.4 7.1 6 .9.4 1.7.6 2.3.8 1 .3 2 .2 2.7.1.8-.1 2.1-.9 2.4-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.7-.5Z" fill="#fff" />
            </svg>
        );
    }

    if (id === 'tiktok') {
        return (
            <svg aria-hidden="true" className="h-[45px] w-[45px]" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#000" />
                <path d="M27.2 13.4c1 2.8 2.8 4.5 5.5 4.7v4.1a9.4 9.4 0 0 1-5.5-1.8v7.7c0 4.8-3 7.8-7.3 7.8-3.8 0-6.6-2.7-6.6-6.2 0-3.8 3-6.6 7-6.6.5 0 1 .1 1.4.2v4.3a3 3 0 0 0-1.3-.3c-1.8 0-3 .9-3 2.3 0 1.4 1 2.4 2.7 2.4 1.9 0 2.8-1.2 2.8-3V13.4h4.3Z" fill="#25F4EE" />
                <path d="M28.4 12c1 2.8 2.8 4.5 5.5 4.7v4.1a9.4 9.4 0 0 1-5.5-1.8v7.7c0 4.8-3 7.8-7.3 7.8-3.8 0-6.6-2.7-6.6-6.2 0-3.8 3-6.6 7-6.6.5 0 1 .1 1.4.2v4.3a3 3 0 0 0-1.3-.3c-1.8 0-3 .9-3 2.3 0 1.4 1 2.4 2.7 2.4 1.9 0 2.8-1.2 2.8-3V12h4.3Z" fill="#FE2C55" opacity=".9" />
                <path d="M27.8 12.7c1 2.8 2.8 4.5 5.5 4.7v4.1a9.4 9.4 0 0 1-5.5-1.8v7.7c0 4.8-3 7.8-7.3 7.8-3.8 0-6.6-2.7-6.6-6.2 0-3.8 3-6.6 7-6.6.5 0 1 .1 1.4.2v4.3a3 3 0 0 0-1.3-.3c-1.8 0-3 .9-3 2.3 0 1.4 1 2.4 2.7 2.4 1.9 0 2.8-1.2 2.8-3V12.7h4.3Z" fill="#fff" />
            </svg>
        );
    }

    if (id === 'youtube') {
        return (
            <svg aria-hidden="true" className="h-[42px] w-[42px]" viewBox="0 0 48 48">
                <rect x="3.5" y="8" width="41" height="32" rx="10" fill="#fff" stroke="#E5E1D8" strokeWidth="2" />
                <rect x="11" y="15" width="26" height="18" rx="5" fill="#EB3138" />
                <path d="M21 19.5l9 4.5-9 4.5v-9Z" fill="#fff" />
            </svg>
        );
    }

    if (id === 'website') {
        return (
            <svg aria-hidden="true" className="h-[43px] w-[43px]" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#000" />
                <circle cx="24" cy="24" r="11" fill="none" stroke="#fff" strokeWidth="3.2" />
                <path d="M13 24h22M24 13c3.6 3.2 5.4 6.8 5.4 11s-1.8 7.8-5.4 11c-3.6-3.2-5.4-6.8-5.4-11s1.8-7.8 5.4-11Z" fill="none" stroke="#fff" strokeWidth="3.2" />
            </svg>
        );
    }

    if (id === 'spotify') {
        return (
            <svg aria-hidden="true" className="h-[43px] w-[43px]" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#000" />
                <circle cx="24" cy="24" r="11" fill="#57D466" />
                <path d="M18 21.6c4.2-1 8.1-.7 11.7 1" fill="none" stroke="#111" strokeLinecap="round" strokeWidth="2.5" />
                <path d="M18.8 25.4c3.4-.8 6.5-.5 9.5.8" fill="none" stroke="#111" strokeLinecap="round" strokeWidth="2.3" />
                <path d="M19.7 29c2.4-.5 4.6-.3 6.6.5" fill="none" stroke="#111" strokeLinecap="round" strokeWidth="2.1" />
            </svg>
        );
    }

    if (id === 'threads') {
        return (
            <svg aria-hidden="true" className="h-[42px] w-[42px]" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#111" />
                <path d="M27.7 21.4c-.3-2.8-2.2-4.4-5.1-4.4-3.2 0-5.4 2-5.4 5h3.2c0-1.3.9-2.2 2.3-2.2 1.5 0 2.4.8 2.4 2.3v1.1h-2.3c-4 0-6.5 1.8-6.5 4.8 0 2.7 2.1 4.6 5.3 4.6 2 0 3.6-.7 4.7-2 .7.9 1.7 1.4 2.9 1.4 2.4 0 4.2-1.8 4.2-4.4 0-3.6-2.7-6-5.7-6.2Zm-2.6 5.2c0 1.9-1.2 3-3 3-1.3 0-2.2-.7-2.2-1.8 0-1.2 1-1.9 2.9-1.9h2.3v.7Z" fill="#fff" />
            </svg>
        );
    }

    if (id === 'facebook') {
        return (
            <svg aria-hidden="true" className="h-[43px] w-[43px]" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#3366F0" />
                <path d="M26.7 39V26.5h4.2l.7-4.9h-4.9v-3.1c0-1.4.4-2.4 2.4-2.4h2.7V11.7c-.5-.1-2-.2-3.7-.2-3.7 0-6.2 2.2-6.2 6.3v3.8h-4.1v4.9h4.1V39h4.8Z" fill="#fff" />
            </svg>
        );
    }

    if (id === 'x') {
        return (
            <svg aria-hidden="true" className="h-[42px] w-[42px]" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#2A2A32" />
                <path d="M14 14h5.3l5.5 7.4 6.2-7.4H34l-7.9 9.4L34 34h-5.3l-5.8-7.7L16.4 34H14l8.1-9.7L14 14Z" fill="#fff" />
            </svg>
        );
    }

    return null;
}

function PlatformBadge({ option, selected }) {
    return (
        <button
            className={cx(
                'group flex aspect-square w-full max-w-[258px] flex-col items-center rounded-[28px] border-[5px] px-6 py-6 text-center transition',
                selected
                    ? 'border-black bg-white shadow-[0_16px_36px_rgba(17,24,39,0.08)]'
                    : 'border-stone-200 bg-white hover:border-stone-300',
            )}
            type="button"
        >
            <div className="flex min-h-[112px] w-full items-end justify-center">
                <div className="grid h-[58px] w-[58px] place-items-center">
                    <PlatformIcon id={option.id} />
                </div>
            </div>
            <div className="flex min-h-[74px] w-full items-start justify-center pt-5">
                <span className="text-center text-[19px] font-medium leading-none tracking-[-0.04em] text-stone-900">{option.name}</span>
            </div>
        </button>
    );
}

function PlatformMiniTile({ id }) {
    return (
        <div className="grid h-[74px] w-[74px] place-items-center rounded-[22px] border border-stone-100 bg-white shadow-[0_14px_28px_rgba(17,24,39,0.08)]">
            <div className="grid h-[48px] w-[48px] place-items-center">
                <PlatformIcon id={id} />
            </div>
        </div>
    );
}

function SelectedPlatformRow({ option, value, onChange }) {
    return (
        <label className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
            <div className="flex items-center justify-center">
                <PlatformMiniTile id={option.id} />
            </div>
            <input
                className="w-full rounded-[26px] border border-stone-200 bg-white px-8 py-5 text-[18px] text-stone-900 outline-none transition focus:border-[#b39cff] focus:ring-4 focus:ring-[#b39cff]/20"
                onChange={onChange}
                placeholder={option.placeholder}
                value={value}
            />
        </label>
    );
}

function AdditionalLinkRow({ value, onChange }) {
    return (
        <label className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
            <div className="flex items-center justify-center">
                <div className="grid h-[74px] w-[74px] place-items-center rounded-[22px] bg-white text-[34px] font-semibold text-stone-900 shadow-[0_14px_28px_rgba(17,24,39,0.08)] ring-1 ring-stone-100">
                    ↗
                </div>
            </div>
            <input
                className="w-full rounded-[26px] border border-stone-200 bg-white px-8 py-5 text-[18px] text-stone-900 outline-none transition focus:border-[#b39cff] focus:ring-4 focus:ring-[#b39cff]/20"
                onChange={onChange}
                placeholder="https://seulink.com"
                value={value}
            />
        </label>
    );
}

function ThemePreview({ theme, selected, onClick }) {
    return (
        <button
            className={cx(
                'group mx-auto overflow-hidden rounded-[30px] border p-3 text-left transition',
                selected
                    ? 'border-black bg-white shadow-[0_18px_36px_rgba(17,24,39,0.08)]'
                    : 'border-transparent bg-transparent hover:border-stone-200',
            )}
            onClick={onClick}
            type="button"
        >
            <div className={cx('relative h-[365px] w-[250px] overflow-hidden rounded-[30px] px-4 py-6', theme.cardClass)}>
                <div className="mx-auto h-16 w-16 rounded-full bg-white/30 shadow-[0_10px_20px_rgba(0,0,0,0.08)]" />
                <div className="mt-5 text-center">
                    <p className="text-[16px] font-bold tracking-[-0.04em]">{theme.name}</p>
                    <p className="mt-1 text-[11px] opacity-85">{theme.tagline}</p>
                </div>
                <div className={cx('mt-4 flex justify-center gap-4 text-sm font-semibold', theme.socialClass)}>
                    <span>♪</span>
                    <span>◉</span>
                    <span>◎</span>
                </div>
                <div className="mt-7 space-y-3">
                    <div className={cx('h-10 rounded-[18px]', theme.lineClass)} />
                    <div className={cx('h-10 rounded-[18px]', theme.lineClass)} />
                    <div className={cx('h-10 rounded-[18px]', theme.lineClass)} />
                </div>
            </div>
        </button>
    );
}

function requestJson(url, options = {}) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return fetch(url, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
            ...(options.headers ?? {}),
        },
        credentials: 'same-origin',
        ...options,
    }).then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(payload.message ?? 'Não foi possível concluir a ação.');
            error.validation = payload.errors ?? null;
            throw error;
        }

        return payload;
    });
}

function formatValidationMessage(error) {
    if (error?.validation && typeof error.validation === 'object') {
        const messages = Object.values(error.validation).flat().filter(Boolean);

        if (messages.length) {
            return messages.join(' ');
        }
    }

    return error?.message ?? 'Não foi possível concluir a ação.';
}

function buildProfilePrefix(slug) {
    if (typeof window === 'undefined') {
        return `mylinks.bio/${slug}`;
    }

    return `${window.location.host}/${slug}`;
}

function findThemeSuggestionId(themeValue) {
    return themeSuggestions.find((theme) => theme.themeValue === themeValue)?.id ?? themeSuggestions[0]?.id ?? null;
}

function inferOnboardingState(initialData) {
    const links = Array.isArray(initialData.links) ? initialData.links : [];
    const platformLinkMap = {};
    const selected = [];
    const extraLinks = [];

    links.forEach((link) => {
        if (platformOptions.some((option) => option.id === link.platform) && selected.length < 5) {
            selected.push(link.platform);
            platformLinkMap[link.platform] = link.url ?? '';
            return;
        }

        if (extraLinks.length < 3) {
            extraLinks.push(link.url ?? '');
        }
    });

    while (extraLinks.length < 3) {
        extraLinks.push('');
    }

    return {
        selectedPlatforms: selected,
        platformLinks: platformLinkMap,
        additionalLinks: extraLinks,
    };
}

function buildLivePreviewLinks(selectedPlatformOptions, platformLinks, additionalLinks) {
    const platformPreviewLinks = selectedPlatformOptions
        .map((option) => ({
            id: option.id,
            title: option.name,
            value: (platformLinks[option.id] ?? '').trim(),
        }))
        .filter((item) => item.value);

    const extraPreviewLinks = additionalLinks
        .map((value, index) => ({
            id: `extra-${index}`,
            title: `Link adicional ${index + 1}`,
            value: value.trim(),
        }))
        .filter((item) => item.value);

    return [...platformPreviewLinks, ...extraPreviewLinks].slice(0, 5);
}

function OnboardingLivePreview({ slug, theme, links }) {
    const previewName = slug ? `@${slug}` : '@mylinks';

    return (
        <aside className="lg:sticky lg:top-8">
            <div className="rounded-[34px] border border-stone-200 bg-white/88 p-5 shadow-[0_30px_80px_rgba(17,24,39,0.08)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Prévia ao vivo</p>
                <p className="mt-2 text-sm text-stone-500">Tudo que você escolher aqui já vira configuração da sua página.</p>

                <div className="relative mx-auto mt-5 max-w-[320px] overflow-hidden rounded-[34px] shadow-[0_26px_70px_rgba(15,34,26,0.24)]">
                    <div className={cx('absolute inset-0', theme.cardClass)} />
                    <div className={cx('relative flex min-h-[620px] flex-col px-6 py-8', theme.socialClass)}>
                        <div className="mt-8 flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-white/30 shadow-[0_10px_20px_rgba(0,0,0,0.08)]" />
                            <p className="mt-6 text-[2rem] font-black tracking-[-0.055em]">{previewName}</p>
                            <p className="mt-2 text-sm opacity-80">{buildProfilePrefix(slug || 'seu.nome')}</p>
                        </div>

                        <div className={cx('mt-7 flex justify-center gap-4 text-sm font-semibold', theme.socialClass)}>
                            <span>♪</span>
                            <span>◉</span>
                            <span>◎</span>
                        </div>

                        <div className="mt-8 flex-1 space-y-3">
                            {links.length > 0 ? (
                                links.map((link) => (
                                    <div className={cx('flex items-center justify-between rounded-[18px] px-4 py-3', theme.lineClass)} key={link.id}>
                                        <span className="truncate pr-3 text-sm font-semibold">{link.title}</span>
                                        <span className="shrink-0 text-xs opacity-75">↗</span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className={cx('h-11 rounded-[18px]', theme.lineClass)} />
                                    <div className={cx('h-11 rounded-[18px]', theme.lineClass)} />
                                    <div className={cx('h-11 rounded-[18px]', theme.lineClass)} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default function OnboardingFlow({ initialData = {}, onFinish, onSync }) {
    const steps = ['slug', 'theme', 'platforms', 'links', 'success'];
    const emailPrefix = (initialData.user?.email ?? '').split('@')[0] || initialData.page?.slug || 'meu.perfil';
    const inferredState = useMemo(() => inferOnboardingState(initialData), [initialData]);
    const [step, setStep] = useState(0);
    const [slug, setSlug] = useState(initialData.page?.slug ?? emailPrefix);
    const [selectedTheme, setSelectedTheme] = useState(findThemeSuggestionId(initialData.page?.theme ?? 'mylinks'));
    const [selectedPlatforms, setSelectedPlatforms] = useState(inferredState.selectedPlatforms);
    const [platformLinks, setPlatformLinks] = useState(inferredState.platformLinks);
    const [additionalLinks, setAdditionalLinks] = useState(inferredState.additionalLinks);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [slugSuggestion, setSlugSuggestion] = useState('');
    const [completedPayload, setCompletedPayload] = useState(null);
    const lastSyncedRef = useRef('');
    const syncRequestIdRef = useRef(0);
    const isCompletingRef = useRef(false);
    const isMountedRef = useRef(true);

    const confettiPieces = useMemo(
        () =>
            Array.from({ length: 42 }, (_, index) => ({
                id: index,
                left: `${(index * 17) % 100}%`,
                delay: `${(index % 7) * 0.18}s`,
                duration: `${4.8 + (index % 5) * 0.45}s`,
                color: ['#f59e0b', '#c084fc', '#fb7185', '#e5e7eb'][index % 4],
                size: index % 3 === 0 ? 10 : 14,
            })),
        [],
    );

    const selectedPlatformOptions = useMemo(
        () => platformOptions.filter((option) => selectedPlatforms.includes(option.id)),
        [selectedPlatforms],
    );
    const resolvedThemeValue = useMemo(
        () => themeSuggestions.find((theme) => theme.id === selectedTheme)?.themeValue ?? initialData.page?.theme ?? 'mylinks',
        [selectedTheme],
    );
    const selectedThemePreview = useMemo(
        () => themeSuggestions.find((theme) => theme.id === selectedTheme) ?? themeSuggestions.find((theme) => theme.themeValue === resolvedThemeValue) ?? themeSuggestions[0],
        [resolvedThemeValue, selectedTheme],
    );
    const livePreviewLinks = useMemo(
        () => buildLivePreviewLinks(selectedPlatformOptions, platformLinks, additionalLinks),
        [additionalLinks, platformLinks, selectedPlatformOptions],
    );

    const visibleAdditionalLinks = useMemo(() => {
        if (selectedPlatforms.length === 0) {
            return 3;
        }

        return 2;
    }, [selectedPlatforms.length]);

    const normalizedSlugPreview = slug
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/[-_.]{2,}/g, '-')
        .replace(/^[-_.]+|[-_.]+$/g, '');

    useEffect(() => () => {
        isMountedRef.current = false;
    }, []);

    useEffect(() => {
        if (step === 0 || step >= 4 || !initialData.routes?.syncOnboarding || !normalizedSlugPreview) {
            return undefined;
        }

        const payload = JSON.stringify({
            slug: normalizedSlugPreview,
            theme: resolvedThemeValue,
            selected_theme_id: selectedTheme,
            selected_platforms: selectedPlatforms,
            platform_links: platformLinks,
            additional_links: additionalLinks,
        });

        if (lastSyncedRef.current === payload) {
            return undefined;
        }

        const timeout = setTimeout(() => {
            const requestId = syncRequestIdRef.current + 1;
            syncRequestIdRef.current = requestId;

            void requestJson(initialData.routes.syncOnboarding, {
                method: 'PUT',
                body: payload,
            })
                .then((responsePayload) => {
                    if (!isMountedRef.current || isCompletingRef.current || requestId !== syncRequestIdRef.current) {
                        return;
                    }

                    lastSyncedRef.current = payload;
                    onSync?.(responsePayload);
                })
                .catch(() => {});
        }, 250);

        return () => clearTimeout(timeout);
    }, [additionalLinks, initialData.routes, normalizedSlugPreview, onSync, platformLinks, resolvedThemeValue, selectedPlatforms, step]);

    const continueFromSlug = async () => {
        setLoading(true);
        setErrorMessage('');
        setSlugSuggestion('');

        try {
            const query = new URLSearchParams({ slug }).toString();
            const payload = await requestJson(`${initialData.routes.onboardingSlugAvailability}?${query}`);

            if (!payload.available) {
                setSlugSuggestion(payload.suggestion);
                setErrorMessage('Esse link já está em uso. Você pode aplicar a sugestão abaixo ou editar manualmente.');
                return;
            }

            setSlug(payload.slug);
            setStep(1);
        } catch (error) {
            setErrorMessage(formatValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const togglePlatform = (platformId) => {
        setErrorMessage('');
        setSelectedPlatforms((current) => {
            if (current.includes(platformId)) {
                return current.filter((item) => item !== platformId);
            }

            if (current.length >= 5) {
                setErrorMessage('Você pode selecionar até 5 plataformas para começar.');
                return current;
            }

            return [...current, platformId];
        });
    };

    const submitOnboarding = async () => {
        setLoading(true);
        setErrorMessage('');
        isCompletingRef.current = true;

        try {
            const payload = await requestJson(initialData.routes.completeOnboarding, {
                method: 'POST',
                body: JSON.stringify({
                    slug,
                    theme: resolvedThemeValue,
                    selected_theme_id: selectedTheme,
                    selected_platforms: selectedPlatforms,
                    platform_links: platformLinks,
                    additional_links: additionalLinks,
                }),
            });

            setCompletedPayload(payload);
            setStep(4);
        } catch (error) {
            isCompletingRef.current = false;
            setErrorMessage(formatValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#fcfaf5] text-stone-900">
            <style>{`
                @keyframes confettiFall {
                    0% { transform: translate3d(0,-10vh,0) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translate3d(12px,110vh,0) rotate(540deg); opacity: 0; }
                }
            `}</style>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,168,212,0.12),transparent_30%),linear-gradient(180deg,#ffffff_0%,#fcfaf5_48%,#f7f0ff_100%)]" />

            {step === 0 ? (
                <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
                    <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
                        <div className="mx-auto w-full max-w-[680px]">
                            <BrandMark />
                            <div className="mt-16">
                                <p className="text-sm font-bold uppercase tracking-[0.28em] text-violet-500">Boas-vindas</p>
                                <h1 className="mt-4 text-5xl font-black tracking-[-0.07em] text-stone-950 sm:text-6xl">Seu perfil já nasceu logado.</h1>
                                <p className="mt-6 max-w-2xl text-xl leading-9 text-stone-500">
                                    Escolha o link público que mais combina com você. Começamos com o início do seu e-mail, mas você pode personalizar.
                                </p>
                            </div>

                            <div className="mt-12 rounded-[32px] border border-stone-200 bg-white/90 p-6 shadow-[0_30px_80px_rgba(17,24,39,0.08)] backdrop-blur">
                                <label className="block">
                                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">Seu link</span>
                                    <div className="mt-4 flex items-center rounded-[24px] border border-stone-200 bg-stone-50 px-5 py-4 shadow-inner shadow-stone-100">
                                        <span className="shrink-0 text-lg font-medium text-stone-400">{typeof window === 'undefined' ? 'mylinks.bio/' : `${window.location.host}/`}</span>
                                        <input
                                            className="w-full bg-transparent text-2xl font-semibold tracking-[-0.04em] text-stone-950 outline-none placeholder:text-stone-300"
                                            onChange={(event) => setSlug(event.target.value)}
                                            placeholder="seu.nome"
                                            value={slug}
                                        />
                                    </div>
                                </label>

                                {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-600">{errorMessage}</p> : null}
                                {slugSuggestion ? (
                                    <button
                                        className="mt-3 inline-flex rounded-full bg-[#eef3ec] px-4 py-2 text-sm font-semibold text-[#0f5c3f] transition hover:bg-[#e4ede1]"
                                        onClick={() => {
                                            setSlug(slugSuggestion);
                                            setErrorMessage('');
                                        }}
                                        type="button"
                                    >
                                        Usar sugestão: {slugSuggestion}
                                    </button>
                                ) : null}

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <OnboardingButton className="min-w-[220px]" disabled={loading || !normalizedSlugPreview} onClick={continueFromSlug}>
                                        {loading ? 'Verificando...' : 'Continuar'}
                                    </OnboardingButton>
                                    <div className="inline-flex items-center rounded-full bg-stone-100 px-4 py-3 text-sm text-stone-500">
                                        Prévia: {buildProfilePrefix(normalizedSlugPreview || 'seu.nome')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="relative hidden overflow-hidden lg:flex lg:min-h-screen lg:items-center lg:justify-center bg-[#d4ab49]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(17,24,39,0.16),transparent_30%)]" />
                        <div className="relative h-[620px] w-[520px]">
                            <div className="absolute right-0 top-3 h-[520px] w-[310px] rounded-[46px] bg-[linear-gradient(180deg,#8e5a2c_0%,#bc8452_52%,#ead7be_100%)] shadow-[0_40px_90px_rgba(76,29,10,0.26)]" />
                            <div className="absolute left-0 top-28 w-[310px] rounded-[40px] bg-[linear-gradient(180deg,#c026d3_0%,#a21caf_100%)] p-8 shadow-[0_30px_80px_rgba(162,28,175,0.26)]">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-white/35" />
                                    <div className="space-y-3">
                                        <div className="h-3 w-24 rounded-full bg-white/30" />
                                        <div className="h-3 w-16 rounded-full bg-white/20" />
                                    </div>
                                </div>
                                <div className="mt-12 rounded-full bg-white px-6 py-5 text-2xl font-black tracking-[-0.05em] text-stone-900 shadow-xl">
                                    /{normalizedSlugPreview || 'seu.nome'}
                                </div>
                            </div>
                            <div className="absolute bottom-10 right-[-8px] space-y-4">
                                <div className="h-20 w-[280px] rounded-full bg-white/70 shadow-lg" />
                                <div className="h-20 w-[280px] rounded-full bg-white/70 shadow-lg" />
                                <div className="h-20 w-[280px] rounded-full bg-white/70 shadow-lg" />
                            </div>
                        </div>
                    </aside>
                </div>
            ) : null}

            {step > 0 && step < 4 ? (
                <section className="relative mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-10">
                    <div className="flex items-center justify-between gap-4">
                        <OnboardingButton onClick={() => setStep((current) => Math.max(0, current - 1))} variant="ghost">
                            Voltar
                        </OnboardingButton>
                        <ProgressBar step={step} total={steps.length - 1} />
                        <OnboardingButton
                            onClick={() => {
                                setErrorMessage('');

                                if (step === 1) {
                                    setStep(2);
                                    return;
                                }

                                if (step === 2) {
                                    setStep(3);
                                    return;
                                }

                                if (step === 3) {
                                    void submitOnboarding();
                                }
                            }}
                            variant="ghost"
                        >
                            Pular
                        </OnboardingButton>
                    </div>

                    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                        <div>
                    {step === 1 ? (
                        <div className="mx-auto max-w-[1560px]">
                            <div className="text-center">
                                <h2 className="text-5xl font-black tracking-[-0.06em] text-stone-950">Selecione um tema</h2>
                                <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-stone-500">
                                    Escolha o estilo que mais combina com a sua energia. Se quiser decidir depois, pode pular agora.
                                </p>
                            </div>

                            <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
                                {themeSuggestions.map((theme) => (
                                    <ThemePreview key={theme.id} onClick={() => setSelectedTheme(theme.id)} selected={selectedTheme === theme.id} theme={theme} />
                                ))}
                            </div>

                            <div className="mt-12 flex justify-center">
                                <OnboardingButton className="min-w-[240px]" onClick={() => setStep(2)}>
                                    Continuar
                                </OnboardingButton>
                            </div>
                        </div>
                    ) : null}

                    {step === 2 ? (
                        <div className="mx-auto max-w-[1120px]">
                            <div className="text-center">
                                <h2 className="text-5xl font-black tracking-[-0.06em] text-stone-950">Em quais plataformas você está?</h2>
                                <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-stone-500">
                                    Escolha até cinco para começar. Na próxima etapa elas já aparecem prontas para você preencher.
                                </p>
                            </div>

                            <div className="mx-auto mt-14 grid max-w-[1380px] justify-center gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                                {platformOptions.map((option) => (
                                    <div className="flex justify-center" key={option.id} onClick={() => togglePlatform(option.id)}>
                                        <PlatformBadge option={option} selected={selectedPlatforms.includes(option.id)} />
                                    </div>
                                ))}
                            </div>

                            {errorMessage ? <p className="mt-6 text-center text-sm font-medium text-rose-600">{errorMessage}</p> : null}

                            <div className="mt-12 flex justify-center">
                                <OnboardingButton className="min-w-[280px]" onClick={() => setStep(3)}>
                                    Continuar
                                </OnboardingButton>
                            </div>
                        </div>
                    ) : null}

                    {step === 3 ? (
                        <div className="mx-auto max-w-[860px]">
                            <div className="text-center">
                                <h2 className="text-5xl font-black tracking-[-0.06em] text-stone-950">Adicione seus links</h2>
                                <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-stone-500">
                                    {selectedPlatformOptions.length > 0
                                        ? 'Suas redes escolhidas já estão aqui. Preencha com os links ou nomes de usuário e complemente com links extras se quiser.'
                                        : 'Você pulou a seleção de redes, então pode começar com links manuais agora e ajustar tudo depois no painel.'}
                                </p>
                            </div>

                            <div className="mt-12 space-y-5 rounded-[36px] border border-stone-200 bg-white/92 p-6 shadow-[0_30px_90px_rgba(17,24,39,0.08)] sm:p-8">
                                {selectedPlatformOptions.length > 0 ? (
                                    <>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-[-0.05em] text-stone-950">Suas seleções</h3>
                                            <div className="mt-6 space-y-4">
                                                {selectedPlatformOptions.map((option) => (
                                                    <SelectedPlatformRow
                                                        key={option.id}
                                                        onChange={(event) => setPlatformLinks((current) => ({ ...current, [option.id]: event.target.value }))}
                                                        option={option}
                                                        value={platformLinks[option.id] ?? ''}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : null}

                                <div className="pt-4">
                                    <h3 className="text-2xl font-black tracking-[-0.05em] text-stone-950">Links adicionais</h3>
                                    <div className="mt-6 space-y-4">
                                        {additionalLinks.slice(0, visibleAdditionalLinks).map((value, index) => (
                                            <AdditionalLinkRow
                                                key={index}
                                                onChange={(event) =>
                                                    setAdditionalLinks((current) =>
                                                        current.map((item, currentIndex) => (currentIndex === index ? event.target.value : item)),
                                                    )
                                                }
                                                value={value}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {errorMessage ? <p className="text-sm font-medium text-rose-600">{errorMessage}</p> : null}

                                <div className="pt-6">
                                    <OnboardingButton className="w-full py-4 text-lg" disabled={loading} onClick={submitOnboarding}>
                                        {loading ? 'Finalizando...' : 'Continuar'}
                                    </OnboardingButton>
                                </div>
                            </div>
                        </div>
                    ) : null}
                        </div>

                        <OnboardingLivePreview links={livePreviewLinks} slug={normalizedSlugPreview} theme={selectedThemePreview} />
                    </div>
                </section>
            ) : null}

            {step === 4 && completedPayload ? (
                <section className="relative flex min-h-screen items-center justify-center px-5 py-10">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {confettiPieces.map((piece) => (
                            <span
                                className="absolute top-[-12vh] rounded-sm opacity-80"
                                key={piece.id}
                                style={{
                                    left: piece.left,
                                    width: `${piece.size}px`,
                                    height: `${piece.size * 1.8}px`,
                                    backgroundColor: piece.color,
                                    animation: `confettiFall ${piece.duration} linear ${piece.delay} infinite`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative mx-auto w-full max-w-[920px] text-center">
                        <ProgressBar step={step} total={steps.length - 1} />
                        <p className="mt-12 text-sm font-bold uppercase tracking-[0.3em] text-violet-500">Sucesso</p>
                        <h2 className="mt-4 text-6xl font-black tracking-[-0.08em] text-stone-950">Muito bom!</h2>
                        <p className="mx-auto mt-6 max-w-3xl text-2xl leading-10 text-stone-500">
                            Seu perfil já começou com personalidade. Agora você pode entrar no painel logado e continuar refinando cada detalhe.
                        </p>

                        <div className="mx-auto mt-12 max-w-[540px] rounded-[44px] border border-white/70 bg-white/80 p-7 shadow-[0_35px_90px_rgba(17,24,39,0.12)] backdrop-blur">
                            <div className="rounded-[34px] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-8 shadow-inner shadow-stone-200">
                                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-stone-200 text-5xl text-stone-500">◌</div>
                                <p className="mt-8 text-4xl font-black tracking-[-0.06em] text-stone-950">@{completedPayload.page.slug}</p>
                                <p className="mt-3 text-base text-stone-500">{buildProfilePrefix(completedPayload.page.slug)}</p>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center">
                            <OnboardingButton className="min-w-[320px] py-4 text-lg" onClick={() => onFinish(completedPayload)}>
                                Continuar criando no painel
                            </OnboardingButton>
                        </div>
                    </div>
                </section>
            ) : null}
        </main>
    );
}
