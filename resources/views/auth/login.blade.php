@extends('layouts.guest')

@section('title', 'Entrar | MyLinks')

@section('content')
    <main class="grid min-h-screen place-items-center px-6 py-10">
        <section class="w-full max-w-md rounded-4xl border border-black/8 bg-white/75 p-8 shadow-[0_28px_80px_rgba(25,36,31,0.11)] backdrop-blur-2xl">
            <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-stone-500">Acesso MyLinks</p>
            <h1 class="mt-3 font-serif text-4xl">Entrar no MyLinks</h1>
            <p class="mt-3 text-sm leading-6 text-stone-600">Acesse seu painel para editar links, acompanhar cliques e publicar sua página.</p>

            <form action="{{ route('login.store') }}" class="mt-8 grid gap-4" method="POST">
                @csrf
                <label class="grid gap-2">
                    <span class="text-sm font-bold text-stone-600">E-mail</span>
                    <input class="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 shadow-sm outline-none transition focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/10" name="email" type="email" value="{{ old('email') }}">
                    @error('email') <span class="text-sm text-rose-700">{{ $message }}</span> @enderror
                </label>

                <label class="grid gap-2">
                    <span class="text-sm font-bold text-stone-600">Senha</span>
                    <input class="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 shadow-sm outline-none transition focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/10" name="password" type="password">
                    @error('password') <span class="text-sm text-rose-700">{{ $message }}</span> @enderror
                </label>

                <button class="mt-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(31,122,89,0.22)] transition hover:-translate-y-0.5" type="submit">
                    Entrar
                </button>
            </form>

            <p class="mt-6 text-sm text-stone-600">
                Ainda não tem conta?
                <a class="font-bold text-emerald-700" href="{{ route('register') }}">Criar agora</a>
            </p>
        </section>
    </main>
@endsection
