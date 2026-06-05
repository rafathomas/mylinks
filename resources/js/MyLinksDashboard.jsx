import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import QRCode from 'qrcode';
import OnboardingFlow from './OnboardingFlow';

const themes = {
    mylinks: {
        accent: '#0f5c3f',
        previewGlow: 'linear-gradient(180deg, rgba(12, 42, 30, 0.96) 0%, rgba(18, 57, 41, 0.92) 48%, rgba(30, 22, 13, 0.92) 100%)',
        previewImage:
            'linear-gradient(180deg, rgba(8, 28, 20, 0.55), rgba(8, 28, 20, 0.72)), url("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80")',
    },
    graphite: {
        accent: '#8b8d85',
        previewGlow: 'linear-gradient(180deg, #f1f2ee 0%, #dcded8 100%)',
        previewImage:
            'linear-gradient(180deg, rgba(248, 248, 245, 0.98), rgba(231, 232, 227, 0.98))',
    },
    sand: {
        accent: '#8e6a32',
        previewGlow: 'linear-gradient(180deg, rgba(57, 40, 17, 0.96) 0%, rgba(102, 75, 32, 0.92) 100%)',
        previewImage:
            'linear-gradient(180deg, rgba(57, 40, 17, 0.5), rgba(57, 40, 17, 0.72)), url("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80")',
    },
};

const themeSuggestions = [
    { id: 'midnight-echo', themeValue: 'graphite', name: 'Jesse Jordan', tagline: 'Rockstar, Activist, Writer', cardClass: 'bg-[#050505] text-white', lineClass: 'bg-white/10', socialClass: 'text-white' },
    { id: 'sky-bloom', themeValue: 'graphite', name: 'Mindy Frauke', tagline: 'Community artist, with a taste for everything local', cardClass: 'bg-[linear-gradient(180deg,#b8d7df_0%,#d9caea_64%,#e67c55_100%)] text-[#40333d]', lineClass: 'bg-white/85', socialClass: 'text-[#40333d]' },
    { id: 'retro-grid', themeValue: 'sand', name: 'Lowell Maxwell', tagline: 'Soul beats and mech from Hackney', cardClass: 'bg-[#5f4042] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px] text-[#f5e7ce]', lineClass: 'bg-[#faeecf]', socialClass: 'text-[#f5e7ce]' },
    { id: 'editorial-cream', themeValue: 'sand', name: 'Sergey Amir', tagline: 'Vintage photography for modern brands', cardClass: 'bg-[#f5eddf] text-[#de4a3d]', lineClass: 'border border-[#ef5a50] bg-transparent', socialClass: 'text-[#de4a3d]' },
    { id: 'forest-room', themeValue: 'mylinks', name: 'Roberto Leopoldo', tagline: 'Blending horticulture with the art of design', cardClass: 'bg-[#132f28] text-[#eef7e2]', lineClass: 'bg-[#edf9db]', socialClass: 'text-[#eef7e2]' },
    { id: 'paper-light', themeValue: 'graphite', name: 'Salka Ruslan', tagline: 'Reading my way through Brooklyn', cardClass: 'bg-[#eceef4] text-[#0a0a0a]', lineClass: 'bg-white', socialClass: 'text-[#0a0a0a]' },
    { id: 'grain-shadow', themeValue: 'sand', name: 'Monica Vera', tagline: 'Daily rituals', cardClass: 'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_18%),repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.06)_2px,transparent_2px,transparent_7px),#6f665e] text-[#f3ece5]', lineClass: 'bg-[#a59890]', socialClass: 'text-[#f3ece5]' },
    { id: 'plum-store', themeValue: 'graphite', name: 'Newlove Store', tagline: 'Vintage, always.', cardClass: 'bg-[linear-gradient(180deg,#471331_0%,#764a79_100%)] text-white', lineClass: 'border border-white/60 bg-transparent', socialClass: 'text-white' },
    { id: 'violet-pop', themeValue: 'graphite', name: 'Lexie Candis', tagline: 'Pastel artist from Melbourne', cardClass: 'bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_16%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.15),transparent_14%),radial-gradient(circle_at_25%_75%,rgba(76,29,149,0.38),transparent_18%),radial-gradient(circle_at_75%_65%,rgba(76,29,149,0.3),transparent_18%),#8a5db7] text-white', lineClass: 'bg-[#ead8fb]', socialClass: 'text-white' },
    { id: 'powder-air', themeValue: 'graphite', name: 'Indi Montana', tagline: 'Skincare blogger. Owner of too many plants.', cardClass: 'bg-[#c8d8e3] text-[#31424e]', lineClass: 'bg-[#d8e7ef]', socialClass: 'text-[#31424e]' },
    { id: 'mono-ink', themeValue: 'sand', name: 'Kevin Sikandar', tagline: 'Typography and Video Designer', cardClass: 'bg-[#e8e5d9] text-[#111111]', lineClass: 'border-[3px] border-[#332e33] bg-white', socialClass: 'text-[#111111]' },
    { id: 'sun-halo', themeValue: 'mylinks', name: 'Natazia', tagline: 'Indie pop and indoor plants', cardClass: 'bg-[radial-gradient(circle_at_50%_55%,#e96857_0%,#f0a95b_28%,#7fd0a9_100%)] text-white', lineClass: 'bg-white', socialClass: 'text-white' },
    { id: 'night-drive', themeValue: 'graphite', name: 'Ella Vibe', tagline: 'Hard times, Hard techno', cardClass: 'bg-[#1e1d1d] text-[#f3ede7]', lineClass: 'border border-white/12 bg-transparent', socialClass: 'text-[#f3ede7]' },
    { id: 'rose-cloud', themeValue: 'sand', name: 'Gabrielle Lacey', tagline: 'Can’t stop won’t stop', cardClass: 'bg-[#f3e5e8] text-[#3d3338]', lineClass: 'bg-white shadow-[0_10px_18px_rgba(255,255,255,0.6)]', socialClass: 'text-[#3d3338]' },
];

const onboardingThemePresets = {
    'midnight-echo': {
        backgroundClass: 'bg-[#050505]',
        textClass: 'text-white',
        mutedTextClass: 'text-white/85',
    },
    'sky-bloom': {
        backgroundClass: 'bg-[linear-gradient(180deg,#b8d7df_0%,#d9caea_64%,#e67c55_100%)]',
        textClass: 'text-[#40333d]',
        mutedTextClass: 'text-[#40333d]/85',
    },
    'retro-grid': {
        backgroundClass: 'bg-[#5f4042] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]',
        textClass: 'text-[#f5e7ce]',
        mutedTextClass: 'text-[#f5e7ce]/85',
    },
    'editorial-cream': {
        backgroundClass: 'bg-[#f5eddf]',
        textClass: 'text-[#de4a3d]',
        mutedTextClass: 'text-[#de4a3d]/85',
    },
    'forest-room': {
        backgroundClass: 'bg-[#132f28]',
        textClass: 'text-[#eef7e2]',
        mutedTextClass: 'text-[#eef7e2]/85',
    },
    'paper-light': {
        backgroundClass: 'bg-[#eceef4]',
        textClass: 'text-[#0a0a0a]',
        mutedTextClass: 'text-[#0a0a0a]/85',
    },
    'grain-shadow': {
        backgroundClass: 'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_18%),repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.06)_2px,transparent_2px,transparent_7px),#6f665e]',
        textClass: 'text-[#f3ece5]',
        mutedTextClass: 'text-[#f3ece5]/85',
    },
    'plum-store': {
        backgroundClass: 'bg-[linear-gradient(180deg,#471331_0%,#764a79_100%)]',
        textClass: 'text-white',
        mutedTextClass: 'text-white/85',
    },
    'violet-pop': {
        backgroundClass: 'bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_16%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.15),transparent_14%),radial-gradient(circle_at_25%_75%,rgba(76,29,149,0.38),transparent_18%),radial-gradient(circle_at_75%_65%,rgba(76,29,149,0.3),transparent_18%),#8a5db7]',
        textClass: 'text-white',
        mutedTextClass: 'text-white/85',
    },
    'powder-air': {
        backgroundClass: 'bg-[#c8d8e3]',
        textClass: 'text-[#31424e]',
        mutedTextClass: 'text-[#31424e]/85',
    },
    'mono-ink': {
        backgroundClass: 'bg-[#e8e5d9]',
        textClass: 'text-[#111111]',
        mutedTextClass: 'text-[#111111]/85',
    },
    'sun-halo': {
        backgroundClass: 'bg-[radial-gradient(circle_at_50%_55%,#e96857_0%,#f0a95b_28%,#7fd0a9_100%)]',
        textClass: 'text-white',
        mutedTextClass: 'text-white/85',
    },
    'night-drive': {
        backgroundClass: 'bg-[#1e1d1d]',
        textClass: 'text-[#f3ede7]',
        mutedTextClass: 'text-[#f3ede7]/85',
    },
    'rose-cloud': {
        backgroundClass: 'bg-[#f3e5e8]',
        textClass: 'text-[#3d3338]',
        mutedTextClass: 'text-[#3d3338]/85',
    },
};

const buttonStyleOptions = [
    { id: 'solid', label: 'Sólido' },
    { id: 'glass', label: 'Vidro' },
    { id: 'outline', label: 'Contorno' },
];

const buttonRadiusOptions = [
    { id: 'square', label: 'Quadrado' },
    { id: 'soft', label: 'Suave' },
    { id: 'rounded', label: 'Arredondado' },
    { id: 'pill', label: 'Pílula' },
];

const linkPlatformOptions = [
    { id: 'instagram', name: 'Instagram', placeholder: 'username', icon: 'IG', description: 'Leve seu público para o seu Instagram.' },
    { id: 'whatsapp', name: 'WhatsApp', placeholder: '5511999999999', icon: 'WA', description: 'Receba mensagens e pedidos diretamente no WhatsApp.' },
    { id: 'tiktok', name: 'TikTok', placeholder: '@username', icon: 'TT', description: 'Compartilhe seu perfil do TikTok.' },
    { id: 'youtube', name: 'YouTube', placeholder: 'username', icon: 'YT', description: 'Mostre seus vídeos e canal.' },
    { id: 'website', name: 'Website', placeholder: 'https://seusite.com', icon: 'WB', description: 'Direcione para seu site principal.' },
    { id: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/...', icon: 'SP', description: 'Divulgue playlists, músicas ou podcast.' },
    { id: 'threads', name: 'Threads', placeholder: '@username', icon: 'TH', description: 'Conecte sua audiência do Threads.' },
    { id: 'facebook', name: 'Facebook', placeholder: 'facebook.com/username', icon: 'FB', description: 'Adicione sua página do Facebook.' },
    { id: 'x', name: 'X', placeholder: '@username', icon: 'X', description: 'Divulgue seu perfil no X.' },
];

const sidebarItems = [
    { id: 'dashboard', label: 'Painel', icon: GridIcon },
    { id: 'links', label: 'Links', icon: ChainIcon },
    { id: 'appearance', label: 'Aparência', icon: PaletteIcon },
    { id: 'qr', label: 'QR Code', icon: QrIcon },
    { id: 'leads', label: 'Leads', icon: UsersIcon, badge: '12', premium: true },
    { id: 'analytics', label: 'Estatísticas', icon: BarChartIcon, premium: true },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
];

const socialIcons = [
    { id: 'instagram', icon: InstagramIcon, label: 'Instagram' },
    { id: 'pinterest', icon: PinterestIcon, label: 'Pinterest' },
    { id: 'email', icon: MailIcon, label: 'E-mail' },
];

const defaultAvatarUrl = '/blank-avatar.svg';
const freePlanThemeLimit = 3;

function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}

function IconButton({ children, className = '', ...props }) {
    return (
        <button
            className={cx(
                'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900',
                className,
            )}
            type="button"
            {...props}
        >
            {children}
        </button>
    );
}

function SectionTitle({ title, description, action }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2 className="text-[1.08rem] font-semibold tracking-[-0.035em] text-stone-950">{title}</h2>
                {description ? <p className="mt-1.5 text-[0.95rem] leading-6 text-stone-500">{description}</p> : null}
            </div>
            {action}
        </div>
    );
}

function AppearanceNavItem({ label, value, icon, onClick }) {
    return (
        <button
            className="flex w-full items-center gap-4 rounded-[24px] border border-[#e8dece] bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(31,23,10,0.03)] transition hover:border-stone-300"
            onClick={onClick}
            type="button"
        >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-stone-200 bg-[#f7f3eb] shadow-inner">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[1rem] font-medium tracking-[-0.02em] text-stone-900">{label}</p>
            </div>
            <div className="flex items-center gap-3">
                {value ? <span className="text-sm text-stone-500">{value}</span> : null}
                <ChevronRightIcon className="h-4 w-4 text-stone-400" />
            </div>
        </button>
    );
}

function AppearancePanelHeader({ title, onBack }) {
    return (
        <div className="flex items-center gap-4">
            <button
                aria-label={`Voltar para Aparência`}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#f5f1e8] text-stone-700 transition hover:bg-[#eee7db]"
                onClick={onBack}
                type="button"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h3 className="text-[2rem] font-semibold tracking-[-0.05em] text-stone-950">{title}</h3>
        </div>
    );
}

function TextField({ label, value, onChange, maxLength = null, multiline = false, placeholder = '' }) {
    const fieldId = useId();
    const count = typeof value === 'string' ? value.length : 0;
    const InputTag = multiline ? 'textarea' : 'input';

    return (
        <label className="grid gap-2" htmlFor={fieldId}>
            <span className="text-sm font-medium text-stone-700">{label}</span>
            <div className="relative">
                <InputTag
                    aria-label={label}
                    className={cx(
                        'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-950 shadow-sm outline-none transition',
                        'focus:border-[#0f5c3f] focus:ring-4 focus:ring-[#0f5c3f]/10',
                        multiline ? 'min-h-[110px] resize-none pr-20' : 'pr-16',
                    )}
                    id={fieldId}
                    maxLength={maxLength ?? undefined}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={multiline ? 4 : undefined}
                    value={value}
                />
                {maxLength ? (
                    <span className="pointer-events-none absolute right-4 top-3 text-xs text-stone-400">
                        {count}/{maxLength}
                    </span>
                ) : null}
            </div>
        </label>
    );
}

function LinkValueField({ label, value, onChange, maxLength = null, placeholder = '', prefix = '' }) {
    const fieldId = useId();
    const count = typeof value === 'string' ? value.length : 0;

    return (
        <label className="grid gap-2" htmlFor={fieldId}>
            <span className="text-sm font-medium text-stone-700">{label}</span>
            <div className="relative">
                <div className="flex items-center rounded-2xl border border-stone-200 bg-white shadow-sm transition focus-within:border-[#0f5c3f] focus-within:ring-4 focus-within:ring-[#0f5c3f]/10">
                    {prefix ? (
                        <span
                            aria-hidden="true"
                            className="shrink-0 rounded-l-2xl border-r border-stone-200 bg-stone-50 px-4 py-3 text-[15px] text-stone-500"
                        >
                            {prefix}
                        </span>
                    ) : null}
                    <input
                        aria-label={label}
                        className={cx(
                            'w-full rounded-r-2xl bg-transparent px-4 py-3 text-[15px] text-stone-950 outline-none',
                            prefix ? 'rounded-l-none' : 'rounded-l-2xl',
                            maxLength ? 'pr-16' : '',
                        )}
                        id={fieldId}
                        maxLength={maxLength ?? undefined}
                        onChange={onChange}
                        placeholder={placeholder}
                        value={value}
                    />
                </div>
                {maxLength ? (
                    <span className="pointer-events-none absolute right-4 top-3 text-xs text-stone-400">
                        {count}/{maxLength}
                    </span>
                ) : null}
            </div>
        </label>
    );
}

function StatsCard({ icon: Icon, value, label, delta }) {
    return (
        <article className="rounded-[20px] border border-[#ece4d6] bg-white p-4 shadow-[0_8px_28px_rgba(31,23,10,0.035)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 text-stone-500">
                <Icon className="h-5 w-5" />
            </div>
            <strong className="mt-6 block text-[1.9rem] font-semibold tracking-[-0.045em] text-stone-950">{value}</strong>
            <span className="mt-1 block text-[0.95rem] text-stone-700">{label}</span>
            <small className="mt-3 block text-xs text-emerald-600">{delta}</small>
        </article>
    );
}

function PlanUpgradeButton({ onClick }) {
    return (
        <button
            aria-label="Fazer upgrade"
            className="plan-upgrade-button relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-[#43d854] bg-[#122317] px-4 py-2 text-sm font-semibold text-[#5df06d] transition hover:bg-[#17311f]"
            onClick={onClick}
            type="button"
        >
            <span className="plan-upgrade-glow absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(93,240,109,0.28)_0%,rgba(93,240,109,0)_70%)]" />
            <SparkIcon className="relative h-4 w-4" />
            <span className="relative">Fazer upgrade</span>
        </button>
    );
}

function AvatarImage({ src, alt, className = '' }) {
    return (
        <img
            alt={alt}
            className={className}
            onError={(event) => {
                if (event.currentTarget.src.endsWith(defaultAvatarUrl)) {
                    return;
                }

                event.currentTarget.src = defaultAvatarUrl;
            }}
            src={src || defaultAvatarUrl}
        />
    );
}

function UpgradeTopBanner({ onUpgrade }) {
    return (
        <div className="relative z-10 border-b border-[#2c2618] bg-[#151210] px-5 py-3 text-white">
            <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-center gap-4">
                <SparkIcon className="h-4 w-4 shrink-0 text-[#5df06d]" />
                <p className="text-sm font-medium text-[#f5f2eb]">
                    Faça upgrade para desbloquear estatísticas e recursos extras.
                </p>
                <PlanUpgradeButton onClick={onUpgrade} />
            </div>
        </div>
    );
}

function StripeSubscriptionForm({ onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard?upgrade=success`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message ?? 'Não foi possível confirmar o pagamento.');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        onSuccess?.();
    };

    return (
        <form className="mt-6" onSubmit={handleSubmit}>
            <div className="rounded-[28px] border border-[#e8dece] bg-white p-6 shadow-[0_12px_28px_rgba(31,23,10,0.04)]">
                <PaymentElement options={{ layout: 'tabs' }} />
                {errorMessage ? <p className="mt-4 text-sm text-rose-600">{errorMessage}</p> : null}
                <button
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#0f5c3f] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#0c4f37] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!stripe || isSubmitting}
                    type="submit"
                >
                    <SparkIcon className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Processando pagamento...' : 'Confirmar pagamento'}
                </button>
            </div>
        </form>
    );
}

function UpgradeCheckoutScreen({ billingCycle, checkoutLinks, createSubscriptionIntentRoute, publishableKey, stripeMode, onBack, onPaymentSuccess, onSelectCycle }) {
    const isAnnual = billingCycle === 'annual';
    const selectedCheckoutLink = isAnnual ? checkoutLinks.annual : checkoutLinks.monthly;
    const [checkoutState, setCheckoutState] = useState({
        clientSecret: '',
        error: '',
        isLoading: true,
        publishableKey,
    });
    const stripePromise = useMemo(
        () => (checkoutState.publishableKey ? loadStripe(checkoutState.publishableKey) : null),
        [checkoutState.publishableKey],
    );

    useEffect(() => {
        let cancelled = false;

        if (!createSubscriptionIntentRoute) {
            setCheckoutState({
                clientSecret: '',
                error: 'A rota de assinatura do Stripe não foi configurada.',
                isLoading: false,
                publishableKey,
            });
            return () => {
                cancelled = true;
            };
        }

        if (!publishableKey) {
            setCheckoutState({
                clientSecret: '',
                error: 'Defina STRIPE_PUBLISHABLE_KEY para exibir o formulário de pagamento.',
                isLoading: false,
                publishableKey,
            });
            return () => {
                cancelled = true;
            };
        }

        setCheckoutState((current) => ({
            ...current,
            clientSecret: '',
            error: '',
            isLoading: true,
        }));

        void requestJson(createSubscriptionIntentRoute, {
            method: 'POST',
            body: JSON.stringify({ billing_cycle: billingCycle }),
        })
            .then((payload) => {
                if (cancelled) {
                    return;
                }

                setCheckoutState({
                    clientSecret: payload.client_secret ?? '',
                    error: '',
                    isLoading: false,
                    publishableKey: payload.publishable_key ?? publishableKey,
                });
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }

                setCheckoutState({
                    clientSecret: '',
                    error: error.message,
                    isLoading: false,
                    publishableKey,
                });
            });

        return () => {
            cancelled = true;
        };
    }, [billingCycle, createSubscriptionIntentRoute, publishableKey]);

    return (
        <section className="mx-auto max-w-[1540px] px-6 py-8 lg:px-8 xl:px-10">
            <button
                className="inline-flex items-center gap-2 text-sm font-medium text-[#6d4aff] transition hover:text-[#5838ff]"
                onClick={onBack}
                type="button"
            >
                <ChevronLeftIcon className="h-4 w-4" />
                Voltar para os planos
            </button>

            <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                    <h1 className="text-[3rem] font-semibold leading-[0.96] tracking-[-0.06em] text-stone-950">Escolha seu plano Pro</h1>
                    <div className="mt-6 space-y-3 text-stone-600">
                        <p className="flex items-center gap-3"><CheckIcon className="h-4 w-4 text-[#0f5c3f]" /> Checkout hospedado e seguro com Stripe</p>
                        <p className="flex items-center gap-3"><CheckIcon className="h-4 w-4 text-[#0f5c3f]" /> Assinatura mensal ou anual para desbloquear recursos Pro</p>
                        <p className="flex items-center gap-3"><CheckIcon className="h-4 w-4 text-[#0f5c3f]" /> Você pode cancelar sua assinatura direto no Stripe</p>
                    </div>

                    <div className="mt-12">
                        <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-stone-950">Ciclo de cobrança</h2>
                        <div className="mt-5 grid gap-4 md:max-w-[620px] md:grid-cols-2">
                            <button
                                className={cx(
                                    'relative rounded-[24px] border p-6 text-left transition',
                                    isAnnual ? 'border-[#6d4aff] bg-[#f6f1ff] shadow-[0_14px_32px_rgba(109,74,255,0.08)]' : 'border-[#e8dece] bg-white hover:border-stone-300',
                                )}
                                onClick={() => onSelectCycle('annual')}
                                type="button"
                            >
                                <span className="absolute right-4 top-4 rounded-full bg-[#6d4aff] px-3 py-1 text-xs font-semibold text-white">Economize 24%</span>
                                <p className="text-[2rem] font-semibold tracking-[-0.05em] text-stone-950">R$ 32<span className="ml-1 text-base font-medium text-stone-500">/mês</span></p>
                                <p className="mt-1 text-lg font-medium text-stone-900">Anual</p>
                                <p className="mt-2 text-sm text-stone-500">R$ 384/ano, cobrança recorrente</p>
                            </button>
                            <button
                                className={cx(
                                    'rounded-[24px] border p-6 text-left transition',
                                    !isAnnual ? 'border-[#6d4aff] bg-[#f6f1ff] shadow-[0_14px_32px_rgba(109,74,255,0.08)]' : 'border-[#e8dece] bg-white hover:border-stone-300',
                                )}
                                onClick={() => onSelectCycle('monthly')}
                                type="button"
                            >
                                <p className="text-[2rem] font-semibold tracking-[-0.05em] text-stone-950">R$ 42<span className="ml-1 text-base font-medium text-stone-500">/mês</span></p>
                                <p className="mt-1 text-lg font-medium text-stone-900">Mensal</p>
                                <p className="mt-2 text-sm text-stone-500">R$ 42/mês, cobrança recorrente</p>
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 md:max-w-[620px]">
                        <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-stone-950">Pagamento</h2>
                        <div className="mt-4 rounded-[28px] border border-[#e8dece] bg-[#fcfaf5] p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f5c3f] text-white">
                                    <BagIcon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-medium text-stone-900">Digite seu cartão aqui</p>
                                    <p className="text-sm text-stone-500">Formulário seguro do Stripe Elements integrado ao MyLinks.</p>
                                </div>
                            </div>
                            {checkoutState.isLoading ? (
                                <div className="mt-6 rounded-[28px] border border-[#e8dece] bg-white p-6 text-sm text-stone-500">
                                    Preparando formulário de pagamento...
                                </div>
                            ) : checkoutState.error ? (
                                <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                                    {checkoutState.error}
                                </div>
                            ) : checkoutState.clientSecret && stripePromise ? (
                                <Elements
                                    options={{
                                        clientSecret: checkoutState.clientSecret,
                                        appearance: {
                                            theme: 'stripe',
                                            variables: {
                                                colorPrimary: '#0f5c3f',
                                                borderRadius: '18px',
                                            },
                                        },
                                    }}
                                    stripe={stripePromise}
                                >
                                    <StripeSubscriptionForm onSuccess={onPaymentSuccess} />
                                </Elements>
                            ) : (
                                <div className="mt-6 rounded-[28px] border border-[#e8dece] bg-white p-6 text-sm text-stone-500">
                                    O formulário de pagamento ainda não está disponível.
                                </div>
                            )}
                            <p className="mt-4 text-sm text-stone-500">
                                Ambiente {stripeMode === 'test' ? 'de teste' : 'de produção'} Stripe. Em teste, use cartões de teste.
                            </p>
                        </div>
                    </div>
                </div>

                <aside className="self-start rounded-[30px] border border-[#e8dece] bg-white p-6 shadow-[0_12px_30px_rgba(31,23,10,0.04)]">
                    <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-stone-950">Seu plano de teste</h2>
                    <div className="mt-6 border-t border-[#ece4d6] pt-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-semibold text-stone-950">MyLinks Pro</p>
                                <p className="mt-2 text-sm text-stone-500">Pagamento seguro com Stripe</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-stone-400 line-through">{isAnnual ? 'R$ 384,00' : 'R$ 42,00'}</p>
                            </div>
                        </div>
                        <button className="mt-6 text-sm font-medium text-[#6d4aff]" type="button">Adicione um código de cupom</button>
                    </div>
                    <div className="mt-8 border-t border-[#ece4d6] pt-6">
                        <div className="flex items-center justify-between text-stone-700">
                            <span>Renovação automática</span>
                            <span>{isAnnual ? 'R$ 384/ano' : 'R$ 42/mês'}</span>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <span className="font-semibold text-stone-950">Cobrança de hoje</span>
                            <span className="text-[2.2rem] font-semibold tracking-[-0.05em] text-stone-950">{isAnnual ? 'R$ 384' : 'R$ 42'}</span>
                        </div>
                        <a
                            className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-[#e8dece] bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:border-stone-300"
                            href={selectedCheckoutLink || undefined}
                            rel="noreferrer"
                            target="_blank"
                        >
                            <SparkIcon className="mr-2 h-4 w-4" />
                            Abrir checkout hospedado do Stripe
                        </a>
                        <p className="mt-5 text-center text-sm leading-6 text-stone-500">
                            {stripeMode === 'test'
                                ? 'Ambiente de teste Stripe ativo. Você pode usar o checkout embutido acima ou abrir a versão hospedada do Stripe.'
                                : 'Você pode pagar no formulário acima ou abrir a versão hospedada do Stripe.'}
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
}

function ProfileMark() {
    return (
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#195f44_0%,#0e4f37_100%)] shadow-[0_20px_45px_rgba(15,92,63,0.18)]">
            <div className="rounded-full border border-white/70 p-6">
                <HouseMarkIcon className="h-10 w-10 text-[#e2cba3]" />
            </div>
        </div>
    );
}

function LinkIconBubble({ icon }) {
    const palette = {
        WA: 'bg-[#57c767] text-white',
        IG: 'bg-white text-[#ee4d7f] ring-1 ring-[#f3d8e5]',
        PT: 'bg-[#0f5c3f] text-white',
        SV: 'bg-[#f2eee6] text-stone-700',
        MP: 'bg-[#0f5c3f] text-white',
        NV: 'bg-stone-100 text-stone-700',
        GO: 'bg-stone-100 text-stone-700',
    };

    return (
        <div className={cx('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shadow-sm', palette[icon] ?? 'bg-stone-100 text-stone-700')}>
            <LinkBubbleGlyph icon={icon} />
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button
            aria-pressed={checked}
            className={cx(
                'relative inline-flex h-7 w-11 items-center rounded-full border transition duration-200 ease-out',
                checked ? 'border-[#0f5c3f] bg-[#0f5c3f] shadow-[inset_0_0_0_1px_rgba(15,92,63,0.14)]' : 'border-stone-300 bg-stone-200',
            )}
            onClick={onChange}
            type="button"
        >
            <span
                className={cx(
                    'absolute left-0.5 top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition duration-200 ease-out',
                    checked ? 'translate-x-4.5' : 'translate-x-0',
                )}
            />
        </button>
    );
}

function SidebarRow({ icon: Icon, label, active = false, badge = null, premium = false, onClick }) {
    return (
        <button
            aria-disabled={premium}
            className={cx(
                'flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-[15px] font-medium transition',
                active ? 'bg-[linear-gradient(180deg,#eef3ec_0%,#edf1e9_100%)] text-[#0f5c3f] shadow-[0_10px_24px_rgba(15,92,63,0.05)]' : 'text-stone-700 hover:bg-stone-50',
                premium && 'cursor-not-allowed opacity-55 hover:bg-transparent',
            )}
            disabled={premium}
            onClick={onClick}
            type="button"
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {premium ? (
                <span aria-label={`${label} bloqueado`} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                    <LockIcon className="h-3.5 w-3.5" />
                </span>
            ) : null}
            {badge ? <span className="rounded-full bg-[#eef3ec] px-2 py-0.5 text-xs text-[#0f5c3f]">{badge}</span> : null}
        </button>
    );
}

function DashboardHeader({ status, onSave, onPublish, publicPage }) {
    return (
        <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
                <h1 className="text-[2.6rem] font-semibold leading-[0.94] tracking-[-0.055em] text-stone-950">Editar página</h1>
                <p className="mt-2 text-[0.98rem] leading-6 text-stone-500">Personalize seu link na bio e conecte tudo o que importa.</p>
            </div>

            <div className="flex flex-col gap-3 self-start sm:flex-row sm:items-center sm:gap-4">
                <div className="inline-flex items-center gap-2 px-1 py-3 text-sm font-medium text-[#0f5c3f]">
                    <CheckIcon className="h-4 w-4" />
                    {status.type === 'error' ? 'Há ajustes pendentes' : 'Todas as alterações salvas'}
                </div>
                <a
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
                    href={publicPage ?? '#'}
                    rel="noreferrer"
                    target="_blank"
                >
                    Ver página
                    <ExternalLinkIcon className="h-4 w-4" />
                </a>
                <button
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_34px_rgba(15,92,63,0.22)] transition hover:bg-[#0b4b34]"
                    onClick={onPublish}
                    type="button"
                >
                    Publicar
                    <CheckIcon className="h-4 w-4" />
                </button>
                <button
                    className="sr-only"
                    onClick={onSave}
                    type="button"
                >
                    Salvar página
                </button>
            </div>
        </header>
    );
}

function devicePreviewLabel(link) {
    return link.title;
}

function LinkBubbleGlyph({ icon }) {
    if (icon === 'WA') {
        return <WhatsAppGlyph className="h-[18px] w-[18px]" />;
    }

    if (icon === 'IG') {
        return <InstagramIcon className="h-[18px] w-[18px]" />;
    }

    if (icon === 'PT') {
        return <ImageGlyph className="h-[18px] w-[18px]" />;
    }

    if (icon === 'SV') {
        return <BagIcon className="h-[18px] w-[18px]" />;
    }

    if (icon === 'MP') {
        return <PinIcon className="h-[18px] w-[18px]" />;
    }

    return <span className="text-[11px] font-semibold tracking-[-0.02em]">{icon ?? 'GO'}</span>;
}

async function requestJson(url, options = {}) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
            ...(options.headers ?? {}),
        },
        credentials: 'same-origin',
        ...options,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(payload.message ?? 'Não foi possível concluir a ação.');
        error.validation = payload.errors ?? null;
        throw error;
    }

    return payload;
}

async function requestFormData(url, formData, options = {}) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
            ...(options.headers ?? {}),
        },
        credentials: 'same-origin',
        body: formData,
        ...options,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(payload.message ?? 'Não foi possível concluir a ação.');
        error.validation = payload.errors ?? null;
        throw error;
    }

    return payload;
}

function moveItem(list, fromId, toId) {
    const current = [...list];
    const fromIndex = current.findIndex((item) => item.id === fromId);
    const toIndex = current.findIndex((item) => item.id === toId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return list;
    }

    const [item] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, item);

    return current.map((entry, index) => ({ ...entry, sort_order: index + 1 }));
}

function getInitials(name) {
    return (name ?? '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0]?.toUpperCase())
        .join('') || 'ML';
}

function buildPublicPageUrl(page) {
    if (typeof window === 'undefined') {
        return page?.slug ? `/${page.slug}` : '';
    }

    const baseUrl = new URL(window.location.origin);
    baseUrl.pathname = page?.slug ? `/${page.slug}` : '/';

    return baseUrl.toString();
}

function formatValidationMessage(error) {
    if (error?.validation && typeof error.validation === 'object') {
        const messages = Object.values(error.validation)
            .flat()
            .filter(Boolean);

        if (messages.length) {
            return messages.join(' ');
        }
    }

    return error?.message ?? 'Não foi possível concluir a ação.';
}

function switchBackgroundMode(mode, updateProfile) {
    if (mode === 'image') {
        updateProfile('background_type', 'image');
        updateProfile('background_value', 'upload');
        return;
    }

    updateProfile('background_type', 'color');
    updateProfile('background_value', '#456B5B');
}

function getBackgroundPreviewStyle(backgroundType, backgroundValue, themeId) {
    if (backgroundType === 'color') {
        return {
            backgroundColor: backgroundValue || '#456B5B',
        };
    }

    const theme = themes[themeId] ?? themes.mylinks;

    return {
        backgroundImage: theme.previewImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
}

function normalizeHexColor(value, fallback) {
    return /^#[0-9A-Fa-f]{6}$/.test(value ?? '') ? value.toUpperCase() : fallback;
}

function isDarkColor(value) {
    const normalized = normalizeHexColor(value, '#456B5B').replace('#', '');
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

    return luminance < 0.58;
}

function hexToRgba(hex, alpha) {
    const normalized = normalizeHexColor(hex, '#FFFFFF').replace('#', '');
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getButtonRadiusValue(radius) {
    return (
        {
            square: '14px',
            soft: '20px',
            rounded: '28px',
            pill: '999px',
        }[radius] ?? '28px'
    );
}

function getButtonStyleConfig(style, buttonColor, textColor) {
    const color = normalizeHexColor(buttonColor, '#FFFFFF');
    const fontColor = normalizeHexColor(textColor, '#111827');

    if (style === 'glass') {
        return {
            backgroundColor: hexToRgba(color, 0.22),
            border: `1px solid ${hexToRgba(color, 0.58)}`,
            boxShadow: `0 14px 30px ${hexToRgba(fontColor, 0.12)}`,
            color: fontColor,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
        };
    }

    if (style === 'outline') {
        return {
            backgroundColor: 'transparent',
            border: `2px solid ${color}`,
            boxShadow: 'none',
            color: fontColor,
        };
    }

    return {
        backgroundColor: color,
        border: `1px solid ${hexToRgba(color, 0.28)}`,
        boxShadow: `0 14px 30px ${hexToRgba(fontColor, 0.12)}`,
        color: fontColor,
    };
}

function buildButtonAppearance(profile) {
    return {
        borderRadius: getButtonRadiusValue(profile.button_radius),
        ...getButtonStyleConfig(profile.button_style, profile.button_color, profile.button_text_color),
    };
}

function isDarkPreview(profile) {
    if (profile.background_type === 'color') {
        return isDarkColor(profile.background_value);
    }

    return profile.theme !== 'graphite';
}

function ColorField({ label, value, onChange }) {
    return (
        <label className="grid gap-3">
            <span className="text-sm font-medium text-stone-700">{label}</span>
            <div className="flex items-center gap-4 rounded-[24px] border border-[#d9cfbf] bg-white px-4 py-4 shadow-sm">
                <input
                    aria-label={label}
                    className="h-11 w-11 cursor-pointer rounded-xl border border-stone-200 bg-transparent p-1"
                    onChange={(event) => onChange(normalizeHexColor(event.target.value, value))}
                    type="color"
                    value={normalizeHexColor(value, '#FFFFFF')}
                />
                <span className="text-[1.1rem] font-medium tracking-[-0.03em] text-stone-900">{normalizeHexColor(value, '#FFFFFF')}</span>
            </div>
        </label>
    );
}

function detectPlatformFromLink(link) {
    const icon = link?.icon ?? '';

    return (
        {
            IG: 'instagram',
            WA: 'whatsapp',
            TT: 'tiktok',
            YT: 'youtube',
            WB: 'website',
            SP: 'spotify',
            TH: 'threads',
            FB: 'facebook',
            X: 'x',
        }[icon] ?? 'website'
    );
}

function getPlatformOption(platformId) {
    return linkPlatformOptions.find((option) => option.id === platformId) ?? linkPlatformOptions.find((option) => option.id === 'website');
}

function getLinkInputConfig(platformId) {
    return (
        {
            whatsapp: {
                label: 'Número do WhatsApp',
                placeholder: '5511999999999',
                prefix: 'wa.me/',
            },
            instagram: {
                label: 'Username do Instagram',
                placeholder: 'username',
                prefix: 'instagram.com/',
            },
            youtube: {
                label: 'Username do YouTube',
                placeholder: 'username',
                prefix: 'youtube.com/@',
            },
        }[platformId] ?? {
            label: 'Usuário ou URL',
            placeholder: getPlatformOption(platformId).placeholder,
            prefix: '',
        }
    );
}

function formatLinkValueForEditing(platformId, value) {
    const normalized = String(value ?? '').trim();

    if (normalized === '') {
        return '';
    }

    if (platformId === 'whatsapp') {
        if (/^https?:\/\/wa\.me\//i.test(normalized)) {
            return normalized.replace(/^https?:\/\/wa\.me\//i, '').replace(/\D+/g, '');
        }

        return normalized.replace(/\D+/g, '');
    }

    if (platformId === 'instagram') {
        return normalized
            .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
            .replace(/\/+$/, '')
            .replace(/^@/, '');
    }

    if (platformId === 'youtube') {
        return normalized
            .replace(/^https?:\/\/(www\.)?youtube\.com\/@/i, '')
            .replace(/\/+$/, '')
            .replace(/^@/, '');
    }

    return normalized;
}

function buildLinkPayload(link) {
    return {
        platform: link.platform ?? 'website',
        title: String(link.title ?? ''),
        url: String(link.url ?? ''),
        description: link.description ?? '',
        is_active: Boolean(link.is_active),
        is_featured: Boolean(link.is_featured),
    };
}

function buildProfileFromThemePreset(themeId) {
    const visualPreset = onboardingThemePresets[themeId];
    const themeSuggestion = themeSuggestions.find((theme) => theme.id === themeId);

    if (!visualPreset || !themeSuggestion) {
        return null;
    }

    return {
        selected_theme_id: themeId,
        theme: themeSuggestion.themeValue,
        background_type: 'color',
        background_value: visualPreset.backgroundClass.includes('#050505')
            ? '#050505'
            : visualPreset.backgroundClass.includes('#B8D7DF')
              ? '#B8D7DF'
              : visualPreset.backgroundClass.includes('#5F4042')
                ? '#5F4042'
                : visualPreset.backgroundClass.includes('#F5EDDF')
                  ? '#F5EDDF'
                  : visualPreset.backgroundClass.includes('#132F28')
                    ? '#132F28'
                    : visualPreset.backgroundClass.includes('#ECEEF4')
                      ? '#ECEEF4'
                      : visualPreset.backgroundClass.includes('#6F665E')
                        ? '#6F665E'
                        : visualPreset.backgroundClass.includes('#471331')
                          ? '#471331'
                          : visualPreset.backgroundClass.includes('#8A5DB7')
                            ? '#8A5DB7'
                            : visualPreset.backgroundClass.includes('#C8D8E3')
                              ? '#C8D8E3'
                              : visualPreset.backgroundClass.includes('#E8E5D9')
                                ? '#E8E5D9'
                                : visualPreset.backgroundClass.includes('#E96857')
                                  ? '#E96857'
                                  : visualPreset.backgroundClass.includes('#1E1D1D')
                                    ? '#1E1D1D'
                                    : '#F3E5E8',
        button_style: themeId === 'editorial-cream' || themeId === 'plum-store' || themeId === 'mono-ink' || themeId === 'night-drive' ? 'outline' : 'solid',
        button_radius: themeId === 'mono-ink' ? 'soft' : 'rounded',
        button_color:
            {
                'midnight-echo': '#2A2A2A',
                'sky-bloom': '#FFFFFF',
                'retro-grid': '#FAEECF',
                'editorial-cream': '#EF5A50',
                'forest-room': '#EDF9DB',
                'paper-light': '#FFFFFF',
                'grain-shadow': '#A59890',
                'plum-store': '#FFFFFF',
                'violet-pop': '#EAD8FB',
                'powder-air': '#D8E7EF',
                'mono-ink': '#332E33',
                'sun-halo': '#FFFFFF',
                'night-drive': '#F3EDE7',
                'rose-cloud': '#FFFFFF',
            }[themeId] ?? '#FFFFFF',
        button_text_color:
            {
                'midnight-echo': '#FFFFFF',
                'sky-bloom': '#40333D',
                'retro-grid': '#5F4042',
                'editorial-cream': '#DE4A3D',
                'forest-room': '#132F28',
                'paper-light': '#0A0A0A',
                'grain-shadow': '#F3ECE5',
                'plum-store': '#FFFFFF',
                'violet-pop': '#4C1D95',
                'powder-air': '#31424E',
                'mono-ink': '#111111',
                'sun-halo': '#E96857',
                'night-drive': '#F3EDE7',
                'rose-cloud': '#3D3338',
            }[themeId] ?? '#111827',
    };
}

function PlatformSelectField({ value, onChange }) {
    const [query, setQuery] = useState('');
    const selectedOption = getPlatformOption(value);
    const filteredOptions = linkPlatformOptions.filter((option) => option.name.toLowerCase().includes(query.trim().toLowerCase()));

    return (
        <div className="grid gap-2.5">
            <span className="text-sm font-medium text-stone-700">Rede social</span>
            <div className="rounded-[22px] border border-[#e8dece] bg-[#fcfaf5] p-3 sm:rounded-[24px] sm:p-4">
                <input
                    aria-label="Buscar rede social"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-950 shadow-sm outline-none transition focus:border-[#0f5c3f] focus:ring-4 focus:ring-[#0f5c3f]/10"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={selectedOption ? `Buscar rede social. Atual: ${selectedOption.name}` : 'Buscar rede social'}
                    value={query}
                />
                <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto pr-1 sm:max-h-52">
                    {filteredOptions.map((option) => (
                        <button
                            aria-pressed={value === option.id}
                            className={cx(
                                'flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition sm:px-4 sm:py-3',
                                value === option.id ? 'border-[#0f5c3f] bg-[#eef3ec] text-[#0f5c3f]' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300',
                            )}
                            key={option.id}
                            onClick={() => onChange(option.id)}
                            type="button"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-700 sm:h-10 sm:w-10">
                                <LinkBubbleGlyph icon={option.icon} />
                            </span>
                            <span className="flex-1">
                                <span className="block text-sm font-semibold">{option.name}</span>
                                <span className="block text-xs text-stone-500">{option.placeholder}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ThemePresetCard({ preset, selected, locked = false, onClick }) {
    return (
        <button
            aria-disabled={locked}
            className={cx(
                'group relative overflow-hidden rounded-[26px] border p-3 text-left transition',
                selected ? 'border-stone-900 bg-white shadow-[0_16px_36px_rgba(17,24,39,0.08)]' : 'border-[#e8dece] bg-white hover:border-stone-300',
                locked && 'cursor-not-allowed opacity-70 hover:border-[#e8dece]',
            )}
            disabled={locked}
            onClick={onClick}
            type="button"
        >
            <div className={cx('relative h-[250px] overflow-hidden rounded-[22px] px-4 py-5', preset.cardClass)}>
                {locked ? (
                    <div className="absolute inset-0 z-10 flex items-start justify-end bg-[linear-gradient(180deg,rgba(17,24,39,0.04)_0%,rgba(17,24,39,0.34)_100%)] p-3">
                        <span aria-label={`${preset.name} bloqueado`} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-stone-700 shadow-sm">
                            <LockIcon className="h-4 w-4" />
                        </span>
                    </div>
                ) : null}
                <div className="mx-auto h-14 w-14 rounded-full bg-white/30 shadow-[0_10px_20px_rgba(0,0,0,0.08)]" />
                <div className="mt-4 text-center">
                    <p className="text-[15px] font-bold tracking-[-0.04em]">{preset.name}</p>
                    <p className="mt-1 text-[10px] opacity-85">{preset.tagline}</p>
                </div>
                <div className={cx('mt-4 flex justify-center gap-4 text-sm font-semibold', preset.socialClass)}>
                    <span>♪</span>
                    <span>◉</span>
                    <span>◎</span>
                </div>
                <div className="mt-6 space-y-3">
                    <div className={cx('h-9 rounded-[16px]', preset.lineClass)} />
                    <div className={cx('h-9 rounded-[16px]', preset.lineClass)} />
                    <div className={cx('h-9 rounded-[16px]', preset.lineClass)} />
                </div>
            </div>
        </button>
    );
}

export default function MyLinksDashboard({ initialData = {} }) {
    const [profile, setProfile] = useState({
        id: initialData.page?.id ?? null,
        name: initialData.page?.name ?? 'A Casa Criativa',
        slug: initialData.page?.slug ?? 'a-casa-criativa',
        handle: initialData.page?.handle ?? '@acasacriativa',
        bio: initialData.page?.bio ?? 'Design de interiores que transforma espaços e inspira momentos.',
        location: initialData.page?.location ?? 'São Paulo, SP',
        theme: initialData.page?.theme ?? 'mylinks',
        selected_theme_id: initialData.page?.selected_theme_id ?? null,
        background_type: initialData.page?.background_type ?? 'image',
        background_value: initialData.page?.background_value ?? 'upload',
        background_image_url: initialData.page?.background_image_url ?? null,
        button_style: initialData.page?.button_style ?? 'solid',
        button_radius: initialData.page?.button_radius ?? 'rounded',
        button_color: initialData.page?.button_color ?? '#FFFFFF',
        button_text_color: initialData.page?.button_text_color ?? '#111827',
        whatsapp_number: initialData.page?.whatsapp_number ?? '',
        profile_image_url: initialData.page?.profile_image_url ?? null,
        social_links: initialData.page?.social_links ?? {
            instagram: '',
            pinterest: '',
            email: '',
        },
        is_published: initialData.page?.is_published ?? false,
    });
    const [links, setLinks] = useState(initialData.links ?? []);
    const [analytics, setAnalytics] = useState(initialData.analytics ?? {});
    const [draggingId, setDraggingId] = useState(null);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [appearancePanel, setAppearancePanel] = useState(null);
    const [editingLink, setEditingLink] = useState(null);
    const [editingLinkSnapshot, setEditingLinkSnapshot] = useState(null);
    const [editingLinkError, setEditingLinkError] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [showUpgradeCheckout, setShowUpgradeCheckout] = useState(false);
    const [billingCycle, setBillingCycle] = useState('annual');
    const [status, setStatus] = useState({ type: 'success', message: '' });
    const [showOnboarding, setShowOnboarding] = useState(!(initialData.page?.onboarding_completed ?? false));
    const profileImageInputRef = useRef(null);
    const backgroundImageInputRef = useRef(null);

    const routes = initialData.routes ?? {};
    const billing = initialData.billing ?? {};
    const checkoutLinks = billing.checkout_links ?? { monthly: '', annual: '' };
    const publishableKey = billing.publishable_key ?? '';
    const stripeMode = billing.stripe_mode ?? 'test';
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const activeTheme = themes[profile.theme] ?? themes.mylinks;
    const selectedThemePreset = profile.selected_theme_id ? onboardingThemePresets[profile.selected_theme_id] ?? null : null;
    const selectedThemeMeta = themeSuggestions.find((themeOption) => themeOption.id === profile.selected_theme_id) ?? null;
    const publishedLinks = useMemo(() => links.filter((link) => link.is_active), [links]);
    const workspaceInitials = useMemo(() => getInitials(profile.name), [profile.name]);
    const accountName = initialData.user?.name ?? 'Equipe MyLinks';
    const accountEmail = initialData.user?.email ?? 'suporte@mylinks.bio';
    const currentPlan = initialData.page?.plan ?? 'free';
    const isFreePlan = currentPlan === 'free';
    const publicPageUrl = useMemo(() => buildPublicPageUrl(profile), [profile]);
    const previewBackgroundStyle = useMemo(() => {
        if (selectedThemePreset && !profile.background_image_url) {
            return null;
        }

        if (profile.background_type === 'image' && profile.background_image_url) {
            return {
                backgroundImage: `linear-gradient(180deg, rgba(8, 28, 20, 0.3), rgba(8, 28, 20, 0.5)), url("${profile.background_image_url}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        }

        return getBackgroundPreviewStyle(profile.background_type, profile.background_value, profile.theme);
    }, [profile.background_image_url, profile.background_type, profile.background_value, profile.theme, selectedThemePreset]);
    const visibleSocialIcons = useMemo(
        () => socialIcons.filter((item) => profile.social_links?.[item.id]),
        [profile.social_links],
    );
    const previewButtonStyle = useMemo(() => buildButtonAppearance(profile), [profile]);
    const previewUsesLightText = useMemo(() => isDarkPreview(profile), [profile]);
    const previewTextClass = selectedThemePreset?.textClass ?? (previewUsesLightText ? 'text-white' : 'text-stone-950');
    const previewMutedTextClass = selectedThemePreset?.mutedTextClass ?? (previewUsesLightText ? 'text-white/85' : 'text-stone-900/85');
    const selectedButtonStyleLabel = buttonStyleOptions.find((option) => option.id === profile.button_style)?.label ?? 'Custom';
    const selectedButtonRadiusLabel = buttonRadiusOptions.find((option) => option.id === profile.button_radius)?.label ?? 'Custom';
    const stats = useMemo(
        () => [
            { icon: UsersIcon, value: analytics.visits ?? '0', label: 'Visitas', delta: analytics.visitsDelta ?? 'Sem dados suficientes' },
            { icon: EyeIcon, value: analytics.linkViews ?? '0', label: 'Visualizações de link', delta: analytics.linkViewsDelta ?? 'Sem dados suficientes' },
            { icon: CursorIcon, value: analytics.clicks ?? '0', label: 'Cliques', delta: analytics.clicksDelta ?? 'Sem dados suficientes' },
            { icon: TrendIcon, value: analytics.ctr ?? '0,0%', label: 'Taxa de cliques', delta: analytics.ctrDelta ?? 'Sem dados suficientes' },
        ],
        [analytics.clicks, analytics.clicksDelta, analytics.ctr, analytics.ctrDelta, analytics.linkViews, analytics.linkViewsDelta, analytics.visits, analytics.visitsDelta],
    );
    const topLinks = analytics.topLinks ?? [];
    const leadSignals = analytics.leadSignals ?? [];

    useEffect(() => {
        let cancelled = false;

        if (!publicPageUrl) {
            setQrCodeDataUrl('');
            return () => {
                cancelled = true;
            };
        }

        void QRCode.toDataURL(publicPageUrl, {
            margin: 1,
            width: 640,
            color: {
                dark: '#0f5c3f',
                light: '#fffdf8',
            },
        }).then((result) => {
            if (!cancelled) {
                setQrCodeDataUrl(result);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [publicPageUrl]);

    useEffect(() => {
        if (status.type !== 'success' || !status.message) {
            return undefined;
        }

        const timeout = setTimeout(() => {
            setStatus((current) => (current.type === 'success' ? { ...current, message: '' } : current));
        }, 4000);

        return () => clearTimeout(timeout);
    }, [status]);

    const updateProfile = (field, value) => {
        setProfile((current) => ({
            ...current,
            [field]: value,
            selected_theme_id: ['theme', 'background_type', 'background_value'].includes(field)
                ? null
                : current.selected_theme_id,
        }));
        setStatus({ type: 'idle', message: 'Alterações não publicadas' });
    };

    const applyThemePreset = (themeId) => {
        const nextPreset = buildProfileFromThemePreset(themeId);

        if (!nextPreset) {
            return;
        }

        setProfile((current) => ({
            ...current,
            ...nextPreset,
        }));
        setStatus({ type: 'idle', message: 'Alterações não publicadas' });
    };

    const updateSocialLink = (network, value) => {
        setProfile((current) => ({
            ...current,
            social_links: {
                ...(current.social_links ?? {}),
                [network]: value,
            },
        }));
        setStatus({ type: 'idle', message: 'Alterações não publicadas' });
    };

    const updateLinkState = (id, field, value) => {
        setLinks((current) => current.map((link) => (link.id === id ? { ...link, [field]: value } : link)));
        setStatus({ type: 'idle', message: 'Alterações não publicadas' });
    };

    const handleProfileImageUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('profile_image', file);

        setStatus({ type: 'loading', message: 'Enviando imagem...' });

        try {
            const payload = await requestFormData(routes.uploadProfileImage, formData);
            setProfile((current) => ({ ...current, ...payload.page }));
            setStatus({ type: 'success', message: payload.message });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            event.target.value = '';
        }
    };

    const handleBackgroundImageUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('background_image', file);

        setStatus({ type: 'loading', message: 'Enviando plano de fundo...' });

        try {
            const payload = await requestFormData(routes.uploadBackgroundImage, formData);
            setProfile((current) => ({ ...current, ...payload.page }));
            setStatus({ type: 'success', message: payload.message });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            event.target.value = '';
        }
    };

    const openLinkEditor = (link) => {
        const platform = detectPlatformFromLink(link);
        const formattedLink = {
            ...link,
            platform,
            url: formatLinkValueForEditing(platform, link.url),
        };

        setEditingLink(formattedLink);
        setEditingLinkSnapshot(formattedLink);
        setEditingLinkError('');
    };

    const updateEditingLink = (field, value) => {
        setEditingLink((current) => {
            if (!current) {
                return current;
            }

            let updated = { ...current, [field]: value };

            if (field === 'platform') {
                const previousPlatform = getPlatformOption(current.platform);
                const nextPlatform = getPlatformOption(value);
                const currentTitle = (current.title ?? '').trim();

                updated = {
                    ...updated,
                    icon: nextPlatform.icon,
                    description: nextPlatform.description,
                    url: formatLinkValueForEditing(value, current.url),
                    title:
                        currentTitle === '' || currentTitle === previousPlatform.name || currentTitle === 'Novo link'
                            ? nextPlatform.name
                            : current.title,
                };
            }

            setLinks((linksCurrent) => linksCurrent.map((link) => (link.id === updated.id ? { ...link, ...updated } : link)));
            setStatus({ type: 'idle', message: 'Alterações não publicadas' });
            setEditingLinkError('');

            return updated;
        });
    };

    const saveProfile = async (publish = false) => {
        setStatus({ type: 'loading', message: publish ? 'Publicando página...' : 'Salvando página...' });

        try {
            const payload = await requestJson(routes.updatePage, {
                method: 'PUT',
                body: JSON.stringify({
                    ...profile,
                    is_published: publish ? true : profile.is_published,
                }),
            });

            setProfile((current) => ({ ...current, ...payload.page }));
            setStatus({ type: 'success', message: publish ? 'Página publicada com sucesso.' : payload.message });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    const addLink = async () => {
        setStatus({ type: 'loading', message: 'Criando novo link...' });

        try {
            const payload = await requestJson(routes.storeLink, {
                method: 'POST',
                body: JSON.stringify({ platform: 'website' }),
            });

            setLinks((current) => [...current, payload.link]);
            openLinkEditor(payload.link);
            setStatus({ type: 'success', message: payload.message });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    const saveLink = async (link) => {
        setStatus({ type: 'loading', message: `Salvando ${link.title}...` });

        try {
            const payload = await requestJson(`/dashboard/links/${link.id}`, {
                method: 'PUT',
                body: JSON.stringify(buildLinkPayload(link)),
            });

            setLinks((current) => current.map((item) => (item.id === link.id ? payload.link : item)));
            setStatus({ type: 'success', message: payload.message });
            setEditingLink(null);
            setEditingLinkSnapshot(null);
            setEditingLinkError('');
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
            setEditingLinkError(formatValidationMessage(error));
        }
    };

    const cancelEditingLink = () => {
        if (editingLinkSnapshot) {
            setLinks((current) => current.map((link) => (link.id === editingLinkSnapshot.id ? editingLinkSnapshot : link)));
        }

        setEditingLink(null);
        setEditingLinkSnapshot(null);
        setEditingLinkError('');
    };

    const downloadQrCode = () => {
        if (!qrCodeDataUrl) {
            return;
        }

        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `${profile.slug || 'mylinks'}-qrcode.png`;
        link.click();
    };

    const copyPublicPageUrl = async () => {
        if (!publicPageUrl || !navigator?.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(publicPageUrl);
        setStatus({ type: 'success', message: 'Link copiado com sucesso.' });
    };

    const toggleLink = async (link) => {
        const updated = { ...link, is_active: !link.is_active };
        setLinks((current) => current.map((item) => (item.id === link.id ? updated : item)));

        try {
            const payload = await requestJson(`/dashboard/links/${link.id}`, {
                method: 'PUT',
                body: JSON.stringify(buildLinkPayload(updated)),
            });

            setLinks((current) => current.map((item) => (item.id === link.id ? payload.link : item)));
            setStatus({ type: 'success', message: payload.message });
        } catch (error) {
            setLinks((current) => current.map((item) => (item.id === link.id ? link : item)));
            setStatus({ type: 'error', message: error.message });
        }
    };

    const deleteLink = async (linkId) => {
        setStatus({ type: 'loading', message: 'Removendo link...' });

        try {
            const payload = await requestJson(`/dashboard/links/${linkId}`, { method: 'DELETE' });
            setLinks((current) => current.filter((item) => item.id !== linkId));
            setStatus({ type: 'success', message: payload.message });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    const loadAnalytics = async (range) => {
        if (isFreePlan) {
            setStatus({ type: 'success', message: 'As estatísticas completas estão disponíveis no plano Pro.' });
            return;
        }

        setStatus({ type: 'loading', message: `Atualizando estatísticas de ${range}...` });

        try {
            const payload = await requestJson(`${routes.analytics}?range=${range}`);
            setAnalytics(payload.analytics);
            setStatus({ type: 'success', message: `Estatísticas atualizadas para ${range}.` });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    const persistOrder = async (orderedLinks, rollbackLinks) => {
        try {
            const payload = await requestJson(routes.reorderLinks, {
                method: 'POST',
                body: JSON.stringify({ links: orderedLinks.map((link) => link.id) }),
            });

            setLinks(payload.links);
            setStatus({ type: 'success', message: payload.message });
        } catch (error) {
            setLinks(rollbackLinks);
            setStatus({ type: 'error', message: error.message });
        }
    };

    const handleDrop = (targetId) => {
        if (!draggingId || draggingId === targetId) {
            setDraggingId(null);
            return;
        }

        const previous = links;
        const reordered = moveItem(links, draggingId, targetId);
        setLinks(reordered);
        setDraggingId(null);
        setStatus({ type: 'loading', message: 'Salvando nova ordem...' });
        void persistOrder(reordered, previous);
    };

    const openUpgradeCheckout = () => {
        setBillingCycle('annual');
        setShowUpgradeCheckout(true);
    };

    const showMainOverview = activeMenu === 'dashboard';
    const showProfileSection = showMainOverview;
    const showLinksSection = showMainOverview || activeMenu === 'links';
    const showStatsSection = showMainOverview || activeMenu === 'analytics';
    const editingLinkInputConfig = editingLink ? getLinkInputConfig(editingLink.platform ?? 'website') : null;
    const joinMyLinksLabel = `Junte-se a ${profile.handle || '@mylinks'} no MyLinks`;

    if (showOnboarding) {
        return (
            <OnboardingFlow
                initialData={initialData}
                onFinish={(payload) => {
                    setProfile((current) => ({ ...current, ...payload.page }));
                    setLinks(payload.links ?? []);
                    setShowOnboarding(false);
                    setStatus({ type: 'success', message: payload.message ?? 'Onboarding concluído com sucesso.' });
                }}
                onSync={(payload) => {
                    setProfile((current) => ({ ...current, ...payload.page }));
                    setLinks(payload.links ?? []);
                }}
            />
        );
    }

    if (showUpgradeCheckout) {
        return (
            <main className="min-h-screen bg-[#fbf8f1] text-stone-900">
                <UpgradeCheckoutScreen
                    billingCycle={billingCycle}
                    checkoutLinks={checkoutLinks}
                    createSubscriptionIntentRoute={routes.createSubscriptionIntent}
                    onBack={() => setShowUpgradeCheckout(false)}
                    onPaymentSuccess={() => setStatus({ type: 'success', message: 'Pagamento confirmado. Estamos atualizando seu plano.' })}
                    onSelectCycle={setBillingCycle}
                    publishableKey={publishableKey}
                    stripeMode={stripeMode}
                />
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#fbf8f1] text-stone-900">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdfa_0%,#fbf8f1_18%,#f8f3eb_100%)]" />
                <div className="absolute inset-y-0 left-[270px] hidden w-px bg-[#ece4d6] xl:block" />
            </div>

            {isFreePlan ? <UpgradeTopBanner onUpgrade={openUpgradeCheckout} /> : null}

            <div className="relative mx-auto min-h-screen max-w-[1540px] xl:grid xl:grid-cols-[270px_minmax(0,1fr)]">
                <aside className="border-r border-[#ece4d6] bg-[#fdfaf3] px-4 py-6 xl:flex xl:min-h-screen xl:flex-col">
                    <div className="px-3">
                        <div className="flex items-start gap-3">
                            <SparkIcon className="mt-0.5 h-7 w-7 text-[#0f5c3f]" />
                            <div>
                                <h2 className="text-[2.8rem] font-semibold leading-none tracking-[-0.065em] text-[#0f5c3f]">mylinks</h2>
                                <p className="-mt-1 text-[0.88rem] text-stone-400">Seu link para tudo.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[18px] border border-[#e8dece] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(31,23,10,0.03)]">
                        <div className="flex items-center gap-3">
                            <AvatarImage
                                alt={accountName}
                                className="h-12 w-12 rounded-full object-cover"
                                src={profile.profile_image_url}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[0.95rem] font-medium tracking-[-0.02em] text-stone-900">{accountName}</p>
                                <p className="truncate text-[0.78rem] text-stone-500">{accountEmail}</p>
                            </div>
                        </div>
                        <form action={routes.logout} className="mt-3" method="POST">
                            <input name="_token" type="hidden" value={csrfToken} />
                            <button
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8dece] bg-[#fdfaf3] px-3 py-2 text-[0.85rem] font-medium text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                type="submit"
                            >
                                <LogoutIcon className="h-4 w-4" />
                                Sair
                            </button>
                        </form>
                    </div>

                    <nav className="mt-5 space-y-1">
                        {sidebarItems.map((item) => (
                            <SidebarRow
                                active={item.id === activeMenu}
                                badge={item.badge}
                                icon={item.icon}
                                key={item.id}
                                label={item.label}
                                premium={item.premium && isFreePlan}
                                onClick={() => setActiveMenu(item.id)}
                            />
                        ))}
                    </nav>

                </aside>

                <section className="px-6 py-8 lg:px-8 xl:px-10">
                    <input
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleProfileImageUpload}
                        ref={profileImageInputRef}
                        type="file"
                    />
                    <input
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleBackgroundImageUpload}
                        ref={backgroundImageInputRef}
                        type="file"
                    />
                    <DashboardHeader
                        onPublish={() => void saveProfile(true)}
                        onSave={() => void saveProfile(false)}
                        publicPage={publicPageUrl}
                        status={status}
                    />

                    {status.message ? (
                        <div
                            className={cx(
                                'fixed right-6 top-6 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_40px_rgba(31,23,10,0.14)]',
                                status.type === 'error'
                                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                            )}
                            role="status"
                        >
                            {status.type === 'success' ? <CheckIcon className="h-4 w-4" /> : null}
                            {status.message}
                        </div>
                    ) : null}

                    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-7">
                            {showProfileSection ? (
                            <section className="border-b border-[#ece4d6] pb-7">
                                <SectionTitle
                                    action={(
                                        <button className="inline-flex items-center justify-center rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white" onClick={() => void saveProfile(false)} type="button">
                                            Salvar informações
                                        </button>
                                    )}
                                    title="Informações principais"
                                />

                                <div className="mt-7 grid gap-6 lg:grid-cols-[150px_minmax(0,1fr)]">
                                    <div className="flex flex-col items-center">
                                        <AvatarImage
                                            alt={profile.name}
                                            className="h-28 w-28 rounded-full object-cover shadow-[0_20px_45px_rgba(15,92,63,0.18)]"
                                            src={profile.profile_image_url}
                                        />
                                        <button
                                            className="mt-4 rounded-2xl border border-[#e3d9c8] bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
                                            onClick={() => profileImageInputRef.current?.click()}
                                            type="button"
                                        >
                                            Trocar imagem
                                        </button>
                                        <p className="mt-2 text-xs text-stone-400">PNG ou JPG. Máx. 2MB</p>
                                    </div>

                                    <div className="space-y-4">
                                        <TextField label="Nome" maxLength={40} onChange={(event) => updateProfile('name', event.target.value)} value={profile.name} />
                                        <TextField label="Handle" maxLength={40} onChange={(event) => updateProfile('handle', event.target.value)} value={profile.handle ?? ''} />
                                        <TextField label="Bio" maxLength={160} multiline onChange={(event) => updateProfile('bio', event.target.value)} value={profile.bio} />
                                    </div>
                                </div>
                            </section>
                            ) : null}

                            {showLinksSection ? (
                            <section className="border-b border-[#ece4d6] pb-7">
                                <SectionTitle
                                    action={
                                        <button
                                            className="inline-flex items-center gap-2 rounded-2xl bg-[#edf2e8] px-5 py-3 text-sm font-medium text-[#0f5c3f] transition hover:bg-[#e6eee0]"
                                            onClick={addLink}
                                            type="button"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Adicionar link
                                        </button>
                                    }
                                    description="Adicione, reordene e personalize seus links."
                                    title="Seus links"
                                />

                                <div className="mt-6 overflow-hidden rounded-[20px] border border-[#e8dece] bg-white shadow-[0_10px_30px_rgba(31,23,10,0.035)]">
                                    {links.map((link, index) => (
                                        <article
                                            className={cx(
                                                'grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto] items-center gap-4 bg-white px-4 py-4',
                                                index !== links.length - 1 && 'border-b border-[#efe7da]',
                                            )}
                                            draggable
                                            key={link.id}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDragStart={() => setDraggingId(link.id)}
                                            onDrop={() => handleDrop(link.id)}
                                        >
                                            <button
                                                aria-label={`Arrastar ${link.title}`}
                                                className={cx(
                                                    'rounded-xl p-2 text-stone-400 transition hover:bg-stone-50',
                                                    draggingId === link.id && 'bg-stone-50 text-stone-700',
                                                )}
                                                type="button"
                                            >
                                                <GripDotsIcon className="h-4 w-4" />
                                            </button>

                                            <LinkIconBubble icon={link.icon} />

                                            <div className="min-w-0">
                                                <input
                                                    aria-label={index === 0 ? 'Título do link principal' : `Título do link ${index + 1}`}
                                                    className="w-full cursor-pointer border-none bg-transparent p-0 text-[1.05rem] font-medium text-stone-950 outline-none"
                                                    onClick={() => openLinkEditor(link)}
                                                    readOnly
                                                    value={link.title}
                                                />
                                                <input
                                                    aria-label={index === 0 ? 'Descrição do link principal' : `Descrição do link ${index + 1}`}
                                                    className="mt-1 w-full cursor-pointer border-none bg-transparent p-0 text-sm text-stone-500 outline-none"
                                                    onClick={() => openLinkEditor(link)}
                                                    readOnly
                                                    value={link.description ?? ''}
                                                />
                                            </div>

                                            <Toggle checked={link.is_active} onChange={() => void toggleLink(link)} />

                                            <IconButton aria-label={`Editar ${link.title}`} onClick={() => openLinkEditor(link)}>
                                                <PencilIcon className="h-4 w-4" />
                                            </IconButton>

                                            <IconButton aria-label={`Excluir ${link.title}`} onClick={() => void deleteLink(link.id)}>
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </article>
                                    ))}
                                </div>
                            </section>
                            ) : null}

                            {showStatsSection ? (
                            <section className="pt-1">
                                <SectionTitle
                                    action={
                                        isFreePlan ? (
                                            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e3d9c8] bg-white px-4 py-3 text-sm font-medium text-stone-600 shadow-[0_8px_24px_rgba(31,23,10,0.03)]">
                                                <LockIcon className="h-4 w-4" />
                                                Disponível no Pro
                                            </div>
                                        ) : (
                                            <label className="inline-flex items-center gap-2 rounded-2xl border border-[#e3d9c8] bg-white px-4 py-3 text-sm text-stone-600 shadow-[0_8px_24px_rgba(31,23,10,0.03)]">
                                                <CalendarIcon className="h-4 w-4" />
                                                <select
                                                    className="border-none bg-transparent pr-3 outline-none"
                                                    onChange={(event) => void loadAnalytics(event.target.value)}
                                                    value={analytics.range ?? '7d'}
                                                >
                                                    <option value="7d">Últimos 7 dias</option>
                                                    <option value="30d">Últimos 30 dias</option>
                                                    <option value="90d">Últimos 90 dias</option>
                                                </select>
                                            </label>
                                        )
                                    }
                                    title="Resumo de estatísticas"
                                />

                                <div className="relative mt-6">
                                    <div className={cx('grid gap-4 lg:grid-cols-4', isFreePlan && 'pointer-events-none select-none opacity-50 blur-[1.5px]')}>
                                        {stats.map((card) => (
                                            <StatsCard delta={card.delta} icon={card.icon} key={card.label} label={card.label} value={card.value} />
                                        ))}
                                    </div>

                                    {isFreePlan ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="inline-flex items-center gap-3 rounded-full border border-[#d8cfbf] bg-white/95 px-5 py-3 text-sm font-semibold text-stone-700 shadow-[0_18px_36px_rgba(31,23,10,0.12)] backdrop-blur">
                                                <LockIcon className="h-4 w-4 text-stone-500" />
                                                Estatísticas bloqueadas no plano free
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                <button className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#0f5c3f] disabled:cursor-not-allowed disabled:opacity-60" disabled={isFreePlan} type="button">
                                    {isFreePlan ? <LockIcon className="h-4 w-4" /> : null}
                                    Ver todas as estatísticas
                                    <ArrowRightIcon className="h-4 w-4" />
                                </button>
                            </section>
                            ) : null}

                            {activeMenu === 'appearance' ? (
                                <section className="space-y-6">
                                    <section className="rounded-[24px] border border-[#e8dece] bg-white p-6 shadow-[0_10px_30px_rgba(31,23,10,0.035)]">
                                        <SectionTitle
                                            action={(
                                                <button className="inline-flex items-center justify-center rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white" onClick={() => void saveProfile(false)} type="button">
                                                    Salvar aparência
                                                </button>
                                            )}
                                            description="Abra uma categoria para ajustar o visual da sua página por partes."
                                            title="Aparência"
                                        />

                                        {!appearancePanel ? (
                                            <div className="mt-8 space-y-3">
                                                <AppearanceNavItem
                                                    icon={<div className="h-9 w-9 rounded-[14px] bg-[linear-gradient(135deg,#7c3aed_0%,#d946ef_100%)] text-center text-sm font-semibold leading-9 text-white">Aa</div>}
                                                    label="Tema"
                                                    onClick={() => setAppearancePanel('theme')}
                                                    value={selectedThemeMeta?.name ?? 'Personalizado'}
                                                />
                                                <AppearanceNavItem
                                                    icon={<AvatarImage alt="" className="h-9 w-9 rounded-full object-cover" src={profile.profile_image_url} />}
                                                    label="Cabeçalho"
                                                    onClick={() => setAppearancePanel('header')}
                                                    value="Clássico"
                                                />
                                                <AppearanceNavItem
                                                    icon={<div className={cx('h-9 w-9 rounded-[14px]', selectedThemePreset?.backgroundClass ?? 'bg-[#7c3aed]')} />}
                                                    label="Plano de fundo"
                                                    onClick={() => setAppearancePanel('wallpaper')}
                                                    value={profile.background_type === 'image' ? 'Imagem' : 'Cor'}
                                                />
                                                <AppearanceNavItem
                                                    icon={<div className="grid h-9 w-9 place-items-center rounded-[14px] bg-white shadow-inner ring-1 ring-stone-200"><div className="h-5 w-5 rounded bg-[#d946ef]" /></div>}
                                                    label="Botões"
                                                    onClick={() => setAppearancePanel('buttons')}
                                                    value={selectedButtonStyleLabel}
                                                />
                                            </div>
                                        ) : null}

                                        {appearancePanel === 'theme' ? (
                                            <div className="mt-8">
                                                <AppearancePanelHeader onBack={() => setAppearancePanel(null)} title="Tema" />
                                                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                    {themeSuggestions.map((themeOption, index) => (
                                                        <ThemePresetCard
                                                            key={themeOption.id}
                                                            locked={isFreePlan && index >= freePlanThemeLimit}
                                                            onClick={() => applyThemePreset(themeOption.id)}
                                                            preset={themeOption}
                                                            selected={profile.selected_theme_id === themeOption.id}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        {appearancePanel === 'header' ? (
                                            <div className="mt-8">
                                                <AppearancePanelHeader onBack={() => setAppearancePanel(null)} title="Cabeçalho" />
                                                <div className="mt-8 rounded-[24px] border border-[#e8dece] bg-[#fcfaf5] p-5">
                                                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                                                        <AvatarImage
                                                            alt={profile.name}
                                                            className="h-28 w-28 rounded-full object-cover shadow-[0_20px_45px_rgba(15,92,63,0.18)]"
                                                            src={profile.profile_image_url}
                                                        />
                                                        <div className="space-y-3">
                                                            <p className="text-sm font-semibold text-stone-900">Foto do perfil</p>
                                                            <p className="text-sm text-stone-500">Atualize o avatar exibido no topo da sua página.</p>
                                                            <button
                                                                className="inline-flex items-center justify-center rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white"
                                                                onClick={() => profileImageInputRef.current?.click()}
                                                                type="button"
                                                            >
                                                                Trocar imagem
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        {appearancePanel === 'wallpaper' ? (
                                            <div className="mt-8">
                                                <AppearancePanelHeader onBack={() => setAppearancePanel(null)} title="Plano de fundo" />
                                                <div className="mt-8 border-t border-[#efe7da] pt-6">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-base font-semibold text-stone-900">Plano de fundo</h3>
                                                            <p className="mt-1 text-sm text-stone-500">Escolha uma imagem de fundo ou uma cor sólida para a página.</p>
                                                        </div>
                                                        <div className="inline-flex rounded-2xl bg-[#eef3ec] p-1">
                                                            <button
                                                                className={cx(
                                                                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                                                                    profile.background_type === 'image' ? 'bg-white text-[#0f5c3f] shadow-sm' : 'text-stone-500',
                                                                )}
                                                                onClick={() => switchBackgroundMode('image', updateProfile)}
                                                                type="button"
                                                            >
                                                                Imagem
                                                            </button>
                                                            <button
                                                                className={cx(
                                                                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                                                                    profile.background_type === 'color' ? 'bg-white text-[#0f5c3f] shadow-sm' : 'text-stone-500',
                                                                )}
                                                                onClick={() => switchBackgroundMode('color', updateProfile)}
                                                                type="button"
                                                            >
                                                                Cor sólida
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {profile.background_type === 'image' ? (
                                                        <div className="mt-5 rounded-[20px] border border-[#e8dece] bg-[#fcfaf5] p-4">
                                                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-stone-900">Imagem de fundo</p>
                                                                    <p className="mt-1 text-sm text-stone-500">Envie uma imagem local para usar como plano de fundo da sua página.</p>
                                                                </div>
                                                                <button
                                                                    className="inline-flex items-center justify-center rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white"
                                                                    onClick={() => backgroundImageInputRef.current?.click()}
                                                                    type="button"
                                                                >
                                                                    Enviar imagem
                                                                </button>
                                                            </div>

                                                            <div className="mt-4 h-32 overflow-hidden rounded-[18px] border border-[#e3d9c8] bg-stone-100">
                                                                {profile.background_image_url ? (
                                                                    <img alt="Prévia do plano de fundo" className="h-full w-full object-cover" src={profile.background_image_url} />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#dfe8e2_0%,#c4d0c8_100%)] px-4 text-center text-sm text-stone-600">
                                                                        Nenhuma imagem enviada ainda. A prévia usa um fundo padrão até você subir uma imagem.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-5 rounded-[20px] border border-[#e8dece] bg-[#fcfaf5] p-4">
                                                            <label className="flex items-center gap-4">
                                                                <input
                                                                    aria-label="Cor do plano de fundo"
                                                                    className="h-14 w-20 cursor-pointer rounded-xl border border-[#d9cfbf] bg-transparent p-1"
                                                                    onChange={(event) => updateProfile('background_value', event.target.value.toUpperCase())}
                                                                    type="color"
                                                                    value={profile.background_value ?? '#456B5B'}
                                                                />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-stone-900">Escolha a cor de fundo</p>
                                                                    <p className="mt-1 text-sm text-stone-500">{profile.background_value ?? '#456B5B'}</p>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}

                                        {appearancePanel === 'buttons' ? (
                                            <div className="mt-8">
                                                <AppearancePanelHeader onBack={() => setAppearancePanel(null)} title="Botões" />
                                                <div className="mt-8 border-t border-[#efe7da] pt-6">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-stone-900">Estilo do botão</h3>
                                                        <p className="mt-1 text-sm text-stone-500">Escolha o visual dos botões da sua página e veja a prévia atualizar na hora.</p>
                                                    </div>

                                                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                                                        {buttonStyleOptions.map((option) => (
                                                            <button
                                                                aria-pressed={profile.button_style === option.id}
                                                                className={cx(
                                                                    'rounded-[24px] border p-3 text-left transition',
                                                                    profile.button_style === option.id ? 'border-stone-900 shadow-[0_10px_24px_rgba(15,15,15,0.08)]' : 'border-[#e8dece] bg-white',
                                                                )}
                                                                key={option.id}
                                                                onClick={() => updateProfile('button_style', option.id)}
                                                                type="button"
                                                            >
                                                                <div className="rounded-[22px] bg-[linear-gradient(180deg,#d1d5d8_0%,#bcc1c5_100%)] p-3">
                                                                    <div className="flex h-24 items-center justify-center rounded-[18px]">
                                                                        <div
                                                                            className="h-12 w-40 border transition"
                                                                            style={{
                                                                                borderRadius: getButtonRadiusValue(profile.button_radius),
                                                                                ...getButtonStyleConfig(option.id, profile.button_color, profile.button_text_color),
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <p className="px-2 pb-2 pt-4 text-center text-[1.05rem] font-medium text-stone-900">{option.label}</p>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="mt-8 border-t border-[#efe7da] pt-6">
                                                        <div>
                                                            <h3 className="text-base font-semibold text-stone-900">Arredondamento</h3>
                                                            <p className="mt-1 text-sm text-stone-500">Defina o formato dos cantos dos botões.</p>
                                                        </div>

                                                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                                            {buttonRadiusOptions.map((option) => (
                                                                <button
                                                                    aria-pressed={profile.button_radius === option.id}
                                                                    className={cx(
                                                                        'rounded-[24px] border bg-white px-4 py-4 transition',
                                                                        profile.button_radius === option.id ? 'border-stone-900 shadow-[0_10px_24px_rgba(15,15,15,0.08)]' : 'border-[#d9cfbf]',
                                                                    )}
                                                                    key={option.id}
                                                                    onClick={() => updateProfile('button_radius', option.id)}
                                                                    type="button"
                                                                >
                                                                    <div className="flex justify-center">
                                                                        <div
                                                                            className="h-16 w-full max-w-[220px] border-2 border-stone-400 bg-white"
                                                                            style={{ borderRadius: getButtonRadiusValue(option.id) }}
                                                                        />
                                                                    </div>
                                                                    <p className="mt-4 text-center text-sm font-medium text-stone-800">{option.label}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 border-t border-[#efe7da] pt-6">
                                                        <div>
                                                            <h3 className="text-base font-semibold text-stone-900">Cores do botão</h3>
                                                            <p className="mt-1 text-sm text-stone-500">Ajuste a cor de fundo e a cor do texto dos botões.</p>
                                                        </div>

                                                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                                            <ColorField
                                                                label="Cor do botão"
                                                                onChange={(value) => updateProfile('button_color', value)}
                                                                value={profile.button_color ?? '#FFFFFF'}
                                                            />
                                                            <ColorField
                                                                label="Cor do texto do botão"
                                                                onChange={(value) => updateProfile('button_text_color', value)}
                                                                value={profile.button_text_color ?? '#111827'}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                    </section>
                                </section>
                            ) : null}

                            {activeMenu === 'qr' ? (
                                <section className="rounded-[24px] border border-[#e8dece] bg-white p-6 shadow-[0_10px_30px_rgba(31,23,10,0.035)]">
                                    <SectionTitle
                                        description="Baixe o QR Code da sua página para usar em materiais impressos e redes sociais."
                                        title="QR Code"
                                    />
                                    <div className="mt-6 flex flex-col items-center gap-5 md:flex-row md:items-start">
                                        <div className="rounded-[24px] border border-[#e8dece] bg-[#fffdf8] p-4">
                                            {qrCodeDataUrl ? <img alt="QR Code da página" className="h-48 w-48 rounded-2xl" src={qrCodeDataUrl} /> : <div className="h-48 w-48 animate-pulse rounded-2xl bg-stone-100" />}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <p className="text-sm leading-6 text-stone-500">{publicPageUrl}</p>
                                            <div className="flex flex-wrap gap-3">
                                                <button className="inline-flex items-center justify-center rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white" onClick={downloadQrCode} type="button">
                                                    Baixar QR Code
                                                </button>
                                                <button className="inline-flex items-center justify-center rounded-2xl border border-[#e3d9c8] bg-white px-5 py-3 text-sm font-medium text-stone-900" onClick={() => void copyPublicPageUrl()} type="button">
                                                    Copiar link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            {activeMenu === 'leads' ? (
                                <section className="rounded-[24px] border border-[#e8dece] bg-white p-6 shadow-[0_10px_30px_rgba(31,23,10,0.035)]">
                                    <SectionTitle
                                        description="Leitura rápida dos links que mais puxam conversas e intenções."
                                        title="Leads"
                                    />
                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        <StatsCard delta="Canal principal de conversão" icon={UsersIcon} label="Cliques no WhatsApp" value={analytics.whatsapp ?? '0'} />
                                        <StatsCard delta="Tráfego vindo dos botões sociais" icon={TrendIcon} label="Cliques sociais" value={analytics.socialClicks ?? '0'} />
                                    </div>
                                    <div className="mt-6 grid gap-4">
                                        {leadSignals.map((signal) => (
                                            <article className="rounded-[20px] border border-[#e8dece] bg-[#fcfaf5] px-5 py-4" key={signal.label}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-stone-900">{signal.label}</p>
                                                        <p className="mt-1 text-sm leading-6 text-stone-500">{signal.detail}</p>
                                                    </div>
                                                    <strong className="text-lg font-semibold tracking-[-0.03em] text-[#0f5c3f]">{signal.value}</strong>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ) : null}

                            {activeMenu === 'settings' ? (
                                <section className="rounded-[24px] border border-[#e8dece] bg-white p-6 shadow-[0_10px_30px_rgba(31,23,10,0.035)]">
                                    <SectionTitle
                                        description="Ajuste a publicação, o WhatsApp e os dados principais usados na página."
                                        title="Configurações"
                                    />
                                    <div className="mt-6 space-y-4">
                                        <TextField label="Slug público" maxLength={255} onChange={(event) => updateProfile('slug', event.target.value)} value={profile.slug ?? ''} />
                                        <TextField label="Handle público" maxLength={255} onChange={(event) => updateProfile('handle', event.target.value)} value={profile.handle ?? ''} />
                                        <TextField label="WhatsApp" maxLength={30} onChange={(event) => updateProfile('whatsapp_number', event.target.value)} value={profile.whatsapp_number ?? ''} />
                                        <TextField label="Instagram" maxLength={255} onChange={(event) => updateSocialLink('instagram', event.target.value)} value={profile.social_links?.instagram ?? ''} />
                                        <TextField label="Pinterest" maxLength={255} onChange={(event) => updateSocialLink('pinterest', event.target.value)} value={profile.social_links?.pinterest ?? ''} />
                                        <TextField label="E-mail" maxLength={255} onChange={(event) => updateSocialLink('email', event.target.value)} value={profile.social_links?.email ?? ''} />
                                        <div className="flex items-center justify-between rounded-2xl border border-[#e8dece] px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold text-stone-900">Página publicada</p>
                                                <p className="text-sm text-stone-500">Ative para permitir que a página seja visualizada mesmo antes de cadastrar links.</p>
                                            </div>
                                            <Toggle checked={profile.is_published} onChange={() => updateProfile('is_published', !profile.is_published)} />
                                        </div>
                                        <div className="rounded-2xl border border-[#e8dece] bg-[#fcfaf5] px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Link público atual</p>
                                            <p className="mt-2 text-sm font-medium text-stone-900">{publicPageUrl}</p>
                                        </div>
                                        <button className="inline-flex items-center justify-center rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white" onClick={() => void saveProfile(false)} type="button">
                                            Salvar configurações
                                        </button>
                                    </div>
                                </section>
                            ) : null}
                        </div>

                        <aside className="space-y-6 xl:border-l xl:border-[#ece4d6] xl:pl-7">
                            <section>
                                <h2 className="text-[1.08rem] font-semibold tracking-[-0.035em] text-stone-950">Prévia da sua página</h2>

                                <div className="mt-4 inline-flex rounded-2xl bg-[#eef3ec] p-1">
                                    <button className="inline-flex h-9 w-16 items-center justify-center rounded-xl bg-white text-[#0f5c3f] shadow-sm" type="button">
                                        <PhoneIcon className="h-4 w-4" />
                                    </button>
                                    <button className="inline-flex h-9 w-16 items-center justify-center rounded-xl text-stone-500" type="button">
                                        <MonitorIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="relative mx-auto mt-5 max-w-[356px] overflow-hidden rounded-[36px] shadow-[0_26px_70px_rgba(15,34,26,0.26)]">
                                    <div
                                        className={cx('absolute inset-0', selectedThemePreset?.backgroundClass)}
                                        style={previewBackgroundStyle ?? undefined}
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,44,32,0.14)_0%,rgba(18,42,31,0.1)_32%,rgba(11,18,12,0.3)_74%,rgba(11,18,12,0.5)_100%)]" />
                                    <div className={cx('relative flex min-h-[760px] flex-col px-6 py-10', previewTextClass)}>
                                        <div className="mt-24 flex flex-col items-center text-center">
                                        <AvatarImage
                                            alt={profile.name}
                                            className="h-28 w-28 rounded-full object-cover"
                                            src={profile.profile_image_url}
                                        />
                                            <p className={cx('mt-6 text-[2.15rem] font-black tracking-[-0.055em]', previewTextClass)}>{profile.name || profile.handle || 'MyLinks'}</p>
                                            {profile.bio ? (
                                                <p className={cx('mt-2 max-w-[260px] text-center text-[0.98rem] leading-6', previewMutedTextClass)}>
                                                    {profile.bio}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="mx-auto mt-10 w-full max-w-[250px] space-y-4">
                                        {publishedLinks.slice(0, 5).map((link) => (
                                            <button
                                                className={cx(
                                                    'flex w-full items-center justify-between px-5 py-4 text-left text-[1rem] font-medium transition',
                                                )}
                                                key={link.id}
                                                style={previewButtonStyle}
                                                type="button"
                                            >
                                                <span className="flex-1 pr-3 text-center text-[0.98rem] tracking-[-0.015em]">{devicePreviewLabel(link)}</span>
                                                <span className="flex h-9 w-9 items-center justify-center rounded-full">
                                                    <LinkBubbleGlyph icon={link.icon} />
                                                </span>
                                            </button>
                                        ))}
                                        </div>
                                        <a
                                            className="mt-12 inline-flex self-center rounded-full bg-white px-6 py-3 text-base font-semibold text-stone-950 shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
                                            href={routes.landing ?? '/'}
                                        >
                                            {joinMyLinksLabel}
                                        </a>
                                        <p className={cx('mt-6 text-center text-sm', previewMutedTextClass)}>More from MyLinks</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-[24px] border border-[#e8dece] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,249,243,0.96)_100%)] px-6 py-6 shadow-[0_12px_36px_rgba(31,23,10,0.04)]">
                                <h3 className="text-[1.08rem] font-semibold tracking-[-0.035em] text-stone-950">Compartilhe sua página</h3>
                                <p className="mt-2 text-sm text-stone-500">Seu link público está pronto para ser divulgado.</p>

                                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f5f4ef] px-4 py-4 text-sm text-[#0f5c3f]">
                                    <span className="min-w-0 flex-1 truncate">{publicPageUrl}</span>
                                    <button aria-label="Copiar link da página" className="shrink-0" onClick={() => void copyPublicPageUrl()} type="button">
                                        <CopyIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm font-medium text-stone-900 transition hover:border-stone-300" onClick={downloadQrCode} type="button">
                                    <QrIcon className="h-4 w-4" />
                                    Baixar QR Code
                                </button>
                            </section>
                        </aside>
                    </div>

                    {editingLink ? (
                        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/35 px-3 py-3 sm:px-4 sm:py-10">
                            <div className="flex min-h-full items-start justify-center sm:items-center">
                                <div className="flex w-full max-w-[26rem] max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[24px] border border-[#e8dece] bg-white shadow-[0_28px_80px_rgba(25,36,31,0.22)] sm:max-h-[calc(100dvh-5rem)] sm:max-w-2xl sm:rounded-[28px]">
                                    <div className="shrink-0 border-b border-[#efe7d9] px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-6">
                                    <SectionTitle
                                        description="Edite o destino, o texto e o destaque deste link."
                                        title="Editar link"
                                    />
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
                                        {editingLinkError ? (
                                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                {editingLinkError}
                                            </div>
                                        ) : null}

                                        <div className={cx('min-w-0 space-y-3 sm:space-y-4', editingLinkError ? 'mt-4' : null)}>
                                    <TextField label="Título" maxLength={255} onChange={(event) => updateEditingLink('title', event.target.value)} value={editingLink.title ?? ''} />
                                    <PlatformSelectField onChange={(platformId) => updateEditingLink('platform', platformId)} value={editingLink.platform ?? 'website'} />
                                    <LinkValueField
                                        label={editingLinkInputConfig?.label ?? 'Usuário ou URL'}
                                        maxLength={500}
                                        onChange={(event) => updateEditingLink('url', event.target.value)}
                                        placeholder={editingLinkInputConfig?.placeholder ?? ''}
                                        prefix={editingLinkInputConfig?.prefix ?? ''}
                                        value={editingLink.url ?? ''}
                                    />
                                    <TextField label="Descrição" maxLength={255} onChange={(event) => updateEditingLink('description', event.target.value)} value={editingLink.description ?? ''} />

                                    <div className="rounded-2xl border border-[#e8dece] bg-[#fcfaf5] px-3 py-3 sm:px-4">
                                        <p className="text-sm font-semibold text-stone-900">Ícone do botão</p>
                                        <p className="mt-1 text-sm text-stone-500">O ícone acompanha a rede social selecionada e não pode ser alterado manualmente.</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-stone-100">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                                                <LinkBubbleGlyph icon={editingLink.icon} />
                                            </span>
                                            <span className="text-sm font-medium text-stone-800">{getPlatformOption(editingLink.platform ?? 'website').name}</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                                        <div className="flex items-center justify-between rounded-2xl border border-[#e8dece] px-3 py-3 sm:px-4">
                                            <div>
                                                <p className="text-sm font-semibold text-stone-900">Link ativo</p>
                                                <p className="text-sm text-stone-500">Mostrar este link na página pública.</p>
                                            </div>
                                            <Toggle checked={Boolean(editingLink.is_active)} onChange={() => updateEditingLink('is_active', !editingLink.is_active)} />
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl border border-[#e8dece] px-3 py-3 sm:px-4">
                                            <div>
                                                <p className="text-sm font-semibold text-stone-900">Link em destaque</p>
                                                <p className="text-sm text-stone-500">Usar destaque visual na prévia e na página.</p>
                                            </div>
                                            <Toggle checked={Boolean(editingLink.is_featured)} onChange={() => updateEditingLink('is_featured', !editingLink.is_featured)} />
                                        </div>
                                    </div>
                                </div>
                                    </div>

                                    <div className="shrink-0 border-t border-[#efe7d9] px-3 py-3 sm:px-6 sm:py-4">
                                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                                        <button className="inline-flex w-full items-center justify-center rounded-2xl border border-[#e3d9c8] bg-white px-5 py-3 text-sm font-medium text-stone-900 sm:w-auto" onClick={cancelEditingLink} type="button">
                                            Cancelar
                                        </button>
                                        <button className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f5c3f] px-5 py-3 text-sm font-medium text-white sm:w-auto" onClick={() => void saveLink(editingLink)} type="button">
                                            Salvar link
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </section>
            </div>
        </main>
    );
}

function baseIcon(props) {
    return {
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 1.8,
        viewBox: '0 0 24 24',
        ...props,
    };
}

function SparkIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
        </svg>
    );
}

function GridIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="4" y="4" width="6" height="6" rx="1.2" />
            <rect x="14" y="4" width="6" height="6" rx="1.2" />
            <rect x="4" y="14" width="6" height="6" rx="1.2" />
            <rect x="14" y="14" width="6" height="6" rx="1.2" />
        </svg>
    );
}

function ChainIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M10.5 13.5l3-3" />
            <path d="M8 16a3.5 3.5 0 010-5l2-2a3.5 3.5 0 015 5l-.5.5" />
            <path d="M16 8a3.5 3.5 0 010 5l-2 2a3.5 3.5 0 01-5-5l.5-.5" />
        </svg>
    );
}

function PaletteIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M12 4a8 8 0 100 16h1.5A2.5 2.5 0 0016 17.5 2.5 2.5 0 0118.5 15H20a2 2 0 002-2 9 9 0 00-10-9z" />
            <circle cx="7.5" cy="11" r="1" />
            <circle cx="10.5" cy="8" r="1" />
            <circle cx="14.5" cy="8.5" r="1" />
        </svg>
    );
}

function PageIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M8 3h7l4 4v14H8z" />
            <path d="M15 3v4h4" />
            <path d="M11 12h5" />
            <path d="M11 16h5" />
        </svg>
    );
}

function GlobeIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a15 15 0 010 18" />
            <path d="M12 3a15 15 0 000 18" />
        </svg>
    );
}

function QrIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="4" y="4" width="6" height="6" rx="1" />
            <rect x="14" y="4" width="6" height="6" rx="1" />
            <rect x="4" y="14" width="6" height="6" rx="1" />
            <path d="M15 15h1v1h-1zM18 15h2v2h-2zM14 18h2v2h-2zM18 19h2" />
        </svg>
    );
}

function UsersIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <circle cx="9" cy="8" r="3" />
            <path d="M4 19a5 5 0 0110 0" />
            <path d="M17 11a2.5 2.5 0 100-5" />
            <path d="M19 19a4 4 0 00-3-3.8" />
        </svg>
    );
}

function BarChartIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M5 20V9" />
            <path d="M12 20V4" />
            <path d="M19 20v-7" />
        </svg>
    );
}

function SettingsIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.2.6.8 1 1.5 1h.2a2 2 0 010 4H21a1.7 1.7 0 00-1.6 1z" />
        </svg>
    );
}

function ArrowRightIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
        </svg>
    );
}

function CheckIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M5 12l4 4L19 6" />
        </svg>
    );
}

function ExternalLinkIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M14 5h5v5" />
            <path d="M10 14L19 5" />
            <path d="M19 13v6H5V5h6" />
        </svg>
    );
}

function ShareIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M12 16V4" />
            <path d="M8 8l4-4 4 4" />
            <path d="M5 14v5h14v-5" />
        </svg>
    );
}

function LogoutIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M14 5H6v14h8" />
            <path d="M10 12h10" />
            <path d="M17 9l3 3-3 3" />
        </svg>
    );
}

function ChevronDownIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

function ChevronRightIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M9 6l6 6-6 6" />
        </svg>
    );
}

function ChevronLeftIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M15 6l-6 6 6 6" />
        </svg>
    );
}

function HouseMarkIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M5.5 19V9.5L12 4l6.5 5.5V19" />
            <path d="M8.5 19v-6.5L12 9l3.5 3.5V19" />
            <path d="M12 9v10" />
            <path d="M9 15.5l3-3 3 3" />
        </svg>
    );
}

function PlusIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
}

function GripDotsIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <circle cx="9" cy="7" r="1" />
            <circle cx="15" cy="7" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="9" cy="17" r="1" />
            <circle cx="15" cy="17" r="1" />
        </svg>
    );
}

function PencilIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
    );
}

function TrashIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    );
}

function CalendarIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
    );
}

function PhoneIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="8" y="3" width="8" height="18" rx="2" />
            <path d="M11 18h2" />
        </svg>
    );
}

function MonitorIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="3" y="5" width="18" height="12" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    );
}

function InstagramIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <circle cx="12" cy="12" r="3.5" />
            <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function WhatsAppGlyph(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M20 11.6A8 8 0 006.6 5.8a7.9 7.9 0 00-2 8l-1.1 4 4.1-1a8 8 0 0012.4-5.2z" />
            <path d="M9.2 8.8c.2-.4.4-.4.7-.4h.6c.2 0 .5 0 .7.5.2.5.9 2.1 1 2.2.1.2.2.4 0 .7-.2.3-.3.5-.5.6-.2.2-.4.4-.2.7.2.4 1 1.5 2.3 2.1 1.6.8 1.6.5 1.9.5.3 0 .9-.4 1-.8.1-.4.1-.8 0-.9" />
        </svg>
    );
}

function ImageGlyph(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.4" />
            <path d="M7 16l3.5-3.5L13 15l3-3 2 4" />
        </svg>
    );
}

function BagIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M7 9h10l-.8 10H7.8L7 9z" />
            <path d="M9 9V7a3 3 0 016 0v2" />
        </svg>
    );
}

function PinIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M12 21s6-5.6 6-11a6 6 0 10-12 0c0 5.4 6 11 6 11z" />
            <circle cx="12" cy="10" r="2.2" />
        </svg>
    );
}

function PinterestIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M12 20c-4.4 0-8-3.6-8-8a8 8 0 1114.7 4.2c-1.2 1.7-3 2.8-5.2 2.8-1 0-1.9-.4-2.5-1l-.8 3.2" />
            <path d="M10.7 9.8c0-1.5 1.1-2.8 2.7-2.8 1.4 0 2.4 1 2.4 2.5 0 2.2-1.1 4.8-3.2 4.8-1 0-1.8-.8-1.6-1.8l.6-2.7" />
        </svg>
    );
}

function MailIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M4 8l8 6 8-6" />
        </svg>
    );
}

function CopyIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect x="9" y="9" width="10" height="10" rx="2" />
            <rect x="5" y="5" width="10" height="10" rx="2" />
        </svg>
    );
}

function EyeIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
            <circle cx="12" cy="12" r="2.5" />
        </svg>
    );
}

function CursorIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M6 4l11 8-5 1 2 5-2 1-2-5-4 3z" />
        </svg>
    );
}

function TrendIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <path d="M4 18V6" />
            <path d="M4 18h16" />
            <path d="M8 14l3-3 3 2 4-5" />
        </svg>
    );
}

function LockIcon(props) {
    return (
        <svg {...baseIcon(props)}>
            <rect fill="none" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" width="10" x="7" y="10" />
            <path d="M9.5 10V8a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
    );
}
