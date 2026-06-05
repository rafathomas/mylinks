<?php

namespace Tests\Feature;

use App\Models\LinkItem;
use App\Models\LinkPage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_page_shows_only_active_links_for_published_pages(): void
    {
        $page = LinkPage::factory()->create([
            'name' => 'Cafe Botanico',
            'slug' => 'cafe-botanico',
            'handle' => '@cafebotanico',
            'is_published' => true,
            'button_style' => 'outline',
            'button_radius' => 'pill',
            'button_color' => '#123456',
            'button_text_color' => '#F8FAFC',
            'social_links' => [
                'instagram' => 'https://instagram.com/cafebotanico',
                'email' => 'mailto:cafe@example.com',
            ],
        ]);

        LinkItem::factory()->for($page, 'page')->create([
            'title' => 'WhatsApp',
            'description' => 'Atendimento principal',
            'is_active' => true,
        ]);

        LinkItem::factory()->for($page, 'page')->create([
            'title' => 'Oculto',
            'is_active' => false,
        ]);

        $this->get(route('pages.show', $page->slug))
            ->assertOk()
            ->assertSee('Cafe Botanico')
            ->assertSee('WhatsApp')
            ->assertSee('Junte-se a @cafebotanico no MyLinks')
            ->assertSee(route('landing'), false)
            ->assertSee('border-radius: 999px;', false)
            ->assertSee('border: 2px solid #123456;', false)
            ->assertDontSee('Oculto');

        $this->assertDatabaseHas('mylinks_click_events', [
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => null,
            'channel' => 'page_view',
        ]);
    }

    public function test_unpublished_page_returns_not_found(): void
    {
        $page = LinkPage::factory()->create([
            'slug' => 'rascunho',
            'is_published' => false,
        ]);

        $this->get(route('pages.show', $page->slug))
            ->assertNotFound();
    }

    public function test_public_redirect_records_click_event_and_redirects_to_external_url(): void
    {
        $page = LinkPage::factory()->create(['is_published' => true]);
        $link = LinkItem::factory()->for($page, 'page')->create([
            'url' => 'https://example.com/catalogo',
        ]);

        $this->get(route('links.redirect', $link))
            ->assertRedirect('https://example.com/catalogo');

        $this->assertDatabaseHas('mylinks_click_events', [
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => $link->id,
            'channel' => 'web',
        ]);
    }

    public function test_public_page_uses_the_selected_theme_preset_surface(): void
    {
        $page = LinkPage::factory()->create([
            'slug' => 'retro-grid',
            'is_published' => true,
            'selected_theme_id' => 'retro-grid',
            'theme' => 'sand',
            'background_type' => 'color',
            'background_value' => '#5F4042',
            'bio' => 'Tema publicado deve refletir a previa.',
        ]);

        $this->get(route('pages.show', $page->slug))
            ->assertOk()
            ->assertSee('background-color: #5f4042; background-image: linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px); background-size: 22px 22px;', false)
            ->assertSee('text-[#f5e7ce]', false);
    }

    public function test_social_redirect_records_click_event_and_redirects_to_social_url(): void
    {
        $page = LinkPage::factory()->create([
            'is_published' => true,
            'social_links' => [
                'instagram' => 'https://instagram.com/cafebotanico',
            ],
        ]);

        $this->get(route('social.redirect', ['page' => $page, 'network' => 'instagram']))
            ->assertRedirect('https://instagram.com/cafebotanico');

        $this->assertDatabaseHas('mylinks_click_events', [
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => null,
            'channel' => 'social_instagram',
        ]);
    }
}
