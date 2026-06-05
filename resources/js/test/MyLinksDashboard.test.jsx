import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyLinksDashboard from '../MyLinksDashboard';

const initialData = {
    user: {
        name: 'Cafe Botanico',
        email: 'cafe@example.com',
    },
    page: {
        id: 1,
        name: 'Cafe Botanico',
        slug: 'cafe-botanico',
        handle: '@cafebotanico',
        headline: 'Seu link-in-bio profissional pronto para vender',
        bio: 'Cafe especial, brunch e delivery local com foco em relacionamento.',
        location: 'Aracatuba, SP',
        theme: 'mylinks',
        selected_theme_id: null,
        background_type: 'image',
        background_value: 'upload',
        background_image_url: null,
        button_style: 'solid',
        button_radius: 'rounded',
        button_color: '#FFFFFF',
        button_text_color: '#111827',
        whatsapp_number: '5511999999999',
        profile_image_url: null,
        social_links: {
            instagram: 'https://instagram.com/cafebotanico',
            pinterest: '',
            email: 'mailto:cafe@example.com',
        },
        plan: 'pro',
        onboarding_completed: true,
        is_published: true,
    },
    links: [
        {
            id: 1,
            platform: 'whatsapp',
            title: 'Pedir no WhatsApp',
            url: 'https://wa.me/5511999999999',
            description: 'Atendimento rápido com resposta em minutos',
            icon: 'WA',
            is_active: true,
            is_featured: true,
        },
        {
            id: 2,
            platform: 'website',
            title: 'Cardápio da Semana',
            url: 'https://example.com/cardapio',
            description: 'Novidades, combos e especiais do dia',
            icon: 'ME',
            is_active: true,
            is_featured: false,
        },
    ],
    analytics: {
        range: '7d',
        visits: '18',
        visitsDelta: '↑ 12,5% vs. período anterior',
        linkViews: '36',
        linkViewsDelta: '↑ 20,0% vs. período anterior',
        clicks: '12',
        clicksDelta: '↑ 9,1% vs. período anterior',
        whatsapp: '5',
        activeLinks: '2',
        ctr: '6,0%',
        ctrDelta: '↑ 0,8 p.p. vs. período anterior',
        topLinks: [
            { id: 1, title: 'Pedir no WhatsApp', clicks: 8 },
            { id: 2, title: 'Cardápio da Semana', clicks: 4 },
        ],
    },
    billing: {
        publishable_key: 'pk_test_123',
        checkout_links: {
            monthly: 'https://buy.stripe.com/test_monthly',
            annual: 'https://buy.stripe.com/test_annual',
        },
        stripe_mode: 'test',
    },
    routes: {
        onboardingSlugAvailability: '/dashboard/onboarding/slug-availability',
        syncOnboarding: '/dashboard/onboarding/sync',
        completeOnboarding: '/dashboard/onboarding/complete',
        updatePage: '/dashboard/page',
        uploadProfileImage: '/dashboard/page/profile-image',
        uploadBackgroundImage: '/dashboard/page/background-image',
        createSubscriptionIntent: '/dashboard/billing/subscription-intent',
        storeLink: '/dashboard/links',
        analytics: '/dashboard/analytics',
        reorderLinks: '/dashboard/links/reorder',
        logout: '/logout',
        landing: '/',
        publicPage: '/cafe-botanico',
    },
};

describe('MyLinksDashboard', () => {
    beforeEach(() => {
        document.head.innerHTML = '<meta name="csrf-token" content="test-token">';
        global.fetch = vi.fn();
    });

    test('renders the main dashboard screen', () => {
        render(<MyLinksDashboard initialData={initialData} />);

        expect(screen.getByRole('heading', { name: 'Editar página' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Salvar página' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver página' })).toHaveAttribute('href', 'http://localhost:3000/cafe-botanico');
        expect(screen.getByRole('link', { name: 'Junte-se a @cafebotanico no MyLinks' })).toHaveAttribute('href', '/');
    });

    test('updates profile fields and reflects them in the mobile preview', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.clear(screen.getByRole('textbox', { name: /^Nome$/i }));
        await user.type(screen.getByRole('textbox', { name: /^Nome$/i }), 'Studio Flora');

        await user.clear(screen.getByRole('textbox', { name: /^Bio$/i }));
        await user.type(screen.getByRole('textbox', { name: /^Bio$/i }), 'Marca botanica com foco em presentes.');

        expect(screen.getAllByText('Studio Flora').length).toBeGreaterThan(0);
        expect(screen.getByRole('textbox', { name: /^Bio$/i })).toHaveValue('Marca botanica com foco em presentes.');
    });

    test('saves the profile through the backend endpoint', async () => {
        const user = userEvent.setup();

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Página atualizada com sucesso.',
                page: {
                    ...initialData.page,
                    name: 'Studio Flora',
                    slug: 'studio-flora',
                },
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        await user.clear(screen.getByLabelText(/Nome/i));
        await user.type(screen.getByLabelText(/Nome/i), 'Studio Flora');
        await user.click(screen.getByRole('button', { name: 'Salvar página' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/dashboard/page',
                expect.objectContaining({
                    method: 'PUT',
                }),
            );
        });

        await waitFor(() => {
            expect(screen.getByRole('link', { name: 'Ver página' })).toHaveAttribute('href', 'http://localhost:3000/studio-flora');
        });
    });

    test('adds a link and renders it in the editor', async () => {
        const user = userEvent.setup();

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Link criado com sucesso.',
                link: {
                    id: 9,
                    platform: 'website',
                    title: 'Website',
                    url: 'https://seusite.com',
                    description: 'Direcione para seu site principal.',
                    icon: 'WB',
                    is_active: true,
                    is_featured: false,
                },
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Adicionar link' }));

        expect(await screen.findByRole('heading', { name: 'Editar link' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Título' })).toHaveValue('Website');
        expect(global.fetch).toHaveBeenCalledWith(
            '/dashboard/links',
            expect.objectContaining({
                method: 'POST',
            }),
        );
    });

    test('updates the profile image src after uploading a new image', async () => {
        const user = userEvent.setup();
        const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Imagem de perfil atualizada com sucesso.',
                page: {
                    ...initialData.page,
                    profile_image_url: '/page-images/1?v=1717600000',
                },
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        const input = document.querySelector('input[type="file"][accept="image/png,image/jpeg,image/jpg,image/webp"]');
        await user.upload(input, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/dashboard/page/profile-image',
                expect.objectContaining({
                    method: 'POST',
                }),
            );
        });

        expect(screen.getAllByAltText('Cafe Botanico')[0]).toHaveAttribute('src', '/page-images/1?v=1717600000');
    });

    test('falls back to the default avatar when the profile image fails to load', () => {
        const brokenImageData = {
            ...initialData,
            page: {
                ...initialData.page,
                profile_image_url: '/page-images/1?v=broken',
            },
        };

        render(<MyLinksDashboard initialData={brokenImageData} />);

        const avatar = screen.getAllByAltText('Cafe Botanico')[0];
        fireEvent.error(avatar);

        expect(avatar).toHaveAttribute('src', '/blank-avatar.svg');
    });

    test('toggles a link and removes it from the preview when it becomes inactive', async () => {
        const user = userEvent.setup();

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Link atualizado com sucesso.',
                link: {
                    ...initialData.links[1],
                    is_active: false,
                },
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        expect(screen.getByDisplayValue('Cardápio da Semana')).toBeInTheDocument();

        const editorCard = screen.getAllByDisplayValue('Cardápio da Semana')[0].closest('article');
        const activeToggle = within(editorCard).getByRole('button', { pressed: true });

        await user.click(activeToggle);

        await waitFor(() => {
            expect(screen.queryByText('Cardápio da Semana')).not.toBeInTheDocument();
        });
    });

    test('deletes a link and removes it from the editor list', async () => {
        const user = userEvent.setup();

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Link removido com sucesso.',
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Excluir Pedir no WhatsApp' }));

        await waitFor(() => {
            expect(screen.queryAllByDisplayValue('Pedir no WhatsApp')).toHaveLength(0);
        });
    });

    test('loads analytics for a different period', async () => {
        const user = userEvent.setup();

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                analytics: {
                    range: '30d',
                    visits: '120',
                    visitsDelta: '↑ 10,0% vs. período anterior',
                    linkViews: '240',
                    linkViewsDelta: '↑ 10,0% vs. período anterior',
                    clicks: '42',
                    clicksDelta: '↑ 31,3% vs. período anterior',
                    whatsapp: '14',
                    activeLinks: '2',
                    ctr: '21,0%',
                    ctrDelta: '↑ 2,5 p.p. vs. período anterior',
                    topLinks: [{ id: 1, title: 'Pedir no WhatsApp', clicks: 18 }],
                },
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        await user.selectOptions(screen.getByRole('combobox'), '30d');

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/dashboard/analytics?range=30d',
                expect.objectContaining({ credentials: 'same-origin' }),
            );
        });

        expect(await screen.findByText('42')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveValue('30d');
    });

    test('shows animated upgrade state and locked statistics on the free plan', () => {
        const freePlanData = {
            ...initialData,
            page: {
                ...initialData.page,
                plan: 'free',
            },
        };

        render(<MyLinksDashboard initialData={freePlanData} />);

        expect(screen.getByText('Faça upgrade para desbloquear estatísticas e recursos extras.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Fazer upgrade' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Leads/i })).toBeDisabled();
        expect(screen.getAllByRole('button', { name: /Estatísticas/i })[0]).toBeDisabled();
        expect(screen.getByLabelText('Leads bloqueado')).toBeInTheDocument();
        expect(screen.getByLabelText('Estatísticas bloqueado')).toBeInTheDocument();
        expect(screen.getByText('Estatísticas bloqueadas no plano free')).toBeInTheDocument();
    });

    test('reorders links by drag and drop and persists the new order', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Ordem dos links atualizada com sucesso.',
                links: [
                    { ...initialData.links[1], sort_order: 1 },
                    { ...initialData.links[0], sort_order: 2 },
                ],
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        const firstCard = screen.getAllByDisplayValue('Pedir no WhatsApp')[0].closest('article');
        const secondCard = screen.getAllByDisplayValue('Cardápio da Semana')[0].closest('article');

        fireEvent.dragStart(firstCard);
        fireEvent.dragOver(secondCard);
        fireEvent.drop(secondCard);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/dashboard/links/reorder',
                expect.objectContaining({ method: 'POST' }),
            );
        });

        expect(global.fetch).toHaveBeenCalledWith(
            '/dashboard/links/reorder',
            expect.objectContaining({ method: 'POST' }),
        );
    });

    test('opens the link editor modal from the menu list', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Links' }));
        await user.click(screen.getByRole('button', { name: 'Editar Pedir no WhatsApp' }));

        expect(screen.getByRole('heading', { name: 'Editar link' })).toBeInTheDocument();
        expect(screen.getByText('wa.me/')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Número do WhatsApp' })).toHaveValue('5511999999999');
    });

    test('updates the preview title while editing a link in the modal', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Links' }));
        await user.click(screen.getByRole('button', { name: 'Editar Cardápio da Semana' }));

        await user.clear(screen.getByRole('textbox', { name: 'Título' }));
        await user.type(screen.getByRole('textbox', { name: 'Título' }), 'Reservas VIP');

        expect(screen.getByText('Reservas VIP')).toBeInTheDocument();
    });

    test('shows validation feedback inside the link modal', async () => {
        const user = userEvent.setup();

        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                message: 'O campo título é obrigatório.',
                errors: {
                    title: ['O campo título é obrigatório.'],
                },
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Links' }));
        await user.click(screen.getByRole('button', { name: 'Editar Cardápio da Semana' }));
        await user.clear(screen.getByRole('textbox', { name: 'Título' }));
        await user.click(screen.getByRole('button', { name: 'Salvar link' }));

        expect((await screen.findAllByText('O campo título é obrigatório.')).length).toBeGreaterThan(0);
    });

    test('sends boolean fields as real booleans when saving a link', async () => {
        const user = userEvent.setup();

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Link atualizado com sucesso.',
                link: {
                    ...initialData.links[0],
                    is_active: true,
                    is_featured: false,
                },
            }),
        });

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Links' }));
        await user.click(screen.getByRole('button', { name: 'Editar Pedir no WhatsApp' }));
        await user.click(screen.getByRole('button', { name: 'Salvar link' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/dashboard/links/1',
                expect.objectContaining({
                    method: 'PUT',
                }),
            );
        });

        const updateCall = global.fetch.mock.calls.find(([url, options]) => url === '/dashboard/links/1' && options?.method === 'PUT');
        const body = JSON.parse(updateCall[1].body);

        expect(typeof body.is_active).toBe('boolean');
        expect(typeof body.is_featured).toBe('boolean');
    });

    test('updates icon and url behavior when changing the social platform', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Links' }));
        await user.click(screen.getByRole('button', { name: 'Editar Cardápio da Semana' }));
        await user.type(screen.getByRole('textbox', { name: 'Buscar rede social' }), 'Tik');
        await user.click(screen.getByRole('button', { name: /TikTok/i }));
        await user.clear(screen.getByRole('textbox', { name: 'Usuário ou URL' }));
        await user.type(screen.getByRole('textbox', { name: 'Usuário ou URL' }), '@meuperfil');

        expect(screen.getAllByText('TikTok').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Cardápio da Semana').length).toBeGreaterThan(0);
        expect(screen.getByRole('textbox', { name: 'Usuário ou URL' })).toHaveValue('@meuperfil');
    });

    test('shows username-only fields for instagram and youtube', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Links' }));
        await user.click(screen.getByRole('button', { name: 'Editar Cardápio da Semana' }));
        await user.click(screen.getByRole('button', { name: /Instagram/i }));

        const instagramField = screen.getByRole('textbox', { name: 'Username do Instagram' });
        expect(screen.getByText('instagram.com/')).toBeInTheDocument();
        expect(instagramField).toHaveAttribute('placeholder', 'username');

        await user.click(screen.getByRole('button', { name: /YouTube/i }));

        const youtubeField = screen.getByRole('textbox', { name: 'Username do YouTube' });
        expect(screen.getByText('youtube.com/@')).toBeInTheDocument();
        expect(youtubeField).toHaveAttribute('placeholder', 'username');
    });

    test('allows switching the background to a solid color in appearance', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Aparência' }));
        await user.click(screen.getByRole('button', { name: /Plano de fundo/i }));
        await user.click(screen.getByRole('button', { name: 'Cor sólida' }));

        expect(screen.getByLabelText('Cor do plano de fundo')).toHaveValue('#456b5b');
    });

    test('shows the same onboarding theme presets in appearance', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Aparência' }));
        await user.click(screen.getByRole('button', { name: /Tema/i }));

        expect(screen.getByRole('button', { name: /Jesse Jordan/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sergey Amir/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ella Vibe/i })).toBeInTheDocument();
    });

    test('locks theme cards outside the first row on the free plan', async () => {
        const user = userEvent.setup();
        const freePlanData = {
            ...initialData,
            page: {
                ...initialData.page,
                plan: 'free',
            },
        };

        render(<MyLinksDashboard initialData={freePlanData} />);

        await user.click(screen.getByRole('button', { name: 'Aparência' }));
        await user.click(screen.getByRole('button', { name: /Tema/i }));

        expect(screen.getByRole('button', { name: /Jesse Jordan/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Mindy Frauke/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Lowell Maxwell/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Sergey Amir/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Ella Vibe/i })).toBeDisabled();
        expect(screen.getByLabelText('Sergey Amir bloqueado')).toBeInTheDocument();
    });

    test('opens the upgrade checkout screen from the free-plan banner', async () => {
        const user = userEvent.setup();
        const freePlanData = {
            ...initialData,
            page: {
                ...initialData.page,
                plan: 'free',
            },
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                client_secret: 'seti_test_secret',
                publishable_key: 'pk_test_123',
                subscription_id: 'sub_test_123',
            }),
        });

        render(<MyLinksDashboard initialData={freePlanData} />);

        await user.click(screen.getByRole('button', { name: 'Fazer upgrade' }));

        expect(screen.getByRole('heading', { name: 'Escolha seu plano Pro' })).toBeInTheDocument();
        expect(screen.getByText('Ciclo de cobrança')).toBeInTheDocument();
        expect(screen.getByText('Seu plano de teste')).toBeInTheDocument();
        expect(screen.getByText('Digite seu cartão aqui')).toBeInTheDocument();
        expect(await screen.findByTestId('payment-element')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Abrir checkout hospedado do Stripe' })).toHaveAttribute('href', 'https://buy.stripe.com/test_annual');
    });

    test('updates button appearance controls and reflects them in the preview', async () => {
        const user = userEvent.setup();

        render(<MyLinksDashboard initialData={initialData} />);

        await user.click(screen.getByRole('button', { name: 'Aparência' }));
        await user.click(screen.getByRole('button', { name: /Botões/i }));
        await user.click(screen.getByRole('button', { name: 'Contorno' }));
        await user.click(screen.getByRole('button', { name: 'Pílula' }));
        fireEvent.change(screen.getByLabelText('Cor do botão'), { target: { value: '#123456' } });
        fireEvent.change(screen.getByLabelText('Cor do texto do botão'), { target: { value: '#fefefe' } });

        const previewButton = screen.getByRole('button', { name: 'Pedir no WhatsApp' });

        expect(previewButton.getAttribute('style')).toContain('border-radius: 999px');
        expect(previewButton.getAttribute('style')).toContain('background-color: transparent');
        expect(previewButton.getAttribute('style')).toContain('border: 2px solid rgb(18, 52, 86)');
    });

    test('syncs onboarding theme selection before finishing the flow', async () => {
        const user = userEvent.setup();
        const onboardingData = {
            ...initialData,
            page: {
                ...initialData.page,
                onboarding_completed: false,
                theme: 'mylinks',
            },
            links: [],
        };

        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    available: true,
                    slug: 'cafe-botanico',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    message: 'Configuração do onboarding sincronizada com sucesso.',
                    page: {
                        ...onboardingData.page,
                        theme: 'graphite',
                    },
                    links: [],
                }),
            });

        render(<MyLinksDashboard initialData={onboardingData} />);

        await user.click(screen.getByRole('button', { name: 'Continuar' }));
        expect(await screen.findByRole('heading', { name: 'Selecione um tema' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Jesse Jordan/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/dashboard/onboarding/sync',
                expect.objectContaining({
                    method: 'PUT',
                    body: expect.stringContaining('"theme":"graphite"'),
                }),
            );
        });
    });
});
