function openMarket() {
    document.getElementById('app').style.display = 'block';

    const marketScreen = document.getElementById('market_screen');

    marketScreen.style.display = 'flex';
}


function closeMarket() {
    const marketScreen = document.getElementById('market_screen');

    if (marketScreen) {
        marketScreen.style.display = 'none';
    }

    document.getElementById('app').style.display = 'block';
}

async function showPlayersByRole(role) {

    const container = document.getElementById('market_role_players');

    const roleButton = document.querySelector(
        `.market-section-button[onclick="showPlayersByRole('${role}')"]`
    );

    // Se clicco di nuovo sullo stesso ruolo, chiudo l'elenco
    if (container.dataset.openRole === role) {
        container.innerHTML = '';
        container.dataset.openRole = '';
        return;
    }

    // Sposta l'elenco immediatamente sotto il pulsante cliccato
    roleButton.after(container);

    // Apro il nuovo ruolo
    container.dataset.openRole = role;
    container.innerHTML = 'Caricamento...';

    // Recupera la giornata attualmente attiva
    const { data: matchday, error: matchdayError } =
        await supabaseClient.rpc('score_get_active_matchday');

    if (matchdayError || !matchday) {
        console.error('Errore recupero giornata attiva:', matchdayError);
        container.innerHTML = 'Nessuna giornata attiva.';
        return;
    }

    // Carica i giocatori del ruolo
    const { data: players, error: playersError } = await supabaseClient
        .from('score_players')
        .select('id, name, role, team, price')
        .eq('available', true)
        .eq('role', role)
        .order('price', { ascending: false });

    if (playersError) {
        console.error('Errore caricamento giocatori:', playersError);
        container.innerHTML = 'Errore nel caricamento dei giocatori.';
        return;
    }

    // Giocatori già acquistati da QUALSIASI utente
    const { data: purchases, error: purchasesError } =
        await supabaseClient.rpc(
            'score_get_purchased_players',
            { p_matchday: matchday }
        );

    if (purchasesError) {
        console.error('Errore controllo giocatori acquistati:', purchasesError);
        container.innerHTML = 'Errore nel controllo dei giocatori disponibili.';
        return;
    }

    // Giocatori acquistati da QUESTO utente
    const { data: myPurchases, error: myPurchasesError } =
        await supabaseClient.rpc(
            'score_get_my_purchases',
            { p_matchday: matchday }
        );

    if (myPurchasesError) {
        console.error('Errore caricamento tuoi acquisti:', myPurchasesError);
        container.innerHTML = 'Errore nel caricamento dei tuoi acquisti.';
        return;
    }

    // Controlla se l'utente ha già acquistato questo ruolo
    const alreadyHaveRole = myPurchases.some(
        purchase => purchase.role === role
    );

    if (alreadyHaveRole) {
        container.innerHTML =
            'Hai già acquistato un giocatore per questo ruolo.';
        return;
    }

    // Elimina i giocatori già acquistati nella giornata corrente
    const purchasedPlayerIds = new Set(
        purchases.map(purchase => purchase.player_id)
    );

    const availablePlayers = players.filter(
        player => !purchasedPlayerIds.has(player.id)
    );

    container.innerHTML = '';

    availablePlayers.forEach(player => {

        const row = document.createElement('div');

row.style.cursor = 'pointer';
row.style.padding = '14px';
row.style.marginBottom = '8px';
row.style.border = '1px solid rgba(255,255,255,0.12)';
row.style.borderRadius = '12px';
row.style.background = 'rgba(255,255,255,0.05)';
row.style.color = 'white';

        row.innerHTML = `
            <strong>${player.name}</strong>
            - ${player.team}
            - ${player.price}
        `;

        row.addEventListener('click', () => {
            buyPlayer(player);
        });

        container.appendChild(row);
    });

    if (availablePlayers.length === 0) {
        container.innerHTML = 'Nessun giocatore disponibile.';
    }
}
async function buyPlayer(player) {

    const modal = document.getElementById('purchase_modal');
    const title = document.getElementById('purchase_title');
    const message = document.getElementById('purchase_message');
    const buttons = document.getElementById('purchase_buttons');
    const cancelButton = document.getElementById('purchase_cancel');
    const confirmButton = document.getElementById('purchase_confirm');

    // Mostra conferma acquisto
    title.textContent = '🛒 CONFERMA ACQUISTO';

    message.innerHTML =
        `Vuoi acquistare <strong>${player.name}</strong>?<br><br>` +
        `Prezzo: <strong>${player.price} crediti</strong>`;
    confirmButton.disabled = false;
    confirmButton.textContent = 'ACQUISTA';

    buttons.style.display = 'flex';
    cancelButton.style.display = 'block';
    confirmButton.style.display = 'block';

    modal.style.display = 'flex';

    // Annulla
    cancelButton.onclick = () => {
        modal.style.display = 'none';
    };

    // Conferma
    confirmButton.onclick = async () => {

        confirmButton.disabled = true;
        confirmButton.textContent = 'ACQUISTO...';

        // Recupera la giornata attualmente attiva
        const { data: matchday, error: matchdayError } =
            await supabaseClient.rpc('score_get_active_matchday');

        if (matchdayError || !matchday) {

            console.error(
                'Errore recupero giornata attiva:',
                matchdayError
            );

            title.textContent = '⚠️ ERRORE';
            message.textContent = 'Nessuna giornata attiva.';
            buttons.style.display = 'none';

            setTimeout(() => {
                modal.style.display = 'none';
            }, 1800);

            return;
        }

        // Acquista il giocatore
        const { data, error } = await supabaseClient.rpc(
            'score_buy_player',
            {
                p_player_id: player.id,
                p_matchday: matchday
            }
        );

        if (error) {

            console.error('Errore acquisto:', error);

            title.textContent = '⚠️ ACQUISTO NON RIUSCITO';
            message.textContent = error.message;
            buttons.style.display = 'none';

            setTimeout(() => {
                modal.style.display = 'none';
            }, 2200);

            return;
        }

        // Acquisto completato
        title.textContent = '✅ ACQUISTO COMPLETATO';

        message.innerHTML =
            `<strong>${player.name}</strong> è stato acquistato!<br><br>` +
            `Prezzo: <strong>${data.price} crediti</strong><br>` +
            `Crediti rimasti: <strong>${data.remaining_credits}</strong>`;

        buttons.style.display = 'none';

        loadCredits();

        setTimeout(() => {

            modal.style.display = 'none';

            showPlayersByRole(player.role);

        }, 1800);
    };
}


document.getElementById('open_market').addEventListener('click', openMarket);
