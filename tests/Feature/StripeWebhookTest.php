<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscription_updated_webhook_marks_user_as_pro(): void
    {
        $user = User::factory()->create([
            'email' => 'cafe@example.com',
            'current_plan' => 'free',
        ]);

        $payload = [
            'type' => 'customer.subscription.updated',
            'data' => [
                'object' => [
                    'id' => 'sub_test_123',
                    'customer' => 'cus_test_123',
                    'status' => 'active',
                    'current_period_end' => 1782000000,
                    'items' => [
                        'data' => [
                            [
                                'price' => [
                                    'id' => 'price_1Tf3bcJHD9uVVbK8jA10w0Aa',
                                ],
                            ],
                        ],
                    ],
                    'metadata' => [
                        'customer_email' => 'cafe@example.com',
                    ],
                ],
            ],
        ];

        $this->postJson(route('stripe.webhook'), $payload)
            ->assertOk();

        $user->refresh();

        $this->assertSame('pro', $user->current_plan);
        $this->assertSame('cus_test_123', $user->stripe_customer_id);
        $this->assertSame('sub_test_123', $user->stripe_subscription_id);
        $this->assertSame('active', $user->subscription_status);
    }
}
