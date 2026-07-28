<?php

namespace App\Http\Requests\Store;

use App\Enums\DeliveryZone;
use App\Enums\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'regex:/^01[3-9][0-9]{8}$/'],
            'city' => ['required', 'string', 'max:255'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'zone' => ['required', new Enum(DeliveryZone::class)],
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'payment_transaction_id' => ['required_unless:payment_method,cod,sslcommerz', 'nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone_number.regex' => 'Enter a valid Bangladeshi mobile number (e.g. 01712345678).',
            'payment_transaction_id.required_unless' => 'Enter the transaction ID from your bKash/Nagad payment.',
        ];
    }
}
