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

assignLeaguesButton.textContent =
    leaguesAssigned
        ? 'LEGHE ASSEGNATE'
        : 'ASSEGNA UTENTI ALLE LEGHE';

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

createLeagueMatchesButton.textContent =
    matchesExist
        ? 'SCONTRI CREATI'
        : 'CREA SCONTRI';

// CALCOLA / CONCLUDI
if (allCalculated) {

    calculateButton.disabled = true;
    calculateButton.textContent = 'SCONTRI CALCOLATI';

    completeButton.disabled = false;

} else {

    calculateButton.disabled =
        !matchesExist || !allRatingsInserted;

    completeButton.disabled = true;
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
    👥 ${participantsCount} GIOCATORI
    &nbsp;&nbsp;&nbsp;
    🏆 ${leaguesCount} LEGHE
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
                    <h3>👤 ${username} — Totale:
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
                    players.filter(purchase =>
                        purchase.slot_type === 'starter'
                    );

                const reserves =
                    players.filter(purchase =>
                        purchase.slot_type === 'reserve'
                    );

                if (starters.length > 0) {

                    const startersTitle =
                        document.createElement('h4');

                    startersTitle.textContent = 'TITOLARI';

                    userSection.appendChild(startersTitle);

                    starters.forEach(purchase => {

const row =
    document.createElement('div');

row.className = 'admin-player-row';

                        const savedRating =
                            savedRatings[purchase.player_id];

                        if (savedRating !== undefined) {
                            total += parseFloat(savedRating);
                        }

                        row.innerHTML = `
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
                                min="0"
                                max="10"
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

row.className = 'admin-player-row';

                        const savedRating =
                            savedRatings[purchase.player_id];

                        if (savedRating !== undefined) {
                            total += parseFloat(savedRating);
                        }

                        row.innerHTML = `
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
                                min="0"
                                max="10"
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

    assignLeaguesButton.textContent = 'LEGHE ASSEGNATE';
    assignLeaguesButton.disabled = true;

    createLeagueMatchesButton.disabled = false;

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

document.getElementById('calculate_matches').disabled = false;

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

        const button =
            document.getElementById('calculate_matches');

        button.textContent = 'SCONTRI CALCOLATI';
        button.disabled = true;

        document.getElementById('complete_matchday').disabled = false;
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

    if (rating < 0 || rating > 10) {
        alert('Il voto deve essere compreso tra 0 e 10.');
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
document.getElementById('admin_user_detail_content')
    .innerHTML = `
        <div class="admin-user-credits">
            💰 Crediti: <strong>${credits}</strong>
        </div>

        <div class="admin-credit-edit">
            <input
                type="number"
                id="admin_credit_amount"
                placeholder="Inserisci crediti"
            >

            <button id="admin_credit_submit">
                INVIA
            </button>
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
        alert('Errore durante la registrazione dei crediti.');
        return;
    }

    alert('Movimento registrato correttamente.');
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
    document.getElementById('admin_menu').style.display = 'block';

    openAdmin();
});
document.getElementById('admin_votes')
    .addEventListener('click', () => {

    document.getElementById('admin_menu').style.display = 'none';
    document.getElementById('admin_management').style.display = 'block';

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
    document.getElementById('admin_menu').style.display = 'block';

});
document.getElementById('admin_home')
    .addEventListener('click', () => {

    document.getElementById('admin_page').style.display = 'none';
    document.getElementById('app').style.display = 'block';

});

document.getElementById('close_admin')
    .addEventListener('click', () => {
        document.getElementById('admin_page').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    });
