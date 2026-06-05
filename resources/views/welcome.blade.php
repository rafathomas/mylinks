@extends('layouts.guest')

@section('title', 'MyLinks | Link-in-bio brasileiro')
@section('description', 'MyLinks combina editor visual, analytics e WhatsApp nativo para empresas e creators no Brasil.')

@section('content')
    <main class="relative overflow-hidden">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(215,234,223,0.9),transparent_28%),radial-gradient(circle_at_right_15%,rgba(246,234,210,0.8),transparent_24%)]"></div>

        <div class="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
            <header class="flex items-center justify-between gap-6">
                <a class="flex items-center gap-4" href="{{ route('landing') }}">
                    <div class="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#1f7a59_0%,#2a8d69_100%)] text-sm font-extrabold tracking-[0.04em] text-white shadow-[0_14px_30px_rgba(31,122,89,0.22)]">
                        LH
                    </div>
                    <div>
                        <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-stone-500">MyLinks
                            edition</p>
                        <strong class="mt-1 block font-serif text-2xl">MyLinks</strong>
                    </div>
                </a>

                <nav class="flex items-center gap-3">
                    <a class="rounded-full border border-black/8 bg-white/75 px-5 py-3 text-sm font-bold text-stone-900 transition hover:-translate-y-0.5"
                       href="{{ route('login') }}">
                        Entrar
                    </a>
                    <a class="rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(31,122,89,0.22)] transition hover:-translate-y-0.5"
                       href="{{ route('register') }}">
                        Criar conta
                    </a>
                </nav>
            </header>

            <section class="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_480px]">
                <div>
                    <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-700">Posicionamento
                        Brasil-first</p>
                    <h1 class="mt-4 max-w-4xl font-serif text-5xl leading-none tracking-tight lg:text-7xl">
                        Link-in-bio rápido, profissional e pronto para vender.
                    </h1>
                    <p class="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
                        MyLinks junta editor visual, QR code, analytics e WhatsApp nativo em uma experiência feita para
                        criadores, negócios locais e equipes no Brasil.
                    </p>

                    <div class="mt-8 flex flex-col gap-4 sm:flex-row">
                        <a class="rounded-full bg-emerald-700 px-6 py-4 text-center text-sm font-bold text-white shadow-[0_12px_28px_rgba(31,122,89,0.22)] transition hover:-translate-y-0.5"
                           href="{{ route('register') }}">
                            Começar agora
                        </a>
                        <a class="rounded-full border border-black/8 bg-white/75 px-6 py-4 text-center text-sm font-bold text-stone-900 transition hover:-translate-y-0.5"
                           href="#diferenciais">
                            Ver diferenciais
                        </a>
                    </div>

                    <div id="diferenciais" class="mt-10 grid gap-4 sm:grid-cols-3">
                        @foreach ([
                            ['titulo' => 'WhatsApp nativo', 'texto' => 'Canal principal tratado como conversão, não como improviso.'],
                            ['titulo' => 'Analytics livres', 'texto' => 'Leitura rápida de cliques, CTR e links em destaque.'],
                            ['titulo' => 'Performance MyLinks', 'texto' => 'Visual premium, leve e confiável para businesses e creators.'],
                        ] as $item)
                            <article class="rounded-[1.75rem] border border-black/8 bg-white/70 p-5 shadow-[0_20px_60px_rgba(25,36,31,0.08)] backdrop-blur-xl">
                                <h2 class="font-serif text-2xl">{{ $item['titulo'] }}</h2>
                                <p class="mt-3 text-sm leading-6 text-stone-600">{{ $item['texto'] }}</p>
                            </article>
                        @endforeach
                    </div>
                </div>

                <div class="rounded-4xl border border-black/8 bg-white/70 p-6 shadow-[0_28px_80px_rgba(25,36,31,0.11)] backdrop-blur-2xl">
                    <div class="rounded-4xl border border-black/8 bg-[linear-gradient(180deg,#fcf8ef_0%,#eef5f1_100%)] p-5">
                        <div class="mb-5 flex items-center gap-3">
                            <div class="grid h-14 w-14 place-items-center rounded-3xl bg-emerald-700 text-xl font-extrabold text-white shadow-[0_16px_30px_rgba(31,122,89,0.24)]">
                                C
                            </div>
                            <div>
                                <h2 class="text-xl font-extrabold">Cafe Botanico</h2>
                                <p class="text-sm text-stone-500">@cafebotanico.aracatuba</p>
                            </div>
                        </div>
                        <p class="text-sm text-stone-500">Aracatuba, SP</p>
                        <p class="mt-2 text-sm leading-6 text-stone-600">Brunch, café especial e atendimento humano em
                            um link único.</p>

                        <div class="mt-5 grid gap-3">
                            @foreach ([
                                ['titulo' => 'Pedir no WhatsApp', 'texto' => 'Atendimento rápido com resposta em minutos', 'destaque' => true],
                                ['titulo' => 'Cardápio da Semana', 'texto' => 'Ofertas e combos da casa', 'destaque' => false],
                                ['titulo' => 'Google Maps', 'texto' => 'Encontre a unidade mais próxima', 'destaque' => false],
                            ] as $item)
                                <div class="{{ $item['destaque'] ? 'bg-emerald-700 text-white' : 'bg-white/80 text-stone-900' }} flex items-center justify-between rounded-3xl border border-black/6 p-4">
                                    <div>
                                        <strong class="block text-sm">{{ $item['titulo'] }}</strong>
                                        <small class="mt-1 block text-xs {{ $item['destaque'] ? 'text-white/75' : 'text-stone-500' }}">{{ $item['texto'] }}</small>
                                    </div>
                                    <span class="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 text-[11px] font-extrabold">GO</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
@endsection
