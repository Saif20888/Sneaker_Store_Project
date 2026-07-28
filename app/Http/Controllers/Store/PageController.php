<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Display the About Us page.
     */
    public function about(): Response
    {
        return Inertia::render('info/static-page', [
            'title' => 'About Us',
            'intro' => 'Vint-Edge is Bangladesh\'s home for curated, authentic sneakers — real prices, no inflated markups, and Cash on Delivery nationwide.',
            'sections' => [
                [
                    'heading' => 'Who We Are',
                    'body' => "Vint-Edge started with a simple frustration: sneaker prices in Bangladesh rarely matched what a pair was actually worth. We set out to build a shop that sources authentic sneakers — Nike, Adidas, New Balance, Puma, and our own Vint-Edge line — and prices them honestly, every single time.",
                ],
                [
                    'heading' => 'What We Stand For',
                    'body' => 'Every sneaker listed is checked for authenticity before it reaches our catalog. We publish real photos, accurate sizing, and stock counts so you know exactly what you\'re getting before you order.',
                ],
                [
                    'heading' => 'How We Deliver',
                    'body' => 'We ship nationwide from Dhaka, with Cash on Delivery available so you can pay when your kicks arrive. bKash and Nagad payments are accepted at checkout for customers who prefer to pay upfront.',
                ],
                [
                    'heading' => 'Get In Touch',
                    'body' => 'Have a question about an order, sizing, or a specific pair you\'re hunting for? Reach us on WhatsApp or email at info@vintedge.shop — we\'re happy to help.',
                ],
            ],
        ]);
    }

    /**
     * Display the Refund Policy page.
     */
    public function refundPolicy(): Response
    {
        return Inertia::render('info/static-page', [
            'title' => 'Refund Policy',
            'sections' => [
                [
                    'heading' => 'Eligibility',
                    'body' => 'Refunds are issued when an item arrives damaged, defective, or materially different from what was ordered (wrong size, wrong pair, or missing accessories). Contact us within 3 days of delivery with photos of the item and packaging.',
                ],
                [
                    'heading' => 'Refund Method',
                    'body' => 'Approved refunds are issued to the original payment method (bKash or Nagad) within 5–7 business days. For Cash on Delivery orders, refunds are sent via bKash/Nagad to the number you provide.',
                ],
                [
                    'heading' => 'Non-Refundable Cases',
                    'body' => 'We cannot refund items returned without prior approval, worn or washed items, or claims raised after the 3-day window from delivery.',
                ],
            ],
        ]);
    }

    /**
     * Display the Return Policy page.
     */
    public function returnPolicy(): Response
    {
        return Inertia::render('info/static-page', [
            'title' => 'Return Policy',
            'sections' => [
                [
                    'heading' => 'Return Window',
                    'body' => 'You may request a return within 3 days of delivery if the sneakers are unworn, in original packaging, and accompanied by all original tags and accessories.',
                ],
                [
                    'heading' => 'How to Start a Return',
                    'body' => 'Message us on WhatsApp or raise a Support Ticket with your order number and reason for return. We\'ll confirm eligibility and arrange pickup or drop-off.',
                ],
                [
                    'heading' => 'Return Shipping',
                    'body' => 'Returns due to our error (wrong item, damaged in transit) are picked up at no cost. Returns for size or preference changes may carry a courier fee, deducted from the refund.',
                ],
            ],
        ]);
    }

    /**
     * Display the Cancellation Policy page.
     */
    public function cancellationPolicy(): Response
    {
        return Inertia::render('info/static-page', [
            'title' => 'Cancellation Policy',
            'sections' => [
                [
                    'heading' => 'Before Dispatch',
                    'body' => 'Orders can be cancelled free of charge any time before they\'re dispatched. Message us on WhatsApp or via Support Ticket with your order number as soon as possible.',
                ],
                [
                    'heading' => 'After Dispatch',
                    'body' => 'Once an order has shipped it can no longer be cancelled, but you may refuse delivery or request a return once it arrives, subject to our Return Policy.',
                ],
                [
                    'heading' => 'Prepaid Orders',
                    'body' => 'Cancellations on orders paid via bKash or Nagad are refunded in full to the original number within 5–7 business days.',
                ],
            ],
        ]);
    }

    /**
     * Display the Terms & Conditions page.
     */
    public function terms(): Response
    {
        return Inertia::render('info/static-page', [
            'title' => 'Terms & Conditions',
            'sections' => [
                [
                    'heading' => 'Using Vint-Edge',
                    'body' => 'By placing an order with Vint-Edge you confirm the details you provide (name, address, phone number) are accurate. We reserve the right to cancel orders that appear fraudulent or cannot be verified.',
                ],
                [
                    'heading' => 'Pricing & Availability',
                    'body' => 'Prices are shown in BDT and may change without notice. Stock is limited to what\'s shown at checkout — occasionally an item may sell out before dispatch, in which case we\'ll offer a refund or swap.',
                ],
                [
                    'heading' => 'Payments',
                    'body' => 'We accept Cash on Delivery nationwide, plus bKash and Nagad. Payment instructions for mobile banking are shown at checkout.',
                ],
                [
                    'heading' => 'Intellectual Property',
                    'body' => 'All product photos, branding, and site content belong to Vint-Edge or its brand partners and may not be reused without permission.',
                ],
            ],
        ]);
    }

    /**
     * Display the Privacy Policy page.
     */
    public function privacy(): Response
    {
        return Inertia::render('info/static-page', [
            'title' => 'Privacy Policy',
            'sections' => [
                [
                    'heading' => 'Information We Collect',
                    'body' => 'We collect the information you provide at checkout — name, phone number, delivery address, and order details — plus your email if you subscribe to our newsletter.',
                ],
                [
                    'heading' => 'How We Use It',
                    'body' => 'Your information is used to process and deliver your order, respond to support requests, and — only if you\'ve subscribed — send updates about new arrivals and offers.',
                ],
                [
                    'heading' => 'Sharing',
                    'body' => 'We share order details with our delivery partners solely to fulfil shipping. We never sell your personal information to third parties.',
                ],
                [
                    'heading' => 'Your Choices',
                    'body' => 'You can unsubscribe from the newsletter at any time, and can request we delete your account data by contacting info@vintedge.shop.',
                ],
            ],
        ]);
    }
}
