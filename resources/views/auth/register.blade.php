@extends('layouts.guest')

@section('title', 'Criar conta | MyLinks')

@section('content')
    <main class="grid min-h-screen place-items-center px-6 py-10">
        <section class="w-full max-w-md rounded-4xl border border-black/8 bg-white/75 p-8 shadow-[0_28px_80px_rgba(25,36,31,0.11)] backdrop-blur-2xl">
            <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-stone-500">Onboarding MyLinks</p>
            <h1 class="mt-3 font-serif text-4xl">Criar sua conta</h1>
            <p class="mt-3 text-sm leading-6 text-stone-600">Em poucos minutos você recebe um painel pronto para editar, publicar e acompanhar seus links.</p>

            <form action="{{ route('register.store') }}" class="mt-8 grid gap-4" method="POST">
                @csrf
                <label class="grid gap-2">
                    <span class="text-sm font-bold text-stone-600">Nome</span>
                    <input class="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 shadow-sm outline-none transition focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/10" name="name" type="text" value="{{ old('name') }}">
                    @error('name') <span class="text-sm text-rose-700">{{ $message }}</span> @enderror
                </label>

                <label class="grid gap-2">
                    <span class="text-sm font-bold text-stone-600">E-mail</span>
                    <input class="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 shadow-sm outline-none transition focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/10" name="email" type="email" value="{{ old('email') }}">
                    @error('email') <span class="text-sm text-rose-700">{{ $message }}</span> @enderror
                </label>

                <label class="grid gap-2">
                    <span class="text-sm font-bold text-stone-600">Senha</span>
                    <div class="relative">
                        <input class="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 pr-12 text-stone-900 shadow-sm outline-none transition focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/10" id="register-password" name="password" type="password">
                        <button
                            aria-controls="register-password"
                            aria-label="Mostrar senha"
                            class="absolute right-4 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:text-emerald-700 focus:text-emerald-700 focus:outline-none"
                            data-password-toggle
                            type="button"
                        >
                            <svg aria-hidden="true" class="h-5 w-5 toggle-show-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
                                <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <svg aria-hidden="true" class="hidden h-5 w-5 toggle-hide-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
                                <path d="M3 3l18 18" />
                                <path d="M10.6 10.7a3 3 0 0 0 4 4" />
                                <path d="M9.9 5.2A11 11 0 0 1 12 5c6.4 0 10 7 10 7a18.7 18.7 0 0 1-3.2 4.2" />
                                <path d="M6.6 6.7C3.8 8.5 2 12 2 12a18.4 18.4 0 0 0 5.5 5.8" />
                            </svg>
                        </button>
                    </div>
                    @error('password') <span class="text-sm text-rose-700">{{ $message }}</span> @enderror
                </label>

                <label class="grid gap-2">
                    <span class="text-sm font-bold text-stone-600">Confirmar senha</span>
                    <div class="relative">
                        <input class="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 pr-12 text-stone-900 shadow-sm outline-none transition focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/10" id="register-password-confirmation" name="password_confirmation" type="password">
                        <button
                            aria-controls="register-password-confirmation"
                            aria-label="Mostrar confirmação de senha"
                            class="absolute right-4 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:text-emerald-700 focus:text-emerald-700 focus:outline-none"
                            data-password-toggle
                            type="button"
                        >
                            <svg aria-hidden="true" class="h-5 w-5 toggle-show-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
                                <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <svg aria-hidden="true" class="hidden h-5 w-5 toggle-hide-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
                                <path d="M3 3l18 18" />
                                <path d="M10.6 10.7a3 3 0 0 0 4 4" />
                                <path d="M9.9 5.2A11 11 0 0 1 12 5c6.4 0 10 7 10 7a18.7 18.7 0 0 1-3.2 4.2" />
                                <path d="M6.6 6.7C3.8 8.5 2 12 2 12a18.4 18.4 0 0 0 5.5 5.8" />
                            </svg>
                        </button>
                    </div>
                </label>

                <button class="mt-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(31,122,89,0.22)] transition hover:-translate-y-0.5" type="submit">
                    Criar conta
                </button>
            </form>

            <p class="mt-6 text-sm text-stone-600">
                Já tem conta?
                <a class="font-bold text-emerald-700" href="{{ route('login') }}">Entrar</a>
            </p>
        </section>
    </main>

    <script>
        document.querySelectorAll('[data-password-toggle]').forEach((button) => {
            button.addEventListener('click', () => {
                const input = document.getElementById(button.getAttribute('aria-controls'));

                if (! input) {
                    return;
                }

                const isHidden = input.type === 'password';

                input.type = isHidden ? 'text' : 'password';
                button.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
                button.querySelector('.toggle-show-icon')?.classList.toggle('hidden', isHidden);
                button.querySelector('.toggle-hide-icon')?.classList.toggle('hidden', ! isHidden);
            });
        });
    </script>
@endsection
