<?php

namespace App\Http\Controllers;

use App\Models\ClickEvent;
use App\Models\LinkItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PublicLinkRedirectController extends Controller
{
    public function __invoke(Request $request, LinkItem $link): RedirectResponse
    {
        ClickEvent::create([
            'mylinks_page_id' => $link->mylinks_page_id,
            'mylinks_item_id' => $link->id,
            'channel' => 'web',
            'country_code' => substr((string)$request->server('HTTP_CF_IPCOUNTRY'), 0, 2) ?: null,
            'city' => null,
            'referrer' => $request->headers->get('referer'),
            'visitor_hash' => hash('sha256', implode('|', [
                $request->ip(),
                $request->userAgent(),
                $link->id,
            ])),
        ]);

        return redirect()->away($link->url);
    }
}
