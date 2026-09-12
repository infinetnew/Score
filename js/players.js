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

    // Carica tutti i giocatori disponibili del ruolo
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

    // Carica i giocatori già acquistati nella giornata 1
    const { data: purchases, error: purchasesError } = await supabaseClient
        .from('score_purchases')
        .select('player_id')
        .eq('matchday', 1);

    if (purchasesError) {
        console.error('Errore caricamento acquisti:', purchasesError);
        container.innerHTML = 'Errore nel controllo dei giocatori acquistati.';
        return;
    }

    // Creiamo un elenco degli ID già acquistati
    const purchasedPlayerIds = new Set(
        purchases.map(purchase => purchase.player_id)
    );

    // Mostriamo solamente i giocatori ancora liberi
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

    const { data, error } = await supabaseClient.rpc(
        'score_buy_player',
        {
            p_player_id: player.id,
            p_matchday: 1
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
