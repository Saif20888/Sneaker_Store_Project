<?php

namespace App\Http\Requests\Admin;

use App\Enums\DeliveryZone;
use App\Enums\OrderSource;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreManualOrderRequest extends FormRequest
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
            'source' => ['required', new Enum(OrderSource::class)],
            'payment_method' => ['required', Rule::in(['cod', 'bkash', 'nagad'])],
            'payment_transaction_id' => ['required_unless:payment_method,cod', 'nullable', 'string', 'max:255'],
            'payment_status' => ['nullable', Rule::in(['pending', 'paid'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
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
            'payment_transaction_id.required_unless' => 'Enter the transaction ID from the bKash/Nagad payment.',
        ];
    }
}
