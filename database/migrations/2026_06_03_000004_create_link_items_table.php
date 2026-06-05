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
        Schema::create('mylinks_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mylinks_page_id')->constrained('mylinks_pages')->cascadeOnDelete();
            $table->string('title');
            $table->string('url');
            $table->string('description')->nullable();
            $table->string('icon', 8)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mylinks_items');
    }
};
