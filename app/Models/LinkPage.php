<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LinkPage extends Model
{
    use HasFactory;

    protected $table = 'mylinks_pages';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'handle',
        'headline',
        'bio',
        'location',
        'theme',
        'selected_theme_id',
        'background_type',
        'background_value',
        'background_image_path',
        'button_style',
        'button_radius',
        'button_color',
        'button_text_color',
        'whatsapp_number',
        'profile_image_path',
        'social_links',
        'onboarding_completed_at',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'social_links' => 'array',
            'onboarding_completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(LinkItem::class, 'mylinks_page_id')->orderBy('sort_order');
    }

    public function clickEvents(): HasMany
    {
        return $this->hasMany(ClickEvent::class, 'mylinks_page_id');
    }
}
