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
        await supabaseClient
            .from('score_purchases')
            .select(`
                player_id,
                user_id,
                price,
                score_players (
                    name,
                    team,
                    role
                ),
                score_users (
                    username
                )
            `)
            .eq('matchday', matchday);
console.log('PURCHASES:', purchases);
console.log('PURCHASES ERROR:', purchasesError);

    if (purchasesError) {
        console.error(purchasesError);
        container.innerHTML = 'Errore nel caricamento degli acquisti.';
        return;
    }

    container.innerHTML = '';

    if (!purchases || purchases.length === 0) {
        container.innerHTML = 'Nessun giocatore acquistato.';
        return;
    }

    purchases.forEach(purchase => {

        const player = purchase.score_players;
        const user = purchase.score_users;

        const row = document.createElement('div');

        row.style.padding = '10px';
        row.style.borderBottom = '1px solid #ddd';

        row.innerHTML = `
            <strong>${player.name}</strong>
            - ${player.team}
            - ${user.username}
        `;

        container.appendChild(row);
    });
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
