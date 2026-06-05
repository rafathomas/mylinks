<?php

namespace App\Http\Controllers;

use App\Models\ClickEvent;
use App\Models\LinkPage;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PublicPageController extends Controller
{
    public function show(Request $request, string $slug): View
    {
        $page = LinkPage::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with(['links' => fn($query) => $query->where('is_active', true)->orderBy('sort_order')])
            ->firstOrFail();

        ClickEvent::create([
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => null,
            'channel' => 'page_view',
            'country_code' => substr((string) $request->server('HTTP_CF_IPCOUNTRY'), 0, 2) ?: null,
            'city' => null,
            'referrer' => $request->headers->get('referer'),
            'visitor_hash' => hash('sha256', implode('|', [
                $request->ip(),
                $request->userAgent(),
                $page->id,
            ])),
        ]);

        return view('public-page', [
            'page' => $page,
            'clicks' => $page->clickEvents()->where('channel', '!=', 'page_view')->count(),
        ]);
    }
}
