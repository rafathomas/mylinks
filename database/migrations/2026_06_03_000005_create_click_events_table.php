<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mylinks_click_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mylinks_page_id')->constrained('mylinks_pages')->cascadeOnDelete();
            $table->foreignId('mylinks_item_id')->nullable()->constrained('mylinks_items')->nullOnDelete();
            $table->string('channel', 32)->default('direct');
            $table->char('country_code', 2)->nullable();
            $table->string('city')->nullable();
            $table->string('referrer')->nullable();
            $table->string('visitor_hash', 64)->nullable()->index();
            $table->timestamp('clicked_at')->useCurrent()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mylinks_click_events');
    }
};
