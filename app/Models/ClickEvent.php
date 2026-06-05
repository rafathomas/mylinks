<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClickEvent extends Model
{
    use HasFactory;

    protected $table = 'mylinks_click_events';

    protected $fillable = [
        'mylinks_page_id',
        'mylinks_item_id',
        'channel',
        'country_code',
        'city',
        'referrer',
        'visitor_hash',
        'clicked_at',
    ];

    protected function casts(): array
    {
        return [
            'clicked_at' => 'datetime',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(LinkPage::class, 'mylinks_page_id');
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(LinkItem::class, 'mylinks_item_id');
    }
}
