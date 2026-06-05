<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PublicLinkRedirectController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\PublicSocialRedirectController;
use App\Http\Controllers\StripeBillingController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('landing');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('register.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'show'])->name('dashboard.show');
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics'])->name('dashboard.analytics');
    Route::get('/dashboard/onboarding/slug-availability', [DashboardController::class, 'slugAvailability'])->name('dashboard.onboarding.slug-availability');
    Route::put('/dashboard/onboarding/sync', [DashboardController::class, 'syncOnboarding'])->name('dashboard.onboarding.sync');
    Route::post('/dashboard/onboarding/complete', [DashboardController::class, 'completeOnboarding'])->name('dashboard.onboarding.complete');
    Route::put('/dashboard/page', [DashboardController::class, 'updatePage'])->name('dashboard.page.update');
    Route::post('/dashboard/page/profile-image', [DashboardController::class, 'uploadProfileImage'])->name('dashboard.page.profile-image');
    Route::post('/dashboard/page/background-image', [DashboardController::class, 'uploadBackgroundImage'])->name('dashboard.page.background-image');
    Route::post('/dashboard/billing/subscription-intent', [StripeBillingController::class, 'createSubscriptionIntent'])->name('dashboard.billing.subscription-intent');
    Route::post('/dashboard/links', [DashboardController::class, 'storeLink'])->name('dashboard.links.store');
    Route::post('/dashboard/links/reorder', [DashboardController::class, 'reorderLinks'])->name('dashboard.links.reorder');
    Route::put('/dashboard/links/{link}', [DashboardController::class, 'updateLink'])->name('dashboard.links.update');
    Route::delete('/dashboard/links/{link}', [DashboardController::class, 'destroyLink'])->name('dashboard.links.destroy');
    Route::post('/dashboard/publish', [DashboardController::class, 'publish'])->name('dashboard.publish');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::get('/go/{link}', PublicLinkRedirectController::class)->name('links.redirect');
Route::get('/social/{page}/{network}', PublicSocialRedirectController::class)->name('social.redirect');
Route::get('/page-images/{page}', [DashboardController::class, 'showProfileImage'])->name('pages.image.show');
Route::get('/page-backgrounds/{page}', [DashboardController::class, 'showBackgroundImage'])->name('pages.background.show');
Route::post('/stripe/webhook', StripeWebhookController::class)
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('stripe.webhook');
Route::get('/{slug}', [PublicPageController::class, 'show'])->name('pages.show');
