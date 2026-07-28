<?php

namespace App\Http\Requests\Admin;

use App\Enums\ExchangeCondition;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreExchangeRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'order_item_id' => [
                'required',
                'integer',
                Rule::exists('order_items', 'id')->where('order_id', $this->route('order')?->id),
            ],
            'new_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'condition' => ['required', new Enum(ExchangeCondition::class)],
            'shipping_charge' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
