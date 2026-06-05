<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingAndAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_is_visible_for_guests(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Link-in-bio rápido, profissional e pronto para vender.')
            ->assertSee(route('login'), false)
            ->assertSee(route('register'), false);
    }

    public function test_login_and_register_pages_are_visible_for_guests(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertSee('Entrar no MyLinks');

        $this->get(route('register'))
            ->assertOk()
            ->assertSee('Criar sua conta');
    }

    public function test_guest_is_redirected_from_dashboard_to_login(): void
    {
        $this->get(route('dashboard.show'))
            ->assertRedirect(route('login'));
    }

    public function test_user_can_register_and_receive_a_default_page(): void
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Cafe Botanico',
            'email' => 'cafe@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('dashboard.show'));
        $this->assertAuthenticated();

        $user = User::where('email', 'cafe@example.com')->firstOrFail();

        $this->assertDatabaseHas('mylinks_pages', [
            'user_id' => $user->id,
            'name' => 'Cafe Botanico',
            'background_type' => 'image',
            'background_value' => 'upload',
            'is_published' => false,
        ]);

        $this->assertSame('cafe', $user->linkPages()->firstOrFail()->slug);
        $this->assertCount(0, $user->linkPages()->firstOrFail()->links);
    }

    public function test_user_cannot_register_with_an_existing_email(): void
    {
        User::factory()->create([
            'email' => 'cafe@example.com',
        ]);

        $this->from(route('register'))
            ->post(route('register.store'), [
                'name' => 'Outro Cafe',
                'email' => 'cafe@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertRedirect(route('register'))
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('users', 1);
    }

    public function test_user_can_log_in_and_log_out(): void
    {
        $user = User::factory()->create([
            'email' => 'owner@example.com',
            'password' => 'password',
        ]);

        $this->post(route('login.store'), [
            'email' => 'owner@example.com',
            'password' => 'password',
        ])->assertRedirect(route('dashboard.show'));

        $this->assertAuthenticatedAs($user);

        $this->post(route('logout'))
            ->assertRedirect(route('landing'));

        $this->assertGuest();
    }

    public function test_invalid_login_returns_validation_error(): void
    {
        User::factory()->create([
            'email' => 'owner@example.com',
            'password' => 'password',
        ]);

        $this->from(route('login'))
            ->post(route('login.store'), [
                'email' => 'owner@example.com',
                'password' => 'wrong-password',
            ])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
    }
}
