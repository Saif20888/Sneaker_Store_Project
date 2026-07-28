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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('phone_number');
            $table->string('city');
            $table->text('shipping_address');
            $table->string('zone');
            $table->unsignedInteger('delivery_fee');
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('total_amount');
            $table->string('payment_method');
            $table->string('payment_transaction_id')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
