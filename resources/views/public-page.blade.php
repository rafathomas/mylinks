@extends('layouts.guest')

@section('title', $page->name.' | MyLinks')
@section('description', $page->bio ?? $page->headline ?? 'Página pública do MyLinks')

@section('content')
    @php
        $selectedThemePresets = [
            'midnight-echo' => [
                'background_style' => 'background: #050505;',
                'text_class' => 'text-white',
                'muted_text_class' => 'text-white/85',
            ],
            'sky-bloom' => [
                'background_style' => 'background: linear-gradient(180deg,#b8d7df 0%,#d9caea 64%,#e67c55 100%);',
                'text_class' => 'text-[#40333d]',
                'muted_text_class' => 'text-[#40333d]/85',
            ],
            'retro-grid' => [
                'background_style' => 'background-color: #5f4042; background-image: linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px); background-size: 22px 22px;',
                'text_class' => 'text-[#f5e7ce]',
                'muted_text_class' => 'text-[#f5e7ce]/85',
            ],
            'editorial-cream' => [
                'background_style' => 'background: #f5eddf;',
                'text_class' => 'text-[#de4a3d]',
                'muted_text_class' => 'text-[#de4a3d]/85',
            ],
            'forest-room' => [
                'background_style' => 'background: #132f28;',
                'text_class' => 'text-[#eef7e2]',
                'muted_text_class' => 'text-[#eef7e2]/85',
            ],
            'paper-light' => [
                'background_style' => 'background: #eceef4;',
                'text_class' => 'text-[#0a0a0a]',
                'muted_text_class' => 'text-[#0a0a0a]/85',
            ],
            'grain-shadow' => [
                'background_style' => 'background-color: #6f665e; background-image: radial-gradient(circle at 20% 20%,rgba(255,255,255,0.08),transparent 18%),repeating-linear-gradient(90deg,rgba(255,255,255,0.06) 0,rgba(255,255,255,0.06) 2px,transparent 2px,transparent 7px);',
                'text_class' => 'text-[#f3ece5]',
                'muted_text_class' => 'text-[#f3ece5]/85',
            ],
            'plum-store' => [
                'background_style' => 'background: linear-gradient(180deg,#471331 0%,#764a79 100%);',
                'text_class' => 'text-white',
                'muted_text_class' => 'text-white/85',
            ],
            'violet-pop' => [
                'background_style' => 'background-color: #8a5db7; background-image: radial-gradient(circle at 20% 15%,rgba(255,255,255,0.16),transparent 16%),radial-gradient(circle at 80% 10%,rgba(255,255,255,0.15),transparent 14%),radial-gradient(circle at 25% 75%,rgba(76,29,149,0.38),transparent 18%),radial-gradient(circle at 75% 65%,rgba(76,29,149,0.3),transparent 18%);',
                'text_class' => 'text-white',
                'muted_text_class' => 'text-white/85',
            ],
            'powder-air' => [
                'background_style' => 'background: #c8d8e3;',
                'text_class' => 'text-[#31424e]',
                'muted_text_class' => 'text-[#31424e]/85',
            ],
            'mono-ink' => [
                'background_style' => 'background: #e8e5d9;',
                'text_class' => 'text-[#111111]',
                'muted_text_class' => 'text-[#111111]/85',
            ],
            'sun-halo' => [
                'background_style' => 'background: radial-gradient(circle at 50% 55%,#e96857 0%,#f0a95b 28%,#7fd0a9 100%);',
                'text_class' => 'text-white',
                'muted_text_class' => 'text-white/85',
            ],
            'night-drive' => [
                'background_style' => 'background: #1e1d1d;',
                'text_class' => 'text-[#f3ede7]',
                'muted_text_class' => 'text-[#f3ede7]/85',
            ],
            'rose-cloud' => [
                'background_style' => 'background: #f3e5e8;',
                'text_class' => 'text-[#3d3338]',
                'muted_text_class' => 'text-[#3d3338]/85',
            ],
        ];

        $themeFallbacks = [
            'mylinks' => 'linear-gradient(180deg, rgba(8, 28, 20, 0.3), rgba(8, 28, 20, 0.5)), url("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80")',
            'graphite' => 'linear-gradient(180deg, rgba(248, 248, 245, 0.98), rgba(231, 232, 227, 0.98))',
            'sand' => 'linear-gradient(180deg, rgba(58, 41, 19, 0.22), rgba(58, 41, 19, 0.42)), url("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80")',
        ];

        $selectedThemePreset = $page->selected_theme_id ? ($selectedThemePresets[$page->selected_theme_id] ?? null) : null;
        $usesPresetSurface = $selectedThemePreset !== null && ! $page->background_image_path;

        $pageBackgroundStyle = $page->background_type === 'color'
            ? 'background-color: '.($page->background_value ?: '#456B5B').';'
            : ($page->background_image_path
                ? 'background-image: linear-gradient(180deg, rgba(8, 28, 20, 0.3), rgba(8, 28, 20, 0.5)), url("'.route('pages.background.show', $page).'"); background-size: cover; background-position: center;'
                : 'background-image: '.($themeFallbacks[$page->theme] ?? $themeFallbacks['mylinks']).'; background-size: cover; background-position: center;');

        $surfaceStyle = $usesPresetSurface
            ? $selectedThemePreset['background_style']
            : $pageBackgroundStyle;

        $isDarkPreview = false;

        if ($page->background_type === 'color') {
            $normalizedBackground = ltrim((string) ($page->background_value ?: '#456B5B'), '#');

            if (strlen($normalizedBackground) === 6) {
                $red = hexdec(substr($normalizedBackground, 0, 2));
                $green = hexdec(substr($normalizedBackground, 2, 2));
                $blue = hexdec(substr($normalizedBackground, 4, 2));
                $luminance = (0.2126 * $red + 0.7152 * $green + 0.0722 * $blue) / 255;
                $isDarkPreview = $luminance < 0.58;
            }
        } else {
            $isDarkPreview = $page->theme !== 'graphite';
        }

        $previewTextClass = $selectedThemePreset['text_class'] ?? ($isDarkPreview ? 'text-white' : 'text-stone-950');
        $previewMutedTextClass = $selectedThemePreset['muted_text_class'] ?? ($isDarkPreview ? 'text-white/85' : 'text-stone-900/85');

        $buttonColor = preg_match('/^#[0-9A-Fa-f]{6}$/', (string) $page->button_color) ? strtoupper((string) $page->button_color) : '#FFFFFF';
        $buttonTextColor = preg_match('/^#[0-9A-Fa-f]{6}$/', (string) $page->button_text_color) ? strtoupper((string) $page->button_text_color) : '#111827';
        $buttonRadius = match ($page->button_radius) {
            'square' => '14px',
            'soft' => '20px',
            'pill' => '999px',
            default => '28px',
        };

        $hexToRgba = static function (string $hex, float $alpha): string {
            $normalized = ltrim($hex, '#');

            if (strlen($normalized) !== 6) {
                $normalized = 'FFFFFF';
            }

            $red = hexdec(substr($normalized, 0, 2));
            $green = hexdec(substr($normalized, 2, 2));
            $blue = hexdec(substr($normalized, 4, 2));

            return sprintf('rgba(%d, %d, %d, %.2f)', $red, $green, $blue, $alpha);
        };

        $buttonStyle = match ($page->button_style) {
            'glass' => sprintf(
                'border-radius: %s; background-color: %s; border: 1px solid %s; color: %s; box-shadow: 0 14px 30px %s; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);',
                $buttonRadius,
                $hexToRgba($buttonColor, 0.22),
                $hexToRgba($buttonColor, 0.58),
                $buttonTextColor,
                $hexToRgba($buttonTextColor, 0.12),
            ),
            'outline' => sprintf(
                'border-radius: %s; background-color: transparent; border: 2px solid %s; color: %s; box-shadow: none;',
                $buttonRadius,
                $buttonColor,
                $buttonTextColor,
            ),
            default => sprintf(
                'border-radius: %s; background-color: %s; border: 1px solid %s; color: %s; box-shadow: 0 14px 30px %s;',
                $buttonRadius,
                $buttonColor,
                $hexToRgba($buttonColor, 0.28),
                $buttonTextColor,
                $hexToRgba($buttonTextColor, 0.12),
            ),
        };

        $networkLabels = [
            'instagram' => 'Instagram',
            'whatsapp' => 'WhatsApp',
            'tiktok' => 'TikTok',
            'youtube' => 'YouTube',
            'website' => 'Website',
            'spotify' => 'Spotify',
            'threads' => 'Threads',
            'facebook' => 'Facebook',
            'x' => 'X',
            'pinterest' => 'Pinterest',
            'email' => 'E-mail',
        ];

        $iconSvg = static function (string $key): string {
            return match ($key) {
                'IG', 'instagram' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><defs><linearGradient id="public-ig" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#FEC053"/><stop offset="35%" stop-color="#F2203E"/><stop offset="70%" stop-color="#B729A8"/><stop offset="100%" stop-color="#5342D6"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#public-ig)"/><rect x="12" y="12" width="24" height="24" rx="8" fill="none" stroke="#fff" stroke-width="3.6"/><circle cx="24" cy="24" r="5.8" fill="none" stroke="#fff" stroke-width="3.6"/><circle cx="32.4" cy="15.8" r="2.2" fill="#fff"/></svg>',
                'WA', 'whatsapp' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#67E35F"/><path d="M23.9 12.2c-6.7 0-12.1 5.2-12.1 11.7 0 2.2.6 4.2 1.8 6l-1.3 5.8 6-1.2a12.3 12.3 0 0 0 5.6 1.4c6.6 0 12-5.2 12-11.8 0-6.5-5.4-11.9-12-11.9Zm0 20.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.5.7.7-3.3-.2-.4a9.1 9.1 0 0 1-1.4-4.7c0-5 4.1-9 9.1-9 5 0 9 4.2 9 9.1s-4 9.2-9 9.2Z" fill="#fff"/><path d="M29 26.2c-.3-.2-2-1-2.3-1.1-.3-.1-.6-.2-.9.2l-.8 1c-.2.2-.4.3-.8.1-.4-.2-1.5-.6-2.8-1.8a10.5 10.5 0 0 1-1.9-2.3c-.2-.4 0-.6.1-.8l.6-.7c.2-.2.3-.4.4-.7.1-.2 0-.5-.1-.7l-1-2.4c-.3-.7-.6-.6-.9-.6h-.7c-.2 0-.7 0-1 .4-.4.4-1.4 1.3-1.4 3.2s1.5 3.6 1.7 3.9c.2.2 2.9 4.4 7.1 6 .9.4 1.7.6 2.3.8 1 .3 2 .2 2.7.1.8-.1 2.1-.9 2.4-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.7-.5Z" fill="#fff"/></svg>',
                'TT', 'tiktok' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#000"/><path d="M27.2 13.4c1 2.8 2.8 4.5 5.5 4.7v4.1a9.4 9.4 0 0 1-5.5-1.8v7.7c0 4.8-3 7.8-7.3 7.8-3.8 0-6.6-2.7-6.6-6.2 0-3.8 3-6.6 7-6.6.5 0 1 .1 1.4.2v4.3a3 3 0 0 0-1.3-.3c-1.8 0-3 .9-3 2.3 0 1.4 1 2.4 2.7 2.4 1.9 0 2.8-1.2 2.8-3V13.4h4.3Z" fill="#25F4EE"/><path d="M28.4 12c1 2.8 2.8 4.5 5.5 4.7v4.1a9.4 9.4 0 0 1-5.5-1.8v7.7c0 4.8-3 7.8-7.3 7.8-3.8 0-6.6-2.7-6.6-6.2 0-3.8 3-6.6 7-6.6.5 0 1 .1 1.4.2v4.3a3 3 0 0 0-1.3-.3c-1.8 0-3 .9-3 2.3 0 1.4 1 2.4 2.7 2.4 1.9 0 2.8-1.2 2.8-3V12h4.3Z" fill="#FE2C55" opacity=".9"/><path d="M27.8 12.7c1 2.8 2.8 4.5 5.5 4.7v4.1a9.4 9.4 0 0 1-5.5-1.8v7.7c0 4.8-3 7.8-7.3 7.8-3.8 0-6.6-2.7-6.6-6.2 0-3.8 3-6.6 7-6.6.5 0 1 .1 1.4.2v4.3a3 3 0 0 0-1.3-.3c-1.8 0-3 .9-3 2.3 0 1.4 1 2.4 2.7 2.4 1.9 0 2.8-1.2 2.8-3V12.7h4.3Z" fill="#fff"/></svg>',
                'YT', 'youtube' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect x="3.5" y="8" width="41" height="32" rx="10" fill="#fff" stroke="#E5E1D8" stroke-width="2"/><rect x="11" y="15" width="26" height="18" rx="5" fill="#EB3138"/><path d="M21 19.5l9 4.5-9 4.5v-9Z" fill="#fff"/></svg>',
                'WB', 'website' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#000"/><circle cx="24" cy="24" r="11" fill="none" stroke="#fff" stroke-width="3.2"/><path d="M13 24h22M24 13c3.6 3.2 5.4 6.8 5.4 11s-1.8 7.8-5.4 11c-3.6-3.2-5.4-6.8-5.4-11s1.8-7.8 5.4-11Z" fill="none" stroke="#fff" stroke-width="3.2"/></svg>',
                'SP', 'spotify' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#000"/><circle cx="24" cy="24" r="11" fill="#57D466"/><path d="M18 21.6c4.2-1 8.1-.7 11.7 1" fill="none" stroke="#111" stroke-linecap="round" stroke-width="2.5"/><path d="M18.8 25.4c3.4-.8 6.5-.5 9.5.8" fill="none" stroke="#111" stroke-linecap="round" stroke-width="2.3"/><path d="M19.7 29c2.4-.5 4.6-.3 6.6.5" fill="none" stroke="#111" stroke-linecap="round" stroke-width="2.1"/></svg>',
                'TH', 'threads' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#111"/><path d="M27.7 21.4c-.3-2.8-2.2-4.4-5.1-4.4-3.2 0-5.4 2-5.4 5h3.2c0-1.3.9-2.2 2.3-2.2 1.5 0 2.4.8 2.4 2.3v1.1h-2.3c-4 0-6.5 1.8-6.5 4.8 0 2.7 2.1 4.6 5.3 4.6 2 0 3.6-.7 4.7-2 .7.9 1.7 1.4 2.9 1.4 2.4 0 4.2-1.8 4.2-4.4 0-3.6-2.7-6-5.7-6.2Zm-2.6 5.2c0 1.9-1.2 3-3 3-1.3 0-2.2-.7-2.2-1.8 0-1.2 1-1.9 2.9-1.9h2.3v.7Z" fill="#fff"/></svg>',
                'FB', 'facebook' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#3366F0"/><path d="M26.7 39V26.5h4.2l.7-4.9h-4.9v-3.1c0-1.4.4-2.4 2.4-2.4h2.7V11.7c-.5-.1-2-.2-3.7-.2-3.7 0-6.2 2.2-6.2 6.3v3.8h-4.1v4.9h4.1V39h4.8Z" fill="#fff"/></svg>',
                'X', 'x' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#2A2A32"/><path d="M14 14h5.3l5.5 7.4 6.2-7.4H34l-7.9 9.4L34 34h-5.3l-5.8-7.7L16.4 34H14l8.1-9.7L14 14Z" fill="#fff"/></svg>',
                'PT', 'pinterest' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#E60023"/><path d="M24.7 12c-6.2 0-10.3 4.4-10.3 9.2 0 3.5 1.9 5.5 3.1 5.5.5 0 .8-1.3.8-1.7 0-.4-.9-1-1.4-2.3-.4-.9-.4-1.8-.4-2.8 0-3.3 2.5-5.9 5.9-5.9 2.9 0 5.1 1.6 5.1 4.6 0 2.2-.9 6.4-3.8 6.4-1 0-1.9-.8-1.9-1.8 0-1.6 1.1-3.2 1.1-4.9 0-3-4.2-2.4-4.2 1.2 0 .8.1 1.6.5 2.3l-1.9 7.7c.9.3 1.8.5 2.8.5 6 0 10.4-4.4 10.4-10.3 0-5-4.3-8-9.8-8Z" fill="#fff"/></svg>',
                'EMAIL', 'email' => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#111827"/><path d="M12 16h24v16H12V16Zm2.3 1.8 9.7 7.2 9.7-7.2" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>',
                default => '<svg aria-hidden="true" viewBox="0 0 48 48" class="h-5 w-5"><rect width="48" height="48" rx="12" fill="#111827"/><path d="m18 31 12-12M19 18h11v11" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>',
            };
        };
    @endphp

    <main class="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#fffdfa_0%,#fbf8f1_18%,#f8f3eb_100%)] px-6 py-10">
        <section class="relative w-full max-w-xl overflow-hidden rounded-[42px] shadow-[0_28px_80px_rgba(25,36,31,0.18)]">
            <div class="absolute inset-0" style="{{ $surfaceStyle }}"></div>
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,44,32,0.14)_0%,rgba(18,42,31,0.1)_32%,rgba(11,18,12,0.3)_74%,rgba(11,18,12,0.5)_100%)]"></div>
            <div class="relative flex min-h-[980px] flex-col p-8">
                <div class="mt-24 flex flex-col items-center text-center">
                    <img
                        alt="{{ $page->name }}"
                        class="h-28 w-28 rounded-full object-cover shadow-[0_16px_40px_rgba(25,36,31,0.16)]"
                        src="{{ $page->profile_image_path ? route('pages.image.show', $page) : asset('blank-avatar.svg') }}"
                    >
                    <p class="mt-6 text-[2.15rem] font-black tracking-[-0.055em] {{ $previewTextClass }}">{{ $page->name ?: ($page->handle ?? '@mylinks') }}</p>
                    @if ($page->bio || $page->headline)
                        <p class="mt-2 max-w-[340px] text-center text-[0.98rem] leading-6 {{ $previewMutedTextClass }}">
                            {{ $page->bio ?: $page->headline }}
                        </p>
                    @endif
                </div>

                <div class="mx-auto mt-10 w-full max-w-[390px]">
                    <div class="grid gap-4">
                @foreach ($page->links as $link)
                    <a
                        class="flex items-center justify-between px-5 py-4 transition hover:-translate-y-0.5"
                        href="{{ route('links.redirect', $link) }}"
                        style="{{ $buttonStyle }}"
                    >
                        <div>
                            <strong class="block text-[1.05rem]">{{ $link->title }}</strong>
                        </div>
                        <span class="grid h-10 w-10 place-items-center rounded-2xl">
                            {!! $iconSvg((string) ($link->icon ?: 'GO')) !!}
                        </span>
                    </a>
                @endforeach
                    </div>
                </div>

                <div class="mt-12 text-center">
                    <a
                        class="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-stone-950 shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
                        href="{{ route('landing') }}"
                    >
                        Junte-se a {{ $page->handle ?? '@mylinks' }} no MyLinks
                    </a>
                    <p class="mt-6 text-sm {{ $previewMutedTextClass }}">More from MyLinks</p>
                </div>
            </div>
        </section>
    </main>
@endsection
