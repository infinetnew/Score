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
        'score_get_admin_purchases',
        {
            p_matchday: matchday
        }
    );

console.log('PURCHASES:', purchases);
console.log('PURCHASES ERROR:', purchasesError);

if (purchasesError) {
    console.error(purchasesError);
    container.innerHTML = 'Errore nel caricamento degli acquisti.';
    return;
}


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

container.innerHTML = '';
const savedRatings = {};

ratings.forEach(rating => {
    savedRatings[rating.player_id] = rating.rating;
});

    if (!purchases || purchases.length === 0) {
        container.innerHTML = 'Nessun giocatore acquistato.';
        return;
    }

// Raggruppa i giocatori per utente
const groupedPurchases = {};

purchases.forEach(purchase => {

    if (!groupedPurchases[purchase.username]) {
        groupedPurchases[purchase.username] = [];
    }

    groupedPurchases[purchase.username].push(purchase);
});


// Mostra gli utenti uno alla volta
Object.keys(groupedPurchases).forEach(username => {

    const userSection = document.createElement('div');

    userSection.style.marginBottom = '25px';

    userSection.innerHTML = `
        <h3>👤 ${username} — Totale: 
            <span class="user-total">0</span>
        </h3>
    `;

    const totalElement = userSection.querySelector('.user-total');

    let total = 0;

    groupedPurchases[username].forEach(purchase => {

        const row = document.createElement('div');

        row.style.padding = '10px';
        row.style.borderBottom = '1px solid #ddd';

        const savedRating = savedRatings[purchase.player_id];

        if (savedRating !== undefined) {
            total += parseFloat(savedRating);
        }

        row.innerHTML = `
            <strong>${purchase.player_name}</strong>
            - ${purchase.team}

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

    totalElement.textContent = total.toFixed(1);

    container.appendChild(userSection);
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

    const input = document.getElementById(`rating_${playerId}`);

    const rating = parseFloat(input.value);

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

const button = input.parentElement.querySelector('button');

if (button) {
    button.remove();
}

const userSection = input.closest('div').parentElement;

const totalElement = userSection.querySelector('.user-total');

if (totalElement) {

    let total = 0;

    const inputs = userSection.querySelectorAll('input[type="number"]');

    inputs.forEach(input => {

        if (input.value !== '') {
            total += parseFloat(input.value);
        }

    });

    totalElement.textContent = total.toFixed(1);
}
await openAdmin();
}
