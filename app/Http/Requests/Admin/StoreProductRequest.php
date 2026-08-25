<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Normalize checkbox fields that are omitted entirely when unchecked.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_featured' => $this->boolean('is_featured'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:products,slug'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'description' => ['nullable', 'string'],
            'original_price' => ['required', 'integer', 'min:0'],
            'purchase_price' => ['nullable', 'integer', 'min:0'],
            'discount_price' => ['nullable', 'integer', 'min:0', 'lt:original_price'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_featured' => ['boolean'],
            'release_date' => ['nullable', 'date'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:4096'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.size' => ['required', 'string', 'max:10'],
            'variants.*.stock_quantity' => ['required', 'integer', 'min:0'],
        ];
    }
}
