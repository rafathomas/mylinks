<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->string('selected_theme_id')->nullable()->after('theme');
        });
    }

    public function down(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->dropColumn('selected_theme_id');
        });
    }
};
