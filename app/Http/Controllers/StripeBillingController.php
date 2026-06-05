<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class StripeBillingController extends Controller
{
    public function createSubscriptionIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'billing_cycle' => ['required', 'in:monthly,annual'],
        ]);

        $secretKey = (string) Config::get('services.stripe.secret_key', '');
        $publishableKey = (string) Config::get('services.stripe.publishable_key', '');
        $priceId = (string) Config::get("services.stripe.prices.{$validated['billing_cycle']}", '');

        if ($secretKey === '' || $publishableKey === '' || $priceId === '') {
            return response()->json([
                'message' => 'Configure as chaves e os preços do Stripe para habilitar o pagamento embutido.',
            ], 422);
        }

        $user = $request->user();

        if ($user->hasProPlan() && in_array($user->subscription_status, ['active', 'trialing'], true)) {
            return response()->json([
                'message' => 'Seu plano Pro já está ativo.',
            ], 422);
        }

        $customerId = $user->stripe_customer_id ?: $this->createCustomer($secretKey, $user->name, $user->email, $user->id);

        $subscription = $this->createSubscription(
            secretKey: $secretKey,
            customerId: $customerId,
            priceId: $priceId,
            userId: $user->id,
            email: $user->email,
        );

        $clientSecret = data_get($subscription, 'latest_invoice.confirmation_secret.client_secret');

        if (! is_string($clientSecret) || $clientSecret === '') {
            return response()->json([
                'message' => 'Não foi possível iniciar o pagamento com Stripe.',
            ], 422);
        }

        $user->forceFill([
            'stripe_customer_id' => $customerId,
            'stripe_subscription_id' => data_get($subscription, 'id'),
            'stripe_price_id' => $priceId,
            'subscription_status' => data_get($subscription, 'status'),
        ])->save();

        return response()->json([
            'client_secret' => $clientSecret,
            'publishable_key' => $publishableKey,
            'subscription_id' => data_get($subscription, 'id'),
        ]);
    }

    private function createCustomer(string $secretKey, string $name, string $email, int $userId): string
    {
        $response = Http::withBasicAuth($secretKey, '')
            ->asForm()
            ->post('https://api.stripe.com/v1/customers', [
                'name' => $name,
                'email' => $email,
                'metadata[user_id]' => (string) $userId,
            ])
            ->throw()
            ->json();

        return (string) data_get($response, 'id');
    }

    private function createSubscription(string $secretKey, string $customerId, string $priceId, int $userId, string $email): array
    {
        return Http::withBasicAuth($secretKey, '')
            ->asForm()
            ->post('https://api.stripe.com/v1/subscriptions', [
                'customer' => $customerId,
                'items[0][price]' => $priceId,
                'payment_behavior' => 'default_incomplete',
                'payment_settings[save_default_payment_method]' => 'on_subscription',
                'payment_settings[payment_method_types][0]' => 'card',
                'expand[0]' => 'latest_invoice.confirmation_secret',
                'metadata[user_id]' => (string) $userId,
                'metadata[customer_email]' => $email,
                'metadata[request_key]' => (string) Str::uuid(),
            ])
            ->throw()
            ->json();
    }
}
