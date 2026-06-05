<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature', '');
        $webhookSecret = (string) Config::get('services.stripe.webhook_secret', '');

        if ($webhookSecret !== '' && ! $this->hasValidSignature($payload, $signature, $webhookSecret)) {
            abort(400, 'Assinatura Stripe inválida.');
        }

        $event = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        $type = $event['type'] ?? '';
        $object = $event['data']['object'] ?? [];

        match ($type) {
            'checkout.session.completed' => $this->handleCheckoutSessionCompleted($object),
            'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted' => $this->syncSubscription($object),
            default => null,
        };

        return response('ok', 200);
    }

    private function handleCheckoutSessionCompleted(array $session): void
    {
        if (($session['mode'] ?? null) !== 'subscription') {
            return;
        }

        $subscriptionId = $session['subscription'] ?? null;

        if (! is_string($subscriptionId) || $subscriptionId === '') {
            return;
        }

        $email = $session['customer_details']['email'] ?? $session['customer_email'] ?? null;
        $customerId = $session['customer'] ?? null;

        $user = $this->findUser($customerId, $email);

        if (! $user) {
            Log::warning('Stripe checkout completed without matching user.', [
                'subscription' => $subscriptionId,
                'customer' => $customerId,
                'email' => $email,
            ]);

            return;
        }

        $user->forceFill([
            'stripe_customer_id' => is_string($customerId) ? $customerId : $user->stripe_customer_id,
            'stripe_subscription_id' => $subscriptionId,
        ])->save();
    }

    private function syncSubscription(array $subscription): void
    {
        $customerId = $subscription['customer'] ?? null;
        $subscriptionId = $subscription['id'] ?? null;
        $status = $subscription['status'] ?? null;
        $priceId = $subscription['items']['data'][0]['price']['id'] ?? null;
        $email = $subscription['metadata']['customer_email'] ?? null;
        $currentPeriodEnd = $subscription['current_period_end'] ?? null;

        $user = $this->findUser($customerId, $email, $subscriptionId);

        if (! $user) {
            Log::warning('Stripe subscription webhook without matching user.', [
                'subscription' => $subscriptionId,
                'customer' => $customerId,
            ]);

            return;
        }

        $isPro = in_array($status, ['active', 'trialing', 'past_due', 'unpaid'], true);

        $user->forceFill([
            'current_plan' => $isPro ? 'pro' : 'free',
            'stripe_customer_id' => is_string($customerId) ? $customerId : $user->stripe_customer_id,
            'stripe_subscription_id' => is_string($subscriptionId) ? $subscriptionId : $user->stripe_subscription_id,
            'stripe_price_id' => is_string($priceId) ? $priceId : null,
            'subscription_status' => is_string($status) ? $status : null,
            'subscription_current_period_ends_at' => is_numeric($currentPeriodEnd) ? Carbon::createFromTimestamp((int) $currentPeriodEnd) : null,
        ])->save();
    }

    private function findUser(mixed $customerId, mixed $email = null, mixed $subscriptionId = null): ?User
    {
        if (is_string($subscriptionId) && $subscriptionId !== '') {
            $user = User::where('stripe_subscription_id', $subscriptionId)->first();

            if ($user) {
                return $user;
            }
        }

        if (is_string($customerId) && $customerId !== '') {
            $user = User::where('stripe_customer_id', $customerId)->first();

            if ($user) {
                return $user;
            }
        }

        if (is_string($email) && $email !== '') {
            return User::where('email', $email)->first();
        }

        return null;
    }

    private function hasValidSignature(string $payload, string $signatureHeader, string $secret): bool
    {
        $parts = collect(explode(',', $signatureHeader))
            ->mapWithKeys(function (string $part): array {
                [$key, $value] = array_pad(explode('=', trim($part), 2), 2, null);

                return [$key => $value];
            });

        $timestamp = $parts->get('t');
        $signature = $parts->get('v1');

        if (! is_string($timestamp) || ! is_string($signature)) {
            return false;
        }

        $expected = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);

        return hash_equals($expected, $signature);
    }
}
