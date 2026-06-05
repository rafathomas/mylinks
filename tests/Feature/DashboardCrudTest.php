<?php

namespace Tests\Feature;

use App\Models\LinkItem;
use App\Models\LinkPage;
use App\Models\User;
use App\Models\ClickEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DashboardCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_sees_the_dashboard_with_serialized_page_data(): void
    {
        $page = LinkPage::factory()->create([
            'name' => 'Cafe Botanico',
            'slug' => 'cafe-botanico',
        ]);

        $this->actingAs($page->user)
            ->get(route('dashboard.show'))
            ->assertOk()
            ->assertSee('data-component="dashboard"', false)
            ->assertSee('cafe-botanico')
            ->assertSee('Cafe Botanico');
    }

    public function test_user_can_update_page_profile(): void
    {
        $page = LinkPage::factory()->create();
        LinkItem::factory()->for($page, 'page')->create([
            'is_active' => true,
        ]);

        $this->actingAs($page->user)
            ->putJson(route('dashboard.page.update'), [
                'name' => 'Studio Flora',
                'slug' => 'studio-flora',
                'handle' => '@studioflora',
                'headline' => 'Marca botanica premium',
                'bio' => 'Presentes e colecoes autorais.',
                'location' => 'Sao Paulo, SP',
                'theme' => 'graphite',
                'background_type' => 'color',
                'background_value' => '#456B5B',
                'button_style' => 'outline',
                'button_radius' => 'pill',
                'button_color' => '#123456',
                'button_text_color' => '#F8FAFC',
                'whatsapp_number' => '5511999999999',
                'social_links' => [
                    'instagram' => 'instagram.com/studioflora',
                    'pinterest' => 'pinterest.com/studioflora',
                    'email' => 'contato@studioflora.com',
                ],
                'is_published' => true,
            ])
            ->assertOk()
            ->assertJsonPath('page.slug', 'studio-flora')
            ->assertJsonPath('page.social_links.instagram', 'https://instagram.com/studioflora')
            ->assertJsonPath('page.social_links.email', 'mailto:contato@studioflora.com');

        $this->assertDatabaseHas('mylinks_pages', [
            'id' => $page->id,
            'name' => 'Studio Flora',
            'slug' => 'studio-flora',
            'theme' => 'graphite',
            'background_type' => 'color',
            'background_value' => '#456B5B',
            'button_style' => 'outline',
            'button_radius' => 'pill',
            'button_color' => '#123456',
            'button_text_color' => '#F8FAFC',
        ]);
    }

    public function test_slug_availability_returns_a_suggestion_for_duplicate_links(): void
    {
        $firstPage = LinkPage::factory()->create([
            'slug' => 'contato.rafaelthomas',
        ]);
        $secondPage = LinkPage::factory()->create();

        $this->actingAs($secondPage->user)
            ->getJson(route('dashboard.onboarding.slug-availability', ['slug' => $firstPage->slug]))
            ->assertOk()
            ->assertJsonPath('available', false)
            ->assertJsonPath('suggestion', 'contato.rafaelthomas-2');
    }

    public function test_user_can_complete_onboarding_with_unique_slug_and_initial_links(): void
    {
        $page = LinkPage::factory()->create([
            'slug' => 'placeholder',
            'onboarding_completed_at' => null,
        ]);

        $this->assertCount(0, $page->links);

        $this->actingAs($page->user)
            ->postJson(route('dashboard.onboarding.complete'), [
                'slug' => 'contato.rafaelthomas',
                'theme' => 'graphite',
                'selected_theme_id' => 'midnight-echo',
                'selected_platforms' => ['instagram', 'whatsapp'],
                'platform_links' => [
                    'instagram' => '@rafaelthomas',
                    'whatsapp' => '(11) 99999-9999',
                ],
                'additional_links' => [
                    'https://example.com/catalogo',
                    '',
                    'example.com/cardapio',
                ],
            ])
            ->assertOk()
            ->assertJsonPath('page.slug', 'contato.rafaelthomas')
            ->assertJsonPath('page.theme', 'graphite')
            ->assertJsonPath('page.selected_theme_id', 'midnight-echo')
            ->assertJsonPath('page.background_type', 'color')
            ->assertJsonPath('page.background_value', '#050505')
            ->assertJsonPath('page.onboarding_completed', true)
            ->assertJsonCount(4, 'links');

        $page->refresh();

        $this->assertNotNull($page->onboarding_completed_at);
        $this->assertSame('contato.rafaelthomas', $page->slug);
        $this->assertSame('midnight-echo', $page->selected_theme_id);
        $this->assertSame('#050505', $page->background_value);
        $this->assertDatabaseHas('mylinks_items', [
            'mylinks_page_id' => $page->id,
            'title' => 'Instagram',
            'url' => 'https://instagram.com/rafaelthomas',
        ]);
        $this->assertDatabaseHas('mylinks_items', [
            'mylinks_page_id' => $page->id,
            'title' => 'WhatsApp',
            'url' => 'https://wa.me/11999999999',
        ]);
        $this->assertDatabaseHas('mylinks_items', [
            'mylinks_page_id' => $page->id,
            'title' => 'Link adicional 2',
            'url' => 'https://example.com/cardapio',
        ]);
    }

    public function test_user_can_create_a_subscription_intent_for_embedded_stripe_checkout(): void
    {
        $page = LinkPage::factory()->create();

        Config::set('services.stripe.secret_key', 'sk_test_123');
        Config::set('services.stripe.publishable_key', 'pk_test_123');
        Config::set('services.stripe.prices.monthly', 'price_monthly_test');

        Http::fake([
            'https://api.stripe.com/v1/customers' => Http::response([
                'id' => 'cus_test_123',
            ], 200),
            'https://api.stripe.com/v1/subscriptions' => Http::response([
                'id' => 'sub_test_123',
                'status' => 'incomplete',
                'latest_invoice' => [
                    'confirmation_secret' => [
                        'client_secret' => 'cs_test_123',
                    ],
                ],
            ], 200),
        ]);

        $this->actingAs($page->user)
            ->postJson(route('dashboard.billing.subscription-intent'), [
                'billing_cycle' => 'monthly',
            ])
            ->assertOk()
            ->assertJsonPath('client_secret', 'cs_test_123')
            ->assertJsonPath('publishable_key', 'pk_test_123')
            ->assertJsonPath('subscription_id', 'sub_test_123');
    }

    public function test_user_can_create_update_and_delete_links(): void
    {
        $page = LinkPage::factory()->create();

        $createResponse = $this->actingAs($page->user)
            ->postJson(route('dashboard.links.store'))
            ->assertCreated()
            ->assertJsonPath('link.title', 'Website')
            ->assertJsonPath('link.platform', 'website')
            ->assertJsonPath('link.icon', 'WB');

        $linkId = $createResponse->json('link.id');

        $this->actingAs($page->user)
            ->putJson(route('dashboard.links.update', $linkId), [
                'platform' => 'instagram',
                'title' => 'Agendar visita',
                'url' => '@studioflora',
                'description' => 'Canal principal para reservas',
                'is_active' => true,
                'is_featured' => true,
            ])
            ->assertOk()
            ->assertJsonPath('link.title', 'Agendar visita')
            ->assertJsonPath('link.platform', 'instagram')
            ->assertJsonPath('link.icon', 'IG')
            ->assertJsonPath('link.url', 'https://instagram.com/studioflora');

        $this->assertDatabaseHas('mylinks_items', [
            'id' => $linkId,
            'title' => 'Agendar visita',
            'icon' => 'IG',
            'is_featured' => true,
        ]);

        $this->actingAs($page->user)
            ->deleteJson(route('dashboard.links.destroy', $linkId))
            ->assertOk();

        $this->assertDatabaseMissing('mylinks_items', ['id' => $linkId]);
    }

    public function test_user_can_update_link_when_boolean_fields_arrive_as_strings(): void
    {
        $page = LinkPage::factory()->create();
        $link = LinkItem::factory()->for($page, 'page')->create([
            'is_active' => true,
            'is_featured' => true,
        ]);

        $this->actingAs($page->user)
            ->putJson(route('dashboard.links.update', $link), [
                'platform' => 'whatsapp',
                'title' => 'Pedir no WhatsApp',
                'url' => '5511999999999',
                'description' => 'Atendimento rápido',
                'is_active' => 'true',
                'is_featured' => 'false',
            ])
            ->assertOk()
            ->assertJsonPath('link.is_active', true)
            ->assertJsonPath('link.is_featured', false)
            ->assertJsonPath('link.url', 'https://wa.me/5511999999999');

        $this->assertDatabaseHas('mylinks_items', [
            'id' => $link->id,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }

    public function test_user_cannot_mutate_another_users_link(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $page = LinkPage::factory()->for($owner)->create();
        $link = LinkItem::factory()->for($page, 'page')->create();

        $this->actingAs($intruder)
            ->putJson(route('dashboard.links.update', $link), [
                'platform' => 'website',
                'title' => 'Hack',
                'url' => 'https://example.com/hack',
                'description' => 'Hack',
                'is_active' => true,
                'is_featured' => false,
            ])
            ->assertNotFound();
    }

    public function test_user_can_reorder_links(): void
    {
        $page = LinkPage::factory()->create();
        $first = LinkItem::factory()->for($page, 'page')->create(['sort_order' => 1, 'title' => 'Primeiro']);
        $second = LinkItem::factory()->for($page, 'page')->create(['sort_order' => 2, 'title' => 'Segundo']);

        $this->actingAs($page->user)
            ->postJson(route('dashboard.links.reorder'), [
                'links' => [$second->id, $first->id],
            ])
            ->assertOk()
            ->assertJsonPath('links.0.title', 'Segundo')
            ->assertJsonPath('links.1.title', 'Primeiro');

        $this->assertDatabaseHas('mylinks_items', ['id' => $first->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('mylinks_items', ['id' => $second->id, 'sort_order' => 1]);
    }

    public function test_user_can_filter_analytics_by_period(): void
    {
        $page = LinkPage::factory()->create();
        $whatsapp = LinkItem::factory()->for($page, 'page')->create([
            'icon' => 'WA',
            'sort_order' => 1,
        ]);
        $catalog = LinkItem::factory()->for($page, 'page')->create([
            'icon' => 'CT',
            'sort_order' => 2,
        ]);

        ClickEvent::create([
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => null,
            'channel' => 'page_view',
            'visitor_hash' => 'visitor-page-recent',
            'clicked_at' => now()->subDays(2),
        ]);

        ClickEvent::create([
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => $whatsapp->id,
            'channel' => 'web',
            'visitor_hash' => 'recent-1',
            'clicked_at' => now()->subDays(3),
        ]);

        ClickEvent::create([
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => $catalog->id,
            'channel' => 'web',
            'visitor_hash' => 'recent-2',
            'clicked_at' => now()->subDays(20),
        ]);

        ClickEvent::create([
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => null,
            'channel' => 'page_view',
            'visitor_hash' => 'visitor-page-older',
            'clicked_at' => now()->subDays(20),
        ]);

        $this->actingAs($page->user)
            ->getJson(route('dashboard.analytics', ['range' => '7d']))
            ->assertOk()
            ->assertJsonPath('analytics.range', '7d')
            ->assertJsonPath('analytics.visits', '1')
            ->assertJsonPath('analytics.linkViews', '2')
            ->assertJsonPath('analytics.clicks', '1')
            ->assertJsonPath('analytics.ctr', '50,0%')
            ->assertJsonPath('analytics.whatsapp', '1')
            ->assertJsonCount(1, 'analytics.topLinks');

        $this->actingAs($page->user)
            ->getJson(route('dashboard.analytics', ['range' => '30d']))
            ->assertOk()
            ->assertJsonPath('analytics.range', '30d')
            ->assertJsonPath('analytics.visits', '2')
            ->assertJsonPath('analytics.linkViews', '4')
            ->assertJsonPath('analytics.clicks', '2')
            ->assertJsonPath('analytics.ctr', '50,0%')
            ->assertJsonCount(2, 'analytics.topLinks');
    }

    public function test_user_can_upload_a_profile_image(): void
    {
        Storage::fake('public');

        $page = LinkPage::factory()->create();

        $this->actingAs($page->user)
            ->postJson(route('dashboard.page.profile-image'), [
                'profile_image' => UploadedFile::fake()->image('avatar.jpg', 512, 512),
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Imagem de perfil atualizada com sucesso.');

        $page->refresh();

        $this->assertNotNull($page->profile_image_path);
        Storage::disk('public')->assertExists($page->profile_image_path);
    }

    public function test_user_can_upload_a_background_image(): void
    {
        Storage::fake('public');

        $page = LinkPage::factory()->create([
            'background_type' => 'image',
            'background_value' => 'upload',
            'background_image_path' => null,
        ]);

        $this->actingAs($page->user)
            ->postJson(route('dashboard.page.background-image'), [
                'background_image' => UploadedFile::fake()->image('background.jpg', 1440, 1920),
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Plano de fundo atualizado com sucesso.')
            ->assertJsonPath('page.background_type', 'image')
            ->assertJsonPath('page.background_value', 'upload');

        $page->refresh();

        $this->assertNotNull($page->background_image_path);
        Storage::disk('public')->assertExists($page->background_image_path);
    }

    public function test_user_can_publish_without_active_links(): void
    {
        $page = LinkPage::factory()->create([
            'is_published' => false,
        ]);

        LinkItem::factory()->for($page, 'page')->create([
            'is_active' => false,
        ]);

        $this->actingAs($page->user)
            ->putJson(route('dashboard.page.update'), [
                'name' => $page->name,
                'slug' => $page->slug,
                'handle' => $page->handle,
                'headline' => $page->headline,
                'bio' => $page->bio,
                'location' => $page->location,
                'theme' => $page->theme,
                'background_type' => $page->background_type,
                'background_value' => $page->background_value,
                'button_style' => $page->button_style,
                'button_radius' => $page->button_radius,
                'button_color' => $page->button_color,
                'button_text_color' => $page->button_text_color,
                'whatsapp_number' => $page->whatsapp_number,
                'is_published' => true,
            ])
            ->assertOk()
            ->assertJsonPath('page.is_published', true);
    }
}
