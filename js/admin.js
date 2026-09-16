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

// Di default: calcolo disabilitato
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

    const allCalculated =
        h2hMatches &&
        h2hMatches.length > 0 &&
        h2hMatches.every(match =>
            match.status === 'calculated'
        );

    if (allCalculated) {
        calculateButton.disabled = true;
        completeButton.disabled = false;
    } else {
        calculateButton.disabled = !allRatingsInserted;
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
document.getElementById('open_admin')
    .addEventListener('click', () => {
        console.log('CLICK ADMIN');
        openAdmin();
    });

document.getElementById('close_admin')
    .addEventListener('click', () => {
        document.getElementById('admin_page').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    });
