<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->string('background_type', 16)->default('image')->after('theme');
            $table->string('background_value', 64)->default('olive-lounge')->after('background_type');
        });
    }

    public function down(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->dropColumn(['background_type', 'background_value']);
        });
    }
};
