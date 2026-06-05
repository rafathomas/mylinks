<?php

namespace Tests\Unit;

use App\Models\ClickEvent;
use App\Models\LinkItem;
use App\Models\LinkPage;
use Tests\TestCase;

class LinkModelsTest extends TestCase
{
    public function test_link_page_casts_published_flag_to_boolean(): void
    {
        $page = new LinkPage([
            'is_published' => 1,
        ]);

        $this->assertTrue($page->is_published);
    }

    public function test_link_item_casts_active_and_featured_flags_to_boolean(): void
    {
        $item = new LinkItem([
            'is_active' => 1,
            'is_featured' => 0,
        ]);

        $this->assertTrue($item->is_active);
        $this->assertFalse($item->is_featured);
    }

    public function test_click_event_casts_clicked_at_to_datetime(): void
    {
        $event = new ClickEvent([
            'clicked_at' => '2026-06-03 12:00:00',
        ]);

        $this->assertSame('2026-06-03 12:00:00', $event->clicked_at->format('Y-m-d H:i:s'));
    }
}
