<?php

namespace App\Models;

use Database\Factories\HomeBannerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $image
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['image', 'position'])]
class HomeBanner extends Model
{
    /** @use HasFactory<HomeBannerFactory> */
    use HasFactory;
}
