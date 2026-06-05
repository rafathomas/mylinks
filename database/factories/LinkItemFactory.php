<?php

namespace Database\Factories;

use App\Models\LinkItem;
use App\Models\LinkPage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LinkItem>
 */
class LinkItemFactory extends Factory
{
    protected $model = LinkItem::class;

    public function definition(): array
    {
        return [
            'mylinks_page_id' => LinkPage::factory(),
            'title' => fake()->words(2, true),
            'url' => fake()->url(),
            'description' => fake()->sentence(),
            'icon' => strtoupper(fake()->lexify('??')),
            'sort_order' => fake()->numberBetween(1, 6),
            'is_active' => true,
            'is_featured' => false,
        ];
    }
}
