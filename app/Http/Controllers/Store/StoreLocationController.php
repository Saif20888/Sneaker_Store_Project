<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StoreLocationController extends Controller
{
    /**
     * Display the about us and contact page.
     */
    public function index(): Response
    {
        return Inertia::render('stores', [
            'locations' => [
                [
                    'name' => 'Vint-Edge',
                    'address' => 'Dhaka, Bangladesh — online store, nationwide delivery',
                    'phone' => '+880 1601-638822',
                    'hours' => 'Order anytime — we reply within the day',
                ],
            ],
        ]);
    }
}
