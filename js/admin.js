const assignLeaguesButton =
    document.getElementById('assign_leagues');

const createLeagueMatchesButton =
    document.getElementById('create_league_matches');
async function openAdmin() {

    document.getElementById('app').style.display = 'none';
    document.getElementById('admin_page').style.display = 'block';

    const container = document.getElementById('admin_players');

    container.innerHTML = 'Caricamento...';

    // Recupera la giornata attiva
    const { data: matchday, error: matchdayError } =
        await supabaseClient.rpc('score_get_active_matchday');
console.log('MATCHDAY:', matchday);
console.log('MATCHDAY ERROR:', matchdayError);

    if (matchdayError || !matchday) {
        console.error(matchdayError);
        container.innerHTML = 'Nessuna giornata attiva.';
        return;
    }

    document.getElementById('admin_matchday').textContent =
        `Giornata ${matchday}`;


    // Recupera gli acquisti della giornata
const { data: purchases, error: purchasesError } =
    await supabaseClient.rpc(
        'score_get_admin_purchases_v3',
        { p_matchday: matchday }
    );

console.log('PURCHASES:', purchases);
console.log('PURCHASES ERROR:', purchasesError);

if (purchasesError) {
    console.error(purchasesError);
    container.innerHTML = 'Errore nel caricamento degli acquisti.';
    return;
}
// Recupera i ruoli dei giocatori
const playerIds = purchases.map(purchase => purchase.player_id);

const { data: playerRoles, error: playerRolesError } =
    await supabaseClient
        .from('score_players')
        .select('id, role')
        .in('id', playerIds);

if (playerRolesError) {
    console.error('Errore recupero ruoli:', playerRolesError);
    container.innerHTML = 'Errore nel caricamento dei ruoli.';
    return;
}

// Aggiunge il ruolo a ogni acquisto
purchases.forEach(purchase => {
    const player = playerRoles.find(
        player => player.id === purchase.player_id
    );

    purchase.role = player ? player.role : null;
});
// Il calcolo degli scontri è possibile solo quando
// tutti i giocatori acquistati hanno ricevuto un voto.

const calculateButton =
    document.getElementById('calculate_matches');

const completeButton =
    document.getElementById('complete_matchday');


// Stato dei pulsanti in base alla giornata attiva

const { data: leagueMembers, error: leagueError } =
    await supabaseClient
        .from('score_league_members')
        .select('user_id, league_number')
        .eq('matchday', matchday);

console.log('LEAGUE MEMBERS:', leagueMembers);
console.log('LEAGUE ERROR:', leagueError);

if (leagueError) {
    console.error(leagueError);
    container.innerHTML = 'Errore nel caricamento delle leghe.';
    return;
}

const leaguesAssigned =
    leagueMembers &&
    leagueMembers.length > 0;

assignLeaguesButton.disabled = leaguesAssigned;



calculateButton.disabled = true;
completeButton.disabled = true;


// Recupera i voti già inseriti per questa giornata
const { data: ratings, error: ratingsError } =
    await supabaseClient
        .from('score_player_ratings')
        .select('player_id, rating')
        .eq('matchday', matchday);

console.log('RATINGS:', ratings);
console.log('RATINGS ERROR:', ratingsError);

if (ratingsError) {
    console.error(ratingsError);
    container.innerHTML = 'Errore nel caricamento dei voti.';
    return;
}
// Controlla se tutti gli acquisti hanno un voto
const allRatingsInserted =
    purchases &&
    purchases.length > 0 &&
    purchases.every(purchase =>
        ratings.some(rating =>
            rating.player_id === purchase.player_id
        )
    );

// Controlla se gli scontri sono già stati calcolati
const { data: h2hMatches, error: h2hError } =
    await supabaseClient
        .from('score_h2h_matches')
        .select('status')
        .eq('matchday', matchday);

if (h2hError) {
    console.error('H2H ERROR:', h2hError);
} else {

const matchesExist =
    h2hMatches &&
    h2hMatches.length > 0;

const allCalculated =
    matchesExist &&
    h2hMatches.every(match =>
        match.status === 'calculated'
    );

// CREA SCONTRI
createLeagueMatchesButton.disabled =
    !leaguesAssigned || matchesExist;

// STATI GRAFICI DELLA GIORNATA
const waitingVotes =
    document.getElementById('waiting_votes');

// Nascondiamo tutti gli stati
assignLeaguesButton.style.display = 'none';
createLeagueMatchesButton.style.display = 'none';
waitingVotes.style.display = 'none';
calculateButton.style.display = 'none';
completeButton.style.display = 'none';

// 1. LEGHE NON ANCORA ASSEGNATE
if (!leaguesAssigned) {

    assignLeaguesButton.style.display = 'block';

}

// 2. LEGHE ASSEGNATE, SCONTRI NON CREATI
else if (!matchesExist) {

    createLeagueMatchesButton.style.display = 'block';

}

// 3. SCONTRI CREATI, MA MANCANO DEI VOTI
else if (!allRatingsInserted) {

    waitingVotes.style.display = 'block';

}

// 4. TUTTI I VOTI INSERITI
else if (!allCalculated) {

    calculateButton.disabled = false;
    calculateButton.style.display = 'block';

}

// 5. SCONTRI CALCOLATI
else {

    completeButton.disabled = false;
    completeButton.style.display = 'block';

}
}

container.innerHTML = '';
const savedRatings = {};

ratings.forEach(rating => {
    savedRatings[rating.player_id] = rating.rating;
});

    if (!purchases || purchases.length === 0) {
        container.innerHTML = 'Nessun giocatore acquistato.';
        return;
    }
// Statistiche giornata
const participantsCount =
    new Set(purchases.map(purchase => purchase.user_id)).size;

const leaguesCount =
    new Set(purchases.map(purchase => purchase.league_number)).size;

const stats = document.createElement('div');

stats.style.marginBottom = '25px';
stats.style.fontSize = '18px';
stats.style.fontWeight = 'bold';

stats.innerHTML = `
    <img
        src="/Score/assets/partecipanti.png"
        alt="Partecipanti"
        style="
            width:24px;
            height:24px;
            object-fit:contain;
            vertical-align:middle;
            margin-right:6px;
        "
    >
    ${participantsCount} Giocatori

    &nbsp;&nbsp;&nbsp;

    <img
        src="/Score/assets/lega.png"
        alt="Leghe"
        style="
            width:24px;
            height:24px;
            object-fit:contain;
            vertical-align:middle;
            margin-right:6px;
        "
    >
    ${leaguesCount} Leghe
`;

container.appendChild(stats);

// Raggruppa i giocatori per LEGA → UTENTE
const groupedLeagues = {};

purchases.forEach(purchase => {

    if (!groupedLeagues[purchase.league_number]) {
        groupedLeagues[purchase.league_number] = {};
    }

    if (!groupedLeagues[purchase.league_number][purchase.username]) {
        groupedLeagues[purchase.league_number][purchase.username] = [];
    }

    groupedLeagues[purchase.league_number][purchase.username].push(purchase);
});


// Mostra le leghe una alla volta
Object.keys(groupedLeagues)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(leagueNumber => {

        const leagueSection = document.createElement('div');

leagueSection.className = 'admin-league';

        leagueSection.innerHTML = `
            <h2>LEGA ${leagueNumber}</h2>
        `;

        // Mostra gli utenti della lega
        Object.keys(groupedLeagues[leagueNumber])
            .sort()
            .forEach(username => {

const userSection = document.createElement('div');

userSection.className = 'admin-user-card';

userSection.innerHTML = `
    <h3>
        <img
            src="/Score/assets/giocatore.png"
            alt="Giocatore"
            style="
                width:22px;
                height:22px;
                object-fit:contain;
                vertical-align:middle;
                margin-right:6px;
            "
        >
        ${username} — Totale:
        <span class="user-total">0</span>
    </h3>
`;

                const totalElement =
                    userSection.querySelector('.user-total');

                let total = 0;

                const players =
                    groupedLeagues[leagueNumber][username];

                // TITOLARI
const starters =
    players
        .filter(purchase =>
            purchase.slot_type === 'starter'
        )
        .sort((a, b) => {
            const order = {
                P: 1,
                D: 2,
                C: 3,
                A: 4
            };

            return (order[a.role] || 99) - (order[b.role] || 99);
        });

const reserves =
    players
        .filter(purchase =>
            purchase.slot_type === 'reserve'
        )
        .sort((a, b) => {
            const order = {
                P: 1,
                D: 2,
                C: 3,
                A: 4
            };

            return (order[a.role] || 99) - (order[b.role] || 99);
        });

                if (starters.length > 0) {

                    const startersTitle =
                        document.createElement('h4');

                    startersTitle.textContent = 'TITOLARI';

                    userSection.appendChild(startersTitle);

                    starters.forEach(purchase => {

const row =
    document.createElement('div');

row.className = `admin-player-row role-${purchase.role}`;

const savedRating =
    savedRatings[purchase.player_id];

                        if (savedRating !== undefined) {
                            total += parseFloat(savedRating);
                        }

                        row.innerHTML = `
    <div class="admin-role-badge">
        ${purchase.role}
    </div>

    <strong>${purchase.player_name}</strong>

<img
    src="${purchase.team_logo}"
    alt="${purchase.team}"
    style="
        width:32px;
        height:32px;
        object-fit:contain;
        vertical-align:middle;
        margin-left:20px;
    "
>

                            <input
                                type="number"
                                step="0.5"
                                placeholder="Voto"
                                id="rating_${purchase.player_id}"
                                value="${savedRating ?? ''}"
                                ${savedRating !== undefined ? 'disabled' : ''}
                                style="width:70px; margin-left:10px;"
                            >

                            ${
                                savedRating === undefined
                                ? `
                                    <button
                                        onclick="saveRating(${purchase.player_id}, ${matchday})"
                                        style="margin-left:5px;"
                                    >
                                        SALVA
                                    </button>
                                `
                                : ''
                            }
                        `;

                        userSection.appendChild(row);
                    });
                }

                // RISERVE
                if (reserves.length > 0) {

                    const reservesTitle =
                        document.createElement('h4');

                    reservesTitle.textContent = 'RISERVE';

                    reservesTitle.style.marginTop = '15px';

                    userSection.appendChild(reservesTitle);

                    reserves.forEach(purchase => {

const row =
    document.createElement('div');

row.className = `admin-player-row role-${purchase.role}`;

const savedRating =
    savedRatings[purchase.player_id];

                        if (savedRating !== undefined) {
                            total += parseFloat(savedRating);
                        }

row.innerHTML = `
<div class="admin-role-badge">
    ${purchase.role}
</div>

<strong>${purchase.player_name}</strong>

<img
    src="${purchase.team_logo}"
    alt="${purchase.team}"
    style="
        width:32px;
        height:32px;
        object-fit:contain;
        vertical-align:middle;
        margin-left:20px;
    "
>

                            <input
                                type="number"
                                step="0.5"
                                placeholder="Voto"
                                id="rating_${purchase.player_id}"
                                value="${savedRating ?? ''}"
                                ${savedRating !== undefined ? 'disabled' : ''}
                                style="width:70px; margin-left:10px;"
                            >

                            ${
                                savedRating === undefined
                                ? `
                                    <button
                                        onclick="saveRating(${purchase.player_id}, ${matchday})"
                                        style="margin-left:5px;"
                                    >
                                        SALVA
                                    </button>
                                `
                                : ''
                            }
                        `;

                        userSection.appendChild(row);
                    });
                }

                totalElement.textContent =
                    total.toFixed(1);

                leagueSection.appendChild(userSection);
            });

        container.appendChild(leagueSection);
    });


}
assignLeaguesButton.addEventListener('click', async () => {

    assignLeaguesButton.disabled = true;
    assignLeaguesButton.textContent = 'ASSEGNAZIONE IN CORSO...';

    const { data: matchday, error: matchdayError } =
        await supabaseClient.rpc('score_get_active_matchday');

    if (matchdayError || !matchday) {
        console.error(matchdayError);
        alert('Impossibile recuperare la giornata attiva.');

        assignLeaguesButton.disabled = false;
        assignLeaguesButton.textContent = 'ASSEGNA UTENTI ALLE LEGHE';
        return;
    }

    const { data, error } =
        await supabaseClient.rpc(
            'score_assign_leagues',
            {
                p_matchday: matchday
            }
        );

    if (error) {
        console.error('Errore assegnazione leghe:', error);
        alert(error.message);

        assignLeaguesButton.disabled = false;
        assignLeaguesButton.textContent = 'ASSEGNA UTENTI ALLE LEGHE';
        return;
    }

console.log('Leghe assegnate:', data);

assignLeaguesButton.disabled = true;

await openAdmin();

});
createLeagueMatchesButton.addEventListener('click', async () => {

    createLeagueMatchesButton.disabled = true;
    createLeagueMatchesButton.textContent = 'CREAZIONE SCONTRI...';

    const { data: matchday, error: matchdayError } =
        await supabaseClient.rpc('score_get_active_matchday');

    if (matchdayError || !matchday) {
        console.error(matchdayError);
        alert('Impossibile recuperare la giornata attiva.');

        createLeagueMatchesButton.disabled = false;
        createLeagueMatchesButton.textContent = 'CREA SCONTRI';
        return;
    }

    const { data, error } =
        await supabaseClient.rpc(
            'score_create_league_matches',
            {
                p_matchday: matchday
            }
        );

    if (error) {
        console.error('Errore creazione scontri:', error);
        alert(error.message);

        createLeagueMatchesButton.disabled = false;
        createLeagueMatchesButton.textContent = 'CREA SCONTRI';
        return;
    }

console.log('Scontri creati:', data);

createLeagueMatchesButton.textContent = 'SCONTRI CREATI';
createLeagueMatchesButton.disabled = true;

await openAdmin();

});
document.getElementById('calculate_matches')
    .addEventListener('click', async () => {

        const { data: matchday, error: matchdayError } =
            await supabaseClient.rpc('score_get_active_matchday');

        if (matchdayError || !matchday) {
            console.error(matchdayError);
            alert('Impossibile recuperare la giornata attiva.');
            return;
        }

        const { data, error } =
            await supabaseClient.rpc(
                'score_calculate_h2h',
                {
                    p_matchday: matchday
                }
            );

        if (error) {
            console.error('Errore calcolo scontri:', error);
            alert(error.message);
            return;
        }

console.log('Scontri calcolati:', data);

await openAdmin();
    });


document.getElementById('complete_matchday')
    .addEventListener('click', async () => {

        const { data: matchday, error: matchdayError } =
            await supabaseClient.rpc('score_get_active_matchday');

        if (matchdayError || !matchday) {
            console.error(matchdayError);
            alert('Impossibile recuperare la giornata attiva.');
            return;
        }

        const { data, error } =
            await supabaseClient.rpc(
                'score_complete_matchday',
                {
                    p_matchday: matchday
                }
            );

        if (error) {
            console.error('Errore conclusione giornata:', error);
            alert(error.message);
            return;
        }

        console.log('Giornata conclusa:', data);

        const button =
            document.getElementById('complete_matchday');

        button.textContent = 'GIORNATA CONCLUSA';
        button.disabled = true;

        await openAdmin();
    });


async function saveRating(playerId, matchday) {

    const input =
        document.getElementById(`rating_${playerId}`);

    const rating =
        parseFloat(input.value);

    if (isNaN(rating)) {
        alert('Inserisci un voto.');
        return;
    }


    const { data, error } =
        await supabaseClient.rpc(
            'score_set_player_rating',
            {
                p_player_id: playerId,
                p_matchday: matchday,
                p_rating: rating
            }
        );

    if (error) {
        console.error('Errore salvataggio voto:', error);
        alert(error.message);
        return;
    }

    input.disabled = true;

    const button =
        input.parentElement.querySelector('button');

    if (button) {
        button.remove();
    }

    const userSection =
        input.closest('div').parentElement;

    const totalElement =
        userSection.querySelector('.user-total');

    if (totalElement) {

        let total = 0;

        const inputs =
            userSection.querySelectorAll(
                'input[type="number"]'
            );

        inputs.forEach(input => {

            if (input.value !== '') {
                total += parseFloat(input.value);
            }

        });

        totalElement.textContent =
            total.toFixed(1);
    }

    await openAdmin();
}
document.getElementById('admin_user_search')
    .addEventListener('input', async () => {

    const search =
        document.getElementById('admin_user_search').value
            .trim();

    const container =
        document.getElementById('admin_users_list');

    container.innerHTML = '';

    if (search.length < 2) {
        return;
    }

    const { data: users, error } =
        await supabaseClient
            .from('score_users')
            .select('id, username')
            .ilike('username', `%${search}%`)
            .order('username')
            .limit(10);

    if (error) {
        console.error('Errore ricerca utenti:', error);
        container.innerHTML =
            'Errore nella ricerca degli utenti.';
        return;
    }

    if (!users || users.length === 0) {
        container.innerHTML =
            'Nessun utente trovato.';
        return;
    }

    users.forEach(user => {

        const userCard =
            document.createElement('div');

        userCard.className = 'admin-user-card';

userCard.innerHTML = `
    <button
        class="admin-user-select"
        data-user-id="${user.id}">
        ${user.username}
    </button>
`;

        container.appendChild(userCard);

    });

});
document.getElementById('admin_users_list')
    .addEventListener('click', async (event) => {

    const button =
        event.target.closest('.admin-user-select');

    if (!button) {
        return;
    }

    const userId =
        button.dataset.userId;

    const username =
        button.textContent.trim();
    const { data: transactions, error } =
        await supabaseClient
            .from('score_credit_transactions')
            .select('amount')
            .eq('user_id', userId);
console.log('UTENTE:', userId);
console.log('MOVIMENTI:', transactions);
console.log('ERRORE CREDITI:', error);

    if (error) {
        console.error('Errore recupero crediti:', error);
        return;
    }

    const credits =
        (transactions || []).reduce(
            (total, transaction) =>
                total + Number(transaction.amount || 0),
            0
        );
const { data: h2hMatches, error: h2hError } =
    await supabaseClient
        .from('score_h2h_matches')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .eq('status', 'calculated')
        .order('matchday', { ascending: false })
        .limit(5);

if (h2hError) {
    console.error('Errore recupero scontri:', h2hError);
    return;
}
const h2hResults = (h2hMatches || []).map(match => {

    const isPlayer1 =
        match.player1_id === userId;

    const userPoints =
        isPlayer1
            ? match.player1_points
            : match.player2_points;

    const opponentPoints =
        isPlayer1
            ? match.player2_points
            : match.player1_points;

    let resultText = 'Pareggio';

    if (userPoints > opponentPoints) {
        resultText = 'Vittoria';
    } else if (userPoints < opponentPoints) {
        resultText = 'Sconfitta';
    }

return {
    matchday: match.matchday,
    result: resultText,
    resultClass:
        resultText === 'Vittoria'
            ? 'win'
            : resultText === 'Sconfitta'
                ? 'loss'
                : 'draw'
};

});
const h2hHtml = h2hResults.length > 0
    ? h2hResults.map(match => `
        <div class="admin-h2h-result ${match.resultClass}">
            <span class="admin-h2h-dot"></span>
            <span class="admin-h2h-matchday">
                Giornata ${match.matchday}
            </span>
            <span class="admin-h2h-result-text">
                ${match.result}
            </span>
        </div>
    `).join('')
    : `
        <div class="admin-h2h-empty">
            Nessuno scontro giocato
        </div>
    `;

document.getElementById('admin_user_detail_content')
    .innerHTML = `
<div class="admin-user-credits">
    <img
        src="/Score/assets/crediti-admin.png"
        alt="Crediti"
        class="admin-credit-icon"
    >
    <span>Crediti: <strong>${credits}</strong></span>
</div>

        <div class="admin-credit-edit">
            <input
                type="number"
                id="admin_credit_amount"
                placeholder="Inserisci crediti"
            >

            <button id="admin_credit_submit">
                Invia
            </button>
        </div>

<div class="admin-h2h-section">
    <h3>
        <img
            src="/Score/assets/scontri-admin.png"
            alt="Scontri"
            class="admin-h2h-icon"
        >
        <span>Ultimi 5 scontri</span>
    </h3>

    ${h2hHtml}
</div>
    `;
document.getElementById('admin_credit_submit')
    .addEventListener('click', async () => {

    const amountInput =
        document.getElementById('admin_credit_amount');

    const amount =
        Number(amountInput.value);

    if (!Number.isInteger(amount) || amount === 0) {
        alert('Inserisci un numero di crediti valido.');
        return;
    }

    const { error } =
        await supabaseClient
            .from('score_credit_transactions')
            .insert({
                user_id: userId,
                amount: amount,
                reason: 'Modifica crediti admin',
                type: 'admin_bonus'
            });

if (error) {
    console.error('Errore registrazione crediti:', error);

    showAdminMessage(
        'Operazione non riuscita',
        'Errore durante la registrazione dei crediti.'
    );

    return;
}

showAdminMessage(
    'Operazione completata',
    'Movimento registrato correttamente.'
);
amountInput.value = '';
const newCredits = credits + amount;

document.getElementById('admin_user_detail_content')
    .querySelector('.admin-user-credits strong')
    .textContent = newCredits;

});
    document.getElementById('admin_users_list')
        .style.display = 'none';

    document.getElementById('admin_user_search')
        .style.display = 'none';

    document.getElementById('admin_user_detail_name')
        .textContent = username;

    document.getElementById('admin_user_detail')
        .style.display = 'block';

});
document.getElementById('back_admin_user_list')
    .addEventListener('click', () => {

    document.getElementById('admin_user_detail')
        .style.display = 'none';

    document.getElementById('admin_user_search')
        .style.display = 'block';
document.getElementById('admin_user_search').value = '';
document.getElementById('admin_users_list').innerHTML = '';

    document.getElementById('admin_users_list')
        .style.display = 'block';

});
document.getElementById('open_admin')
    .addEventListener('click', () => {

    console.log('CLICK ADMIN');

    document.getElementById('admin_management').style.display = 'none';
    document.getElementById('admin_h2h_management').style.display = 'none';
    document.getElementById('admin_menu').style.display = 'block';

    openAdmin();
});

document.getElementById('admin_votes')
    .addEventListener('click', () => {

    document.getElementById('admin_menu').style.display = 'none';
    document.getElementById('admin_h2h_management').style.display = 'none';
    document.getElementById('admin_management').style.display = 'block';

});
document.getElementById('admin_matchday_menu')
    .addEventListener('click', () => {

    document.getElementById('admin_menu').style.display = 'none';
    document.getElementById('admin_management').style.display = 'none';
    document.getElementById('admin_h2h_management').style.display = 'block';

});
document.getElementById('back_admin_h2h_menu')
    .addEventListener('click', () => {

    document.getElementById('admin_h2h_management').style.display = 'none';
    document.getElementById('admin_menu').style.display = 'block';

});
document.getElementById('admin_users')
    .addEventListener('click', () => {

    document.getElementById('admin_menu').style.display = 'none';
    document.getElementById('admin_users_page').style.display = 'block';

    document.getElementById('admin_user_search').value = '';

    document.getElementById('admin_users_list').innerHTML = '';

    document.getElementById('admin_users_list').style.display = 'block';
    document.getElementById('admin_user_search').style.display = 'block';

    document.getElementById('admin_user_detail').style.display = 'none';

});
document.getElementById('back_admin_users')
    .addEventListener('click', () => {

    document.getElementById('admin_users_page').style.display = 'none';
    document.getElementById('admin_menu').style.display = 'block';

});
document.getElementById('back_admin_menu')
    .addEventListener('click', () => {

    document.getElementById('admin_management').style.display = 'none';
    document.getElementById('admin_h2h_management').style.display = 'none';
    document.getElementById('admin_menu').style.display = 'block';

});
document.getElementById('admin_home')
    .addEventListener('click', () => {

    document.getElementById('admin_page').style.display = 'none';
    document.getElementById('app').style.display = 'block';

});


function showAdminMessage(title, message) {

    document.querySelector('.admin-message-title').textContent =
        title;

    document.getElementById('admin_message_text').textContent =
        message;

    document.getElementById('admin_message_modal').style.display =
        'flex';
}


document.getElementById('admin_message_ok')
    .addEventListener('click', () => {

        document.getElementById('admin_message_modal')
            .style.display = 'none';

    });
