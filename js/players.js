function openMarket() {
    document.getElementById('app').style.display = 'none';

    let marketPage = document.getElementById('market_page');

    if (!marketPage) {
        marketPage = document.createElement('div');
        marketPage.id = 'market_page';

        marketPage.innerHTML = `
            <h2>🛒 MERCATO GIOCATORI</h2>
            <p>Scegli un ruolo:</p>

            <button onclick="showPlayersByRole('P')">🧤 PORTIERI</button>
            <button onclick="showPlayersByRole('D')">🛡️ DIFENSORI</button>
            <button onclick="showPlayersByRole('C')">⚙️ CENTROCAMPISTI</button>
            <button onclick="showPlayersByRole('A')">⚽ ATTACCANTI</button>

            <div id="role_players"></div>

            <br>
            <button onclick="closeMarket()">← TORNA ALLA HOME</button>
        `;

        document.body.appendChild(marketPage);
    }

    marketPage.style.display = 'block';
}


function closeMarket() {
    const marketPage = document.getElementById('market_page');

    if (marketPage) {
        marketPage.style.display = 'none';
    }

    document.getElementById('app').style.display = 'block';
}

async function showPlayersByRole(role) {

    const container = document.getElementById('role_players');

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
        row.style.padding = '8px';
        row.style.borderBottom = '1px solid #ddd';

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

    const confirmPurchase = confirm(
        `Vuoi acquistare ${player.name} per ${player.price}?`
    );

    if (!confirmPurchase) {
        return;
    }

    // Recupera la giornata attualmente attiva
    const { data: matchday, error: matchdayError } =
        await supabaseClient.rpc('score_get_active_matchday');

    if (matchdayError || !matchday) {
        console.error('Errore recupero giornata attiva:', matchdayError);
        alert('Nessuna giornata attiva.');
        return;
    }

    const { data, error } = await supabaseClient.rpc(
        'score_buy_player',
        {
            p_player_id: player.id,
            p_matchday: matchday
        }
    );

    if (error) {
        console.error('Errore acquisto:', error);
        alert(error.message);
        return;
    }

    alert(
        `${player.name} acquistato!\n\n` +
        `Prezzo: ${data.price}\n` +
        `Crediti rimasti: ${data.remaining_credits}`
    );

    loadCredits();

    showPlayersByRole(player.role);
}


document.getElementById('open_market').addEventListener('click', openMarket);
