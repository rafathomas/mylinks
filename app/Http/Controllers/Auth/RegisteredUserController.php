<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LinkPage;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    public function create(): View
    {
        return view('auth.register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create($validated);

        $this->createDefaultPage($user);

        Auth::login($user);

        return redirect()->route('dashboard.show');
    }

    private function createDefaultPage(User $user): void
    {
        $slug = $this->makeUniquePageSlug(Str::before($user->email, '@'));

        $user->linkPages()->create([
            'name' => $user->name,
            'slug' => $slug,
            'handle' => '@'.Str::slug(Str::before($user->email, '@'), ''),
            'headline' => 'Seu link-in-bio profissional pronto para vender',
            'bio' => 'Centralize seus links, WhatsApp e ofertas em uma página clara e rápida.',
            'location' => 'Brasil',
            'theme' => 'mylinks',
            'background_type' => 'image',
            'background_value' => 'upload',
            'background_image_path' => null,
            'button_style' => 'solid',
            'button_radius' => 'rounded',
            'button_color' => '#FFFFFF',
            'button_text_color' => '#111827',
            'social_links' => [
                'instagram' => null,
                'pinterest' => null,
                'email' => 'mailto:'.$user->email,
            ],
            'onboarding_completed_at' => null,
            'is_published' => false,
        ]);
    }

    private function makeUniquePageSlug(string $seed): string
    {
        $baseSlug = (string) Str::of(Str::lower($seed))
            ->replaceMatches('/[^a-z0-9._-]+/', '-')
            ->replaceMatches('/[-_.]{2,}/', '-')
            ->trim('-_.');
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'mylinks';
        $slug = $baseSlug;
        $counter = 1;

        while (LinkPage::where('slug', $slug)->exists()) {
            $counter++;
            $slug = "{$baseSlug}-{$counter}";
        }

        return $slug;
    }
}
