<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display the Contact Us page.
     */
    public function index(): Response
    {
        return Inertia::render('info/contact', [
            'whatsapp' => '8801601638822',
            'phone' => '+8801601638822',
            'email' => 'info@vintedge.shop',
            'address' => 'Dhaka, Bangladesh',
        ]);
    }
}
