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
        .select('id, name, role, team, price, team_logo')
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

// ========================================
// CONTROLLA LA COMPOSIZIONE DELLA SQUADRA
// ========================================

const starterPurchases = myPurchases.filter(
    purchase => purchase.slot_type === 'starter'
);

const reservePurchases = myPurchases.filter(
    purchase => purchase.slot_type === 'reserve'
);

const totalPlayers = starterPurchases.length;

const countP = starterPurchases.filter(
    purchase => purchase.role === 'P'
).length;

const countD = starterPurchases.filter(
    purchase => purchase.role === 'D'
).length;

const countC = starterPurchases.filter(
    purchase => purchase.role === 'C'
).length;

const countA = starterPurchases.filter(
    purchase => purchase.role === 'A'
).length;

const reserveCountP = reservePurchases.filter(
    purchase => purchase.role === 'P'
).length;

const reserveCountOutfield = reservePurchases.filter(
    purchase => ['D', 'C', 'A'].includes(purchase.role)
).length;


// ========================================
// SQUADRA COMPLETA
// ========================================

if (totalPlayers >= 5) {

    if (reservePurchases.length >= 2) {
        container.innerHTML = 'Hai già acquistato le 2 riserve disponibili.';
        return;
    }

    if (role === 'P' && reserveCountP >= 1) {
        container.innerHTML = 'Hai già acquistato un portiere di riserva.';
        return;
    }

    if (
        ['D', 'C', 'A'].includes(role) &&
        reserveCountOutfield >= 1
    ) {
        container.innerHTML =
            'Hai già acquistato una riserva tra difensore, centrocampista o attaccante.';
        return;
    }

    // Le riserve sono acquistabili:
    // 1 P + 1 giocatore di movimento (D/C/A)
}


// ========================================
// QUINTO GIOCATORE
// ========================================

// Se abbiamo già i 4 ruoli base,
// il quinto può essere D, C oppure A.
// MAI P.

if (
    totalPlayers === 4 &&
    countP === 1 &&
    countD === 1 &&
    countC === 1 &&
    countA === 1
) {
    if (role === 'P') {
        container.innerHTML =
            'Il quinto giocatore può essere solo un difensore, un centrocampista o un attaccante.';
        return;
    }
}


// ========================================
// PRIMI 4 GIOCATORI
// ========================================

// Prima di completare i 4 ruoli base,
// non permettiamo un doppio ruolo.

if (totalPlayers < 4) {

    if (role === 'P' && countP >= 1) {
        container.innerHTML =
            'Hai già acquistato un portiere.';
        return;
    }

    if (role === 'D' && countD >= 1) {
        container.innerHTML =
            'Hai già acquistato un difensore.';
        return;
    }

    if (role === 'C' && countC >= 1) {
        container.innerHTML =
            'Hai già acquistato un centrocampista.';
        return;
    }

    if (role === 'A' && countA >= 1) {
        container.innerHTML =
            'Hai già acquistato un attaccante.';
        return;
    }
}


// ========================================
// LIMITI DEI RUOLI
// ========================================

if (totalPlayers < 5) {

    if (role === 'P' && countP >= 1) {
        container.innerHTML =
            'Puoi acquistare un solo portiere.';
        return;
    }

    if (role === 'D' && countD >= 2) {
        container.innerHTML =
            'Puoi acquistare al massimo due difensori.';
        return;
    }

    if (role === 'C' && countC >= 2) {
        container.innerHTML =
            'Puoi acquistare al massimo due centrocampisti.';
        return;
    }

    if (role === 'A' && countA >= 2) {
        container.innerHTML =
            'Puoi acquistare al massimo due attaccanti.';
        return;
    }
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

// Determina se è un titolare o una riserva
const { data: currentPurchases } =
    await supabaseClient.rpc(
        'score_get_my_purchases',
        {
            p_matchday: await supabaseClient.rpc(
                'score_get_active_matchday'
            ).then(result => result.data)
        }
    );

const starterCount = (currentPurchases || []).filter(
    purchase => purchase.slot_type === 'starter'
).length;

const isReserve = starterCount >= 5;

const slotLabel = isReserve
    ? `RISERVA – ${
        player.role === 'P'
            ? 'PORTIERE'
            : 'GIOCATORE DI MOVIMENTO'
      }`
    : 'TITOLARE';

// Mostra conferma acquisto
title.textContent = `🛒 ${slotLabel}`;

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

setTimeout(async () => {

    modal.style.display = 'none';

    // Se abbiamo appena acquistato il quinto titolare,
    // chiediamo se vuole procedere con le riserve
    if (data.slot_type === 'starter') {

        const { data: purchases } =
            await supabaseClient.rpc(
                'score_get_my_purchases',
                { p_matchday: matchday }
            );

        const starterCount = (purchases || []).filter(
            purchase => purchase.slot_type === 'starter'
        ).length;

if (starterCount === 5) {

    const reserveModal =
        document.getElementById('reserve_modal');

    const reserveYes =
        document.getElementById('reserve_yes');

    const reserveNo =
        document.getElementById('reserve_no');

    reserveModal.style.display = 'flex';

    reserveNo.onclick = () => {
        reserveModal.style.display = 'none';
    };

    reserveYes.onclick = () => {
        reserveModal.style.display = 'none';
        showPlayersByRole(player.role);
    };

    return;
}
    }

    showPlayersByRole(player.role);

}, 1800);
    };
}


document.getElementById('open_market').addEventListener('click', openMarket);
async function openMyPlayers() {

    const screen = document.getElementById('my_players_screen');
    const matchdayText = document.getElementById('my_players_matchday');
    const list = document.getElementById('my_players_list');

    const attackersContainer =
        document.getElementById('formation_attackers');

    const midfieldersContainer =
        document.getElementById('formation_midfielders');

    const defendersContainer =
        document.getElementById('formation_defenders');

    const goalkeeperContainer =
        document.getElementById('formation_goalkeeper');

    const reservesContainer =
        document.getElementById('formation_reserves');

    screen.style.display = 'flex';

    list.style.display = 'block';
    matchdayText.textContent = '';

    // Recupera la giornata attiva
    const { data: matchday, error: matchdayError } =
        await supabaseClient.rpc('score_get_active_matchday');

    if (matchdayError || !matchday) {
        console.error(
            'Errore recupero giornata:',
            matchdayError
        );

        list.innerHTML = 'Nessuna giornata attiva.';
        return;
    }

    matchdayText.textContent = `Giornata ${matchday}`;

    // Recupera i miei acquisti della giornata attiva
    const { data: myPurchases, error: purchasesError } =
        await supabaseClient.rpc(
            'score_get_my_purchases',
            { p_matchday: matchday }
        );

    if (purchasesError) {
        console.error(
            'Errore caricamento giocatori:',
            purchasesError
        );

        list.innerHTML =
            'Errore nel caricamento dei tuoi giocatori.';

        return;
    }

    // Svuota il campo
    attackersContainer.innerHTML = '';
    midfieldersContainer.innerHTML = '';
    defendersContainer.innerHTML = '';
    goalkeeperContainer.innerHTML = '';
    reservesContainer.innerHTML = '';

    if (!myPurchases || myPurchases.length === 0) {
        list.innerHTML =
            'Non hai ancora acquistato nessun giocatore.';
        return;
    }

    // Recupera i dati completi dei giocatori acquistati
    const playerIds =
        myPurchases.map(purchase => purchase.player_id);

    const { data: players, error: playersError } =
        await supabaseClient
            .from('score_players')
            .select('id, name, role, team, price')
            .in('id', playerIds);

    if (playersError) {
        console.error(
            'Errore caricamento dati giocatori:',
            playersError
        );

        list.innerHTML =
            'Errore nel caricamento dei giocatori.';

        return;
    }

    // Mappa veloce player_id → giocatore
    const playerMap =
        new Map(players.map(player => [player.id, player]));

    // Separa titolari e riserve
    const starters =
        myPurchases.filter(
            purchase => purchase.slot_type === 'starter'
        );

    const reserves =
        myPurchases.filter(
            purchase => purchase.slot_type === 'reserve'
        );

    // Funzione per creare la card del giocatore
function createPlayerCard(player, isReserve = false) {

    const card = document.createElement('div');

    card.className = 'formation-player';

    if (isReserve) {

        card.innerHTML = `
            <img 
                class="formation-team-logo" 
                src="${player.team_logo}" 
                alt=""
            >

            <div class="formation-player-info">
                <strong>${player.name}</strong>
                <span>${player.team} (${player.role})</span>
            </div>
        `;

    } else {

        card.innerHTML = `
            <img 
                class="formation-team-logo" 
                src="${player.team_logo}" 
                alt=""
            >

            <div class="formation-player-info">
                <strong>${player.name}</strong>
                <span>${player.team}</span>
            </div>
        `;
    }

    return card;
}

    // ========================================
    // TITOLARI
    // ========================================

    starters.forEach(purchase => {

        const player =
            playerMap.get(purchase.player_id);

        if (!player) return;

        const card =
            createPlayerCard(player);

        if (player.role === 'A') {

            attackersContainer.appendChild(card);

        } else if (player.role === 'C') {

            midfieldersContainer.appendChild(card);

        } else if (player.role === 'D') {

            defendersContainer.appendChild(card);

        } else if (player.role === 'P') {

            goalkeeperContainer.appendChild(card);
        }
    });

    // ========================================
    // RISERVE
    // ========================================

reserves.forEach(purchase => {

    const player =
        playerMap.get(purchase.player_id);

    if (!player) return;

    const card =
        createPlayerCard(player, true);

    reservesContainer.appendChild(card);
});
}

function closeMyPlayers() {

    document.getElementById('my_players_screen').style.display = 'none';

}


document.getElementById('open_players').addEventListener(
    'click',
    openMyPlayers
);


document.getElementById('close_my_players').addEventListener(
    'click',
    closeMyPlayers
);
async function openRanking() {

    const screen = document.getElementById('ranking_screen');
    const list = document.getElementById('ranking_list');

    screen.style.display = 'flex';

    list.innerHTML = 'Caricamento...';

    // Recupera la classifica dal database
    const { data: ranking, error } =
        await supabaseClient.rpc('score_get_ranking');

    if (error) {
        console.error('Errore caricamento classifica:', error);
        list.innerHTML = 'Errore nel caricamento della classifica.';
        return;
    }

    list.innerHTML = '';

    if (!ranking || ranking.length === 0) {
        list.innerHTML = 'Nessun giocatore in classifica.';
        return;
    }

    ranking.forEach((player, index) => {

        const row = document.createElement('div');

        row.className = 'ranking-row';

        row.innerHTML = `
            <span class="ranking-position">${index + 1}°</span>
            <strong>${player.username}</strong>
            <span class="ranking-points">${player.points} pt</span>
        `;

        list.appendChild(row);
    });
}


function closeRanking() {

    document.getElementById('ranking_screen').style.display = 'none';

}


document.getElementById('open_ranking').addEventListener(
    'click',
    openRanking
);


document.getElementById('close_ranking').addEventListener(
    'click',
    closeRanking
);
