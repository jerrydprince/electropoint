<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Observers\JournalObserver;
use App\Observers\JournalEntryLineObserver;

use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Administrator') ? true : null;
        });

        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
        
        // Enforce Financial Immutability
        JournalEntry::observe(JournalObserver::class);
        JournalEntryLine::observe(JournalEntryLineObserver::class);
    }
}
