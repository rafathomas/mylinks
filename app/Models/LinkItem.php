<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LinkItem extends Model
{
    use HasFactory;

    protected $table = 'mylinks_items';

    protected $fillable = [
        'mylinks_page_id',
        'title',
        'url',
        'description',
        'icon',
        'sort_order',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(LinkPage::class, 'mylinks_page_id');
    }

    public function linkPage(): BelongsTo
    {
        return $this->page();
    }

    public function clickEvents(): HasMany
    {
        return $this->hasMany(ClickEvent::class, 'mylinks_item_id');
    }
}
