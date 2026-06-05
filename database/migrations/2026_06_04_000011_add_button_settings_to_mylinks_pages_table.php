<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->string('button_style', 16)->default('solid')->after('background_image_path');
            $table->string('button_radius', 16)->default('rounded')->after('button_style');
            $table->string('button_color', 16)->default('#FFFFFF')->after('button_radius');
            $table->string('button_text_color', 16)->default('#111827')->after('button_color');
        });
    }

    public function down(): void
    {
        Schema::table('mylinks_pages', function (Blueprint $table) {
            $table->dropColumn([
                'button_style',
                'button_radius',
                'button_color',
                'button_text_color',
            ]);
        });
    }
};
