<?php

namespace Database\Factories;

use App\Models\LinkPage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LinkPage>
 */
class LinkPageFactory extends Factory
{
    protected $model = LinkPage::class;

    public function definition(): array
    {
        $name = fake()->company();
        $backgroundType = fake()->randomElement(['image', 'color']);

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'handle' => '@'.fake()->lexify('????????'),
            'headline' => fake()->sentence(),
            'bio' => fake()->paragraph(),
            'location' => fake()->city().', '.fake()->stateAbbr(),
            'theme' => fake()->randomElement(['mylinks', 'graphite', 'sand']),
            'background_type' => $backgroundType,
            'background_value' => $backgroundType === 'color'
                ? fake()->randomElement(['#456B5B', '#7C5A43', '#334155'])
                : 'upload',
            'background_image_path' => null,
            'button_style' => fake()->randomElement(['solid', 'glass', 'outline']),
            'button_radius' => fake()->randomElement(['square', 'soft', 'rounded', 'pill']),
            'button_color' => fake()->randomElement(['#FFFFFF', '#E7F0EA', '#F5E7D0']),
            'button_text_color' => fake()->randomElement(['#111827', '#0F5C3F', '#5B3A29']),
            'social_links' => [
                'instagram' => 'https://instagram.com/'.fake()->userName(),
                'pinterest' => 'https://pinterest.com/'.fake()->userName(),
                'email' => 'mailto:'.fake()->safeEmail(),
            ],
            'onboarding_completed_at' => now(),
            'is_published' => true,
        ];
    }
}
