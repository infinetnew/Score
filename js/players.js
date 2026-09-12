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

    const { data, error } = await supabaseClient
        .from('score_players')
        .select('id, name, role, team, price')
        .eq('available', true)
        .eq('role', role)
        .order('price', { ascending: false });

    if (error) {
        console.error('Errore caricamento giocatori:', error);
        container.innerHTML = 'Errore nel caricamento dei giocatori.';
        return;
    }

    container.innerHTML = '';

    data.forEach(player => {

        const row = document.createElement('div');

        row.innerHTML = `
            <strong>${player.name}</strong>
            - ${player.team}
            - ${player.price} crediti
        `;

        container.appendChild(row);
    });
}

document.getElementById('open_market').addEventListener('click', openMarket);
