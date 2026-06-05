<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->timestamp('onboarding_completed_at')->nullable()->after('social_links');
        });

        DB::table('mylinks_pages')->update([
            'onboarding_completed_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->dropColumn('onboarding_completed_at');
        });
    }
};
