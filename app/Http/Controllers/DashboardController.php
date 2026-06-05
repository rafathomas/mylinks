<?php

namespace App\Http\Controllers;

use App\Models\LinkItem;
use App\Models\LinkPage;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DashboardController extends Controller
{
    public function show(Request $request): View
    {
        $page = $this->resolvePage($request);
        $range = $this->normalizeRange($request->query('range'));

        return view('dashboard', [
            'dashboardData' => [
                'user' => [
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ],
                'page' => $this->serializePage($page),
                'links' => $page->links->map(fn(LinkItem $link) => $this->serializeLink($link))->all(),
                'analytics' => $this->analyticsPayload($page, $range),
                'billing' => [
                    'publishable_key' => (string) Config::get('services.stripe.publishable_key', ''),
                    'checkout_links' => [
                        'monthly' => (string) Config::get('services.stripe.payment_links.monthly', ''),
                        'annual' => (string) Config::get('services.stripe.payment_links.annual', ''),
                    ],
                    'stripe_mode' => (string) Config::get('services.stripe.mode', 'test'),
                ],
                'routes' => [
                    'onboardingSlugAvailability' => route('dashboard.onboarding.slug-availability'),
                    'syncOnboarding' => route('dashboard.onboarding.sync'),
                    'completeOnboarding' => route('dashboard.onboarding.complete'),
                    'updatePage' => route('dashboard.page.update'),
                    'uploadProfileImage' => route('dashboard.page.profile-image'),
                    'uploadBackgroundImage' => route('dashboard.page.background-image'),
                    'createSubscriptionIntent' => route('dashboard.billing.subscription-intent'),
                    'storeLink' => route('dashboard.links.store'),
                    'analytics' => route('dashboard.analytics'),
                    'reorderLinks' => route('dashboard.links.reorder'),
                    'logout' => route('logout'),
                    'landing' => route('landing'),
                    'publicPage' => route('pages.show', $page->slug),
                ],
            ],
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);
        $range = $this->normalizeRange($request->query('range'));

        return response()->json([
            'analytics' => $this->analyticsPayload($page, $range),
        ]);
    }

    public function slugAvailability(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);
        $slug = $this->normalizeProfileSlug((string) $request->query('slug'));

        if ($slug === '') {
            throw ValidationException::withMessages([
                'slug' => 'Escolha um link de perfil válido.',
            ]);
        }

        $available = ! LinkPage::where('slug', $slug)
            ->where('id', '!=', $page->id)
            ->exists();

        return response()->json([
            'slug' => $slug,
            'available' => $available,
            'suggestion' => $available ? $slug : $this->makeUniqueSlug($slug, $page->id),
        ]);
    }

    public function completeOnboarding(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);
        $validated = $this->validateOnboardingPayload($request);
        $this->applyOnboardingConfiguration($page, $validated);
        $page->update(['onboarding_completed_at' => now()]);

        $page = $page->fresh('links');

        return response()->json([
            'message' => 'Onboarding concluído com sucesso.',
            'page' => $this->serializePage($page),
            'links' => $page->links->map(fn(LinkItem $link) => $this->serializeLink($link))->all(),
        ]);
    }

    public function syncOnboarding(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);
        $validated = $this->validateOnboardingPayload($request);
        $this->applyOnboardingConfiguration($page, $validated);

        $page = $page->fresh('links');

        return response()->json([
            'message' => 'Configuração do onboarding sincronizada com sucesso.',
            'page' => $this->serializePage($page),
            'links' => $page->links->map(fn(LinkItem $link) => $this->serializeLink($link))->all(),
        ]);
    }

    public function updatePage(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/', 'unique:mylinks_pages,slug,' . $page->id],
            'handle' => ['nullable', 'string', 'max:255'],
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'location' => ['nullable', 'string', 'max:255'],
            'theme' => ['required', 'in:mylinks,graphite,sand'],
            'selected_theme_id' => ['nullable', 'string', 'in:midnight-echo,sky-bloom,retro-grid,editorial-cream,forest-room,paper-light,grain-shadow,plum-store,violet-pop,powder-air,mono-ink,sun-halo,night-drive,rose-cloud'],
            'background_type' => ['required', 'in:image,color'],
            'background_value' => ['required', 'string', 'max:64'],
            'button_style' => ['required', 'in:solid,glass,outline'],
            'button_radius' => ['required', 'in:square,soft,rounded,pill'],
            'button_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'button_text_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'social_links' => ['nullable', 'array'],
            'social_links.instagram' => ['nullable', 'string', 'max:255'],
            'social_links.pinterest' => ['nullable', 'string', 'max:255'],
            'social_links.email' => ['nullable', 'string', 'max:255'],
            'is_published' => ['boolean'],
        ]);

        $validated['social_links'] = $this->normalizeSocialLinks($validated['social_links'] ?? []);
        $normalizedBackgroundValue = $this->normalizeBackgroundValue(
            $validated['background_type'],
            $validated['background_value'],
        );
        $validated['background_value'] = $normalizedBackgroundValue;

        if ($validated['background_value'] === null) {
            throw ValidationException::withMessages([
                'background_value' => 'Escolha um plano de fundo válido para a sua página.',
            ]);
        }

        if ($validated['background_type'] === 'color') {
            $validated['background_image_path'] = null;
        }

        $page->update($validated);

        return response()->json([
            'message' => 'Página atualizada com sucesso.',
            'page' => $this->serializePage($page->fresh()),
        ]);
    }

    public function uploadProfileImage(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);

        $validated = $request->validate([
            'profile_image' => ['required', 'image', 'max:2048'],
        ]);

        if ($page->profile_image_path) {
            Storage::disk('public')->delete($page->profile_image_path);
        }

        $path = $validated['profile_image']->store("page-profiles/{$page->id}", 'public');

        $page->update([
            'profile_image_path' => $path,
        ]);

        return response()->json([
            'message' => 'Imagem de perfil atualizada com sucesso.',
            'page' => $this->serializePage($page->fresh()),
        ]);
    }

    public function uploadBackgroundImage(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);

        $validated = $request->validate([
            'background_image' => ['required', 'image', 'max:4096'],
        ]);

        if ($page->background_image_path) {
            Storage::disk('public')->delete($page->background_image_path);
        }

        $path = $validated['background_image']->store("page-backgrounds/{$page->id}", 'public');

        $page->update([
            'selected_theme_id' => null,
            'background_type' => 'image',
            'background_value' => 'upload',
            'background_image_path' => $path,
        ]);

        return response()->json([
            'message' => 'Plano de fundo atualizado com sucesso.',
            'page' => $this->serializePage($page->fresh()),
        ]);
    }

    public function storeLink(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);
        $platform = 'website';
        $meta = $this->platformMeta($platform);

        $link = $page->links()->create([
            'title' => $meta['title'],
            'url' => 'https://seusite.com',
            'description' => $meta['description'],
            'icon' => $meta['icon'],
            'sort_order' => (int)$page->links()->max('sort_order') + 1,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Link criado com sucesso.',
            'link' => $this->serializeLink($link),
        ], 201);
    }

    public function updateLink(Request $request, LinkItem $link): JsonResponse
    {
        $page = $this->resolvePage($request);
        abort_unless($link->mylinks_page_id === $page->id, 404);
        $this->normalizeLinkBooleanInputs($request);

        $validated = $request->validate([
            'platform' => ['required', 'in:instagram,whatsapp,tiktok,youtube,website,spotify,threads,facebook,x'],
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $meta = $this->platformMeta($validated['platform']);
        $normalizedUrl = $this->normalizePlatformUrl($validated['platform'], $validated['url']);

        if (! $normalizedUrl) {
            throw ValidationException::withMessages([
                'url' => 'Informe um usuário ou URL válida para essa rede social.',
            ]);
        }

        $validated['url'] = $normalizedUrl;
        $validated['icon'] = $meta['icon'];
        $validated['description'] = $validated['description'] ?: $meta['description'];

        if (($validated['is_featured'] ?? false) === true) {
            $page->links()->where('id', '!=', $link->id)->update(['is_featured' => false]);
        }

        $link->update($validated);

        return response()->json([
            'message' => 'Link atualizado com sucesso.',
            'link' => $this->serializeLink($link->fresh()),
        ]);
    }

    public function destroyLink(Request $request, LinkItem $link): JsonResponse
    {
        $page = $this->resolvePage($request);
        abort_unless($link->mylinks_page_id === $page->id, 404);

        $link->delete();

        return response()->json([
            'message' => 'Link removido com sucesso.',
        ]);
    }

    public function reorderLinks(Request $request): JsonResponse
    {
        $page = $this->resolvePage($request);

        $validated = $request->validate([
            'links' => ['required', 'array', 'min:1'],
            'links.*' => ['integer'],
        ]);

        $existingIds = $page->links()->pluck('id')->all();
        $incomingIds = $validated['links'];

        sort($existingIds);
        $sortedIncoming = $incomingIds;
        sort($sortedIncoming);

        abort_unless(
            $existingIds === $sortedIncoming,
            422,
            'A lista de links enviada não corresponde aos links da página.',
        );

        foreach ($incomingIds as $index => $linkId) {
            $page->links()->whereKey($linkId)->update(['sort_order' => $index + 1]);
        }

        return response()->json([
            'message' => 'Ordem dos links atualizada com sucesso.',
            'links' => $page->fresh('links')->links->map(fn(LinkItem $link) => $this->serializeLink($link))->all(),
        ]);
    }

    public function publish(Request $request): RedirectResponse
    {
        $page = $this->resolvePage($request);
        $page->update(['is_published' => true]);

        return redirect()->route('dashboard.show');
    }

    public function showProfileImage(LinkPage $page): BinaryFileResponse
    {
        abort_unless($page->profile_image_path, 404);
        abort_unless(Storage::disk('public')->exists($page->profile_image_path), 404);

        $path = Storage::disk('public')->path($page->profile_image_path);

        return response()->file($path, [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }

    public function showBackgroundImage(LinkPage $page): BinaryFileResponse
    {
        abort_unless($page->background_image_path, 404);
        abort_unless(Storage::disk('public')->exists($page->background_image_path), 404);

        $path = Storage::disk('public')->path($page->background_image_path);

        return response()->file($path, [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }

    private function resolvePage(Request $request): LinkPage
    {
        $page = $request->user()->linkPages()->with('links')->first();

        if ($page) {
            return $page;
        }

        $slug = Str::before($request->user()->email, '@');

        return $request->user()->linkPages()->create([
            'name' => $request->user()->name,
            'slug' => $this->makeUniqueSlug($slug),
            'handle' => '@' . Str::slug(Str::before($request->user()->email, '@'), ''),
            'headline' => 'Seu link-in-bio profissional pronto para vender',
            'bio' => 'Centralize seus links, WhatsApp e ofertas em uma página clara e rápida.',
            'location' => 'Brasil',
            'theme' => 'mylinks',
            'selected_theme_id' => null,
            'background_type' => 'image',
            'background_value' => 'upload',
            'background_image_path' => null,
            'button_style' => 'solid',
            'button_radius' => 'rounded',
            'button_color' => '#FFFFFF',
            'button_text_color' => '#111827',
            'is_published' => false,
            'profile_image_path' => null,
            'social_links' => [
                'instagram' => null,
                'pinterest' => null,
                'email' => $request->user()->email ?? null,
            ],
            'onboarding_completed_at' => null,
        ]);
    }

    private function serializePage(LinkPage $page): array
    {
        $assetVersion = (string) ($page->updated_at?->timestamp ?? now()->timestamp);

        return [
            'id' => $page->id,
            'plan' => $page->user?->current_plan ?? 'free',
            'name' => $page->name,
            'slug' => $page->slug,
            'handle' => $page->handle,
            'headline' => $page->headline,
            'bio' => $page->bio,
            'location' => $page->location,
            'theme' => $page->theme,
            'selected_theme_id' => $page->selected_theme_id,
            'background_type' => $page->background_type,
            'background_value' => $page->background_value,
            'background_image_url' => $page->background_image_path ? route('pages.background.show', ['page' => $page, 'v' => $assetVersion]) : null,
            'button_style' => $page->button_style,
            'button_radius' => $page->button_radius,
            'button_color' => $page->button_color,
            'button_text_color' => $page->button_text_color,
            'whatsapp_number' => $page->whatsapp_number,
            'profile_image_url' => $page->profile_image_path ? route('pages.image.show', ['page' => $page, 'v' => $assetVersion]) : null,
            'social_links' => $page->social_links ?? [],
            'onboarding_completed' => $page->onboarding_completed_at !== null,
            'is_published' => $page->is_published,
        ];
    }

    private function serializeLink(LinkItem $link): array
    {
        return [
            'id' => $link->id,
            'platform' => $this->detectPlatformFromLink($link),
            'title' => $link->title,
            'url' => $link->url,
            'description' => $link->description,
            'icon' => $link->icon,
            'is_active' => $link->is_active,
            'is_featured' => $link->is_featured,
            'sort_order' => $link->sort_order,
        ];
    }

    private function validateOnboardingPayload(Request $request): array
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'max:255'],
            'theme' => ['nullable', 'in:mylinks,graphite,sand'],
            'selected_theme_id' => ['nullable', 'string', 'in:midnight-echo,sky-bloom,retro-grid,editorial-cream,forest-room,paper-light,grain-shadow,plum-store,violet-pop,powder-air,mono-ink,sun-halo,night-drive,rose-cloud'],
            'selected_platforms' => ['nullable', 'array', 'max:5'],
            'selected_platforms.*' => ['string', 'in:instagram,whatsapp,tiktok,youtube,website,spotify,threads,facebook,x'],
            'platform_links' => ['nullable', 'array'],
            'platform_links.instagram' => ['nullable', 'string', 'max:255'],
            'platform_links.whatsapp' => ['nullable', 'string', 'max:255'],
            'platform_links.tiktok' => ['nullable', 'string', 'max:255'],
            'platform_links.youtube' => ['nullable', 'string', 'max:255'],
            'platform_links.website' => ['nullable', 'string', 'max:255'],
            'platform_links.spotify' => ['nullable', 'string', 'max:255'],
            'platform_links.threads' => ['nullable', 'string', 'max:255'],
            'platform_links.facebook' => ['nullable', 'string', 'max:255'],
            'platform_links.x' => ['nullable', 'string', 'max:255'],
            'additional_links' => ['nullable', 'array', 'max:3'],
            'additional_links.*' => ['nullable', 'string', 'max:500'],
        ]);

        $slug = $this->normalizeProfileSlug($validated['slug']);

        if ($slug === '') {
            throw ValidationException::withMessages([
                'slug' => 'Escolha um link de perfil válido.',
            ]);
        }

        $validated['slug'] = $slug;

        return $validated;
    }

    private function applyOnboardingConfiguration(LinkPage $page, array $validated): void
    {
        if (LinkPage::where('slug', $validated['slug'])->where('id', '!=', $page->id)->exists()) {
            throw ValidationException::withMessages([
                'slug' => 'Esse link já está em uso. Tente outra opção.',
            ]);
        }

        $selectedPlatforms = collect($validated['selected_platforms'] ?? [])->filter()->unique()->values();
        $platformLinks = collect($validated['platform_links'] ?? [])
            ->mapWithKeys(fn($value, $key) => [$key => is_string($value) ? trim($value) : null]);
        $additionalLinks = collect($validated['additional_links'] ?? [])
            ->map(fn($value) => is_string($value) ? trim($value) : '')
            ->filter()
            ->values();

        $page->update([
            'slug' => $validated['slug'],
            'handle' => '@'.$validated['slug'],
            'theme' => $validated['theme'] ?: $page->theme,
            'selected_theme_id' => $validated['selected_theme_id'] ?? null,
        ]);

        $themePreset = $this->onboardingThemePreset($validated['selected_theme_id'] ?? null);

        if ($themePreset !== null) {
            $page->update($themePreset);
        }

        $page->links()->delete();

        $sortOrder = 1;
        $linksToCreate = [];

        foreach ($selectedPlatforms as $platform) {
            $normalizedUrl = $this->normalizeOnboardingPlatformUrl($platform, $platformLinks->get($platform));

            if (! $normalizedUrl) {
                continue;
            }

            $meta = $this->platformMeta($platform);

            $linksToCreate[] = [
                'title' => $meta['title'],
                'url' => $normalizedUrl,
                'description' => $meta['description'],
                'icon' => $meta['icon'],
                'sort_order' => $sortOrder,
                'is_active' => true,
                'is_featured' => $sortOrder === 1,
            ];

            $sortOrder++;
        }

        foreach ($additionalLinks as $index => $url) {
            $normalizedUrl = $this->normalizeUrlLike($url, 'https://');

            if (! $normalizedUrl) {
                continue;
            }

            $linksToCreate[] = [
                'title' => 'Link adicional '.($index + 1),
                'url' => $normalizedUrl,
                'description' => 'Adicionado durante o onboarding inicial.',
                'icon' => 'GO',
                'sort_order' => $sortOrder,
                'is_active' => true,
                'is_featured' => false,
            ];

            $sortOrder++;
        }

        if ($linksToCreate !== []) {
            $page->links()->createMany($linksToCreate);
        }
    }

    private function normalizeRange(?string $range): string
    {
        return in_array($range, ['7d', '30d', '90d'], true) ? $range : '7d';
    }

    private function analyticsPayload(LinkPage $page, string $range): array
    {
        $days = match ($range) {
            '30d' => 30,
            '90d' => 90,
            default => 7,
        };

        $end = CarbonImmutable::now()->endOfDay();
        $start = $end->subDays($days - 1)->startOfDay();
        $previousEnd = $start->subSecond();
        $previousStart = $previousEnd->subDays($days - 1)->startOfDay();

        $activeLinks = $page->links()->where('is_active', true)->count();
        $currentEvents = $page->clickEvents()
            ->with('link')
            ->whereBetween('clicked_at', [$start, $end])
            ->get();
        $previousEvents = $page->clickEvents()
            ->with('link')
            ->whereBetween('clicked_at', [$previousStart, $previousEnd])
            ->get();

        $visits = $currentEvents->where('channel', 'page_view')->count();
        $previousVisits = $previousEvents->where('channel', 'page_view')->count();
        $clickEvents = $currentEvents->reject(fn($event) => $event->channel === 'page_view')->values();
        $previousClickEvents = $previousEvents->reject(fn($event) => $event->channel === 'page_view')->values();
        $clicks = $clickEvents->count();
        $previousClicks = $previousClickEvents->count();
        $linkViews = $visits * $activeLinks;
        $previousLinkViews = $previousVisits * $activeLinks;
        $whatsapp = $clickEvents->filter(fn($event) => $event->link?->icon === 'WA')->count();
        $socialClicks = $clickEvents->filter(fn($event) => str_starts_with((string) $event->channel, 'social_'))->count();
        $ctr = $this->formatPercent($clicks, $linkViews);
        $previousCtrValue = $this->percentValue($previousClicks, $previousLinkViews);
        $currentCtrValue = $this->percentValue($clicks, $linkViews);
        $uniqueVisitors = $currentEvents->pluck('visitor_hash')->filter()->unique()->count();
        $recentClicks = $clickEvents->filter(fn ($event) => $event->clicked_at?->greaterThanOrEqualTo(now()->subDay()))->count();

        $topLinks = $clickEvents
            ->groupBy('mylinks_item_id')
            ->map(function ($group, $linkId) use ($page) {
                $link = $page->links->firstWhere('id', $linkId);

                return [
                    'id' => $linkId,
                    'title' => $link?->title ?? 'Link removido',
                    'clicks' => $group->count(),
                ];
            })
            ->sortByDesc('clicks')
            ->values()
            ->take(3)
            ->all();

        $topPerformer = $topLinks[0] ?? null;
        $leadSignals = [
            [
                'label' => 'Visitantes únicos',
                'value' => (string) $uniqueVisitors,
                'detail' => 'Pessoas diferentes que clicaram no período.',
            ],
            [
                'label' => 'Cliques nas últimas 24h',
                'value' => (string) $recentClicks,
                'detail' => 'Sinal recente de interesse na sua página.',
            ],
            [
                'label' => 'Cliques sociais',
                'value' => (string) $socialClicks,
                'detail' => 'Acessos vindos dos botões de rede social.',
            ],
            [
                'label' => 'Link mais forte',
                'value' => $topPerformer['title'] ?? 'Sem dados',
                'detail' => $topPerformer ? $topPerformer['clicks'] . ' cliques no período.' : 'Ainda sem atividade suficiente.',
            ],
        ];

        return [
            'range' => $range,
            'visits' => $this->formatWholeNumber($visits),
            'visitsDelta' => $this->formatDelta($visits, $previousVisits, 'vs. período anterior'),
            'linkViews' => $this->formatWholeNumber($linkViews),
            'linkViewsDelta' => $this->formatDelta($linkViews, $previousLinkViews, 'vs. período anterior'),
            'clicks' => $this->formatWholeNumber($clicks),
            'clicksDelta' => $this->formatDelta($clicks, $previousClicks, 'vs. período anterior'),
            'whatsapp' => (string) $whatsapp,
            'socialClicks' => (string) $socialClicks,
            'activeLinks' => (string) $activeLinks,
            'ctr' => $ctr,
            'ctrDelta' => $this->formatPercentagePointDelta($currentCtrValue, $previousCtrValue),
            'uniqueVisitors' => $this->formatWholeNumber($uniqueVisitors),
            'recentClicks' => (string) $recentClicks,
            'leadSignals' => $leadSignals,
            'topLinks' => $topLinks,
        ];
    }

    private function formatWholeNumber(int $value): string
    {
        return number_format($value, 0, ',', '.');
    }

    private function percentValue(int $numerator, int $denominator): float
    {
        if ($denominator <= 0) {
            return 0.0;
        }

        return ($numerator / $denominator) * 100;
    }

    private function formatPercent(int $numerator, int $denominator): string
    {
        return number_format($this->percentValue($numerator, $denominator), 1, ',', '.') . '%';
    }

    private function formatDelta(int $current, int $previous, string $suffix): string
    {
        if ($previous === 0) {
            return $current > 0 ? 'Novo neste período' : 'Sem alteração no período';
        }

        $difference = (($current - $previous) / $previous) * 100;
        $prefix = $difference >= 0 ? '↑' : '↓';

        return sprintf('%s %s %s', $prefix, number_format(abs($difference), 1, ',', '.'), $suffix);
    }

    private function formatPercentagePointDelta(float $current, float $previous): string
    {
        $difference = $current - $previous;

        if (abs($difference) < 0.05) {
            return 'Sem variação relevante';
        }

        $prefix = $difference >= 0 ? '↑' : '↓';

        return sprintf('%s %s p.p. vs. período anterior', $prefix, number_format(abs($difference), 1, ',', '.'));
    }

    private function normalizeSocialLinks(array $socialLinks): array
    {
        $instagram = $this->normalizeUrlLike($socialLinks['instagram'] ?? null, 'https://');
        $pinterest = $this->normalizeUrlLike($socialLinks['pinterest'] ?? null, 'https://');
        $email = $this->normalizeEmailLink($socialLinks['email'] ?? null);

        return [
            'instagram' => $instagram,
            'pinterest' => $pinterest,
            'email' => $email,
        ];
    }

    private function normalizeUrlLike(?string $value, string $defaultScheme = 'https://'): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim($value);

        if ($normalized === '') {
            return null;
        }

        if (! str_starts_with($normalized, 'http://') && ! str_starts_with($normalized, 'https://') && ! str_starts_with($normalized, 'mailto:')) {
            $normalized = $defaultScheme . $normalized;
        }

        return $normalized;
    }

    private function normalizeEmailLink(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim($value);

        if ($normalized === '') {
            return null;
        }

        if (str_starts_with($normalized, 'mailto:')) {
            return $normalized;
        }

        return 'mailto:' . $normalized;
    }

    private function normalizeBackgroundValue(string $type, string $value): ?string
    {
        $normalized = trim($value);

        if ($normalized === '') {
            return null;
        }

        if ($type === 'image') {
            return $normalized === 'upload' ? $normalized : null;
        }

        return preg_match('/^#[0-9a-fA-F]{6}$/', $normalized) ? strtoupper($normalized) : null;
    }

    private function makeUniqueSlug(string $seed, ?int $ignoreId = null): string
    {
        $baseSlug = $this->normalizeProfileSlug($seed);
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'mylinks';
        $slug = $baseSlug;
        $counter = 1;

        while (
            LinkPage::where('slug', $slug)
                ->when($ignoreId, fn($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $counter++;
            $slug = "{$baseSlug}-{$counter}";
        }

        return $slug;
    }

    private function normalizeProfileSlug(string $value): string
    {
        return (string) Str::of(Str::lower($value))
            ->replaceMatches('/[^a-z0-9._-]+/', '-')
            ->replaceMatches('/[-_.]{2,}/', '-')
            ->trim('-_.');
    }

    private function platformMeta(string $platform): array
    {
        return match ($platform) {
            'instagram' => ['title' => 'Instagram', 'description' => 'Leve seu público para o seu Instagram.', 'icon' => 'IG'],
            'whatsapp' => ['title' => 'WhatsApp', 'description' => 'Receba mensagens e pedidos diretamente no WhatsApp.', 'icon' => 'WA'],
            'tiktok' => ['title' => 'TikTok', 'description' => 'Compartilhe seu perfil do TikTok.', 'icon' => 'TT'],
            'youtube' => ['title' => 'YouTube', 'description' => 'Mostre seus vídeos e canal.', 'icon' => 'YT'],
            'website' => ['title' => 'Website', 'description' => 'Direcione para seu site principal.', 'icon' => 'WB'],
            'spotify' => ['title' => 'Spotify', 'description' => 'Divulgue playlists, músicas ou podcast.', 'icon' => 'SP'],
            'threads' => ['title' => 'Threads', 'description' => 'Conecte sua audiência do Threads.', 'icon' => 'TH'],
            'facebook' => ['title' => 'Facebook', 'description' => 'Adicione sua página do Facebook.', 'icon' => 'FB'],
            'x' => ['title' => 'X', 'description' => 'Divulgue seu perfil no X.', 'icon' => 'X'],
            default => ['title' => 'Link', 'description' => 'Novo link criado no onboarding.', 'icon' => 'GO'],
        };
    }

    private function normalizeOnboardingPlatformUrl(string $platform, ?string $value): ?string
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return null;
        }

        return $this->normalizePlatformUrl($platform, $normalized);
    }

    private function normalizePlatformUrl(string $platform, ?string $value): ?string
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return null;
        }

        return match ($platform) {
            'instagram' => $this->normalizeSocialHandleUrl($normalized, 'https://instagram.com/'),
            'whatsapp' => $this->normalizeWhatsAppUrl($normalized),
            'tiktok' => $this->normalizeSocialHandleUrl($normalized, 'https://www.tiktok.com/@'),
            'youtube' => $this->normalizeSocialHandleUrl($normalized, 'https://youtube.com/@'),
            'website' => $this->normalizeUrlLike($normalized, 'https://'),
            'spotify' => $this->normalizeUrlLike($normalized, 'https://'),
            'threads' => $this->normalizeSocialHandleUrl($normalized, 'https://threads.net/@'),
            'facebook' => $this->normalizeSocialHandleUrl($normalized, 'https://facebook.com/'),
            'x' => $this->normalizeSocialHandleUrl($normalized, 'https://x.com/'),
            default => $this->normalizeUrlLike($normalized, 'https://'),
        };
    }

    private function detectPlatformFromLink(LinkItem $link): string
    {
        return match ($link->icon) {
            'IG' => 'instagram',
            'WA' => 'whatsapp',
            'TT' => 'tiktok',
            'YT' => 'youtube',
            'WB' => 'website',
            'SP' => 'spotify',
            'TH' => 'threads',
            'FB' => 'facebook',
            'X' => 'x',
            default => 'website',
        };
    }

    private function onboardingThemePreset(?string $themeId): ?array
    {
        return match ($themeId) {
            'midnight-echo' => [
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#050505',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#2A2A2A',
                'button_text_color' => '#FFFFFF',
            ],
            'sky-bloom' => [
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#B8D7DF',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#FFFFFF',
                'button_text_color' => '#40333D',
            ],
            'retro-grid' => [
                'theme' => 'sand',
                'background_type' => 'color',
                'background_value' => '#5F4042',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#FAEECF',
                'button_text_color' => '#5F4042',
            ],
            'editorial-cream' => [
                'theme' => 'sand',
                'background_type' => 'color',
                'background_value' => '#F5EDDF',
                'background_image_path' => null,
                'button_style' => 'outline',
                'button_radius' => 'rounded',
                'button_color' => '#EF5A50',
                'button_text_color' => '#DE4A3D',
            ],
            'forest-room' => [
                'theme' => 'mylinks',
                'background_type' => 'color',
                'background_value' => '#132F28',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#EDF9DB',
                'button_text_color' => '#132F28',
            ],
            'paper-light' => [
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#ECEEF4',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#FFFFFF',
                'button_text_color' => '#0A0A0A',
            ],
            'grain-shadow' => [
                'theme' => 'sand',
                'background_type' => 'color',
                'background_value' => '#6F665E',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#A59890',
                'button_text_color' => '#F3ECE5',
            ],
            'plum-store' => [
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#471331',
                'background_image_path' => null,
                'button_style' => 'outline',
                'button_radius' => 'rounded',
                'button_color' => '#FFFFFF',
                'button_text_color' => '#FFFFFF',
            ],
            'violet-pop' => [
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#8A5DB7',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#EAD8FB',
                'button_text_color' => '#4C1D95',
            ],
            'powder-air' => [
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#C8D8E3',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#D8E7EF',
                'button_text_color' => '#31424E',
            ],
            'mono-ink' => [
                'theme' => 'sand',
                'background_type' => 'color',
                'background_value' => '#E8E5D9',
                'background_image_path' => null,
                'button_style' => 'outline',
                'button_radius' => 'soft',
                'button_color' => '#332E33',
                'button_text_color' => '#111111',
            ],
            'sun-halo' => [
                'theme' => 'mylinks',
                'background_type' => 'color',
                'background_value' => '#E96857',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#FFFFFF',
                'button_text_color' => '#E96857',
            ],
            'night-drive' => [
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#1E1D1D',
                'background_image_path' => null,
                'button_style' => 'outline',
                'button_radius' => 'rounded',
                'button_color' => '#F3EDE7',
                'button_text_color' => '#F3EDE7',
            ],
            'rose-cloud' => [
                'theme' => 'sand',
                'background_type' => 'color',
                'background_value' => '#F3E5E8',
                'background_image_path' => null,
                'button_style' => 'solid',
                'button_radius' => 'rounded',
                'button_color' => '#FFFFFF',
                'button_text_color' => '#3D3338',
            ],
            default => null,
        };
    }

    private function normalizeSocialHandleUrl(string $value, string $prefix): ?string
    {
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        $normalized = ltrim(trim($value), '@');

        return $normalized !== '' ? $prefix.$normalized : null;
    }

    private function normalizeWhatsAppUrl(string $value): ?string
    {
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        $digits = preg_replace('/\D+/', '', $value);

        return $digits ? 'https://wa.me/'.$digits : null;
    }

    private function normalizeLinkBooleanInputs(Request $request): void
    {
        foreach (['is_active', 'is_featured'] as $field) {
            if (! $request->has($field)) {
                continue;
            }

            $request->merge([
                $field => filter_var($request->input($field), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }
}
