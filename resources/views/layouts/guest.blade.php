<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>@yield('title', 'MyLinks')</title>
        <meta name="description" content="@yield('description', 'MyLinks para creators e negócios brasileiros.')">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
        >
        @vite(['resources/css/app.css'])
    </head>
    <body class="min-h-screen bg-[linear-gradient(180deg,#f7f4ed_0%,#f1ede2_100%)] font-sans text-stone-900">
        @yield('content')
    </body>
</html>
