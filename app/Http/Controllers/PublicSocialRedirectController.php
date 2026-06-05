<?php

namespace App\Http\Controllers;

use App\Models\ClickEvent;
use App\Models\LinkPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PublicSocialRedirectController extends Controller
{
    public function __invoke(Request $request, LinkPage $page, string $network): RedirectResponse
    {
        abort_unless($page->is_published, 404);

        $allowedNetworks = ['instagram', 'pinterest', 'email'];
        abort_unless(in_array($network, $allowedNetworks, true), 404);

        $url = data_get($page->social_links, $network);
        abort_unless($url, 404);

        ClickEvent::create([
            'mylinks_page_id' => $page->id,
            'mylinks_item_id' => null,
            'channel' => 'social_' . $network,
            'country_code' => substr((string) $request->server('HTTP_CF_IPCOUNTRY'), 0, 2) ?: null,
            'city' => null,
            'referrer' => $request->headers->get('referer'),
            'visitor_hash' => hash('sha256', implode('|', [
                $request->ip(),
                $request->userAgent(),
                $page->id,
                $network,
            ])),
        ]);

        return redirect()->away($url);
    }
}
