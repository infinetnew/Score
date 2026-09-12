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

    container.innerHTML = '';

    if (!purchases || purchases.length === 0) {
        container.innerHTML = 'Nessun giocatore acquistato.';
        return;
    }

purchases.forEach(purchase => {

    const row = document.createElement('div');

    row.style.padding = '10px';
    row.style.borderBottom = '1px solid #ddd';

    row.innerHTML = `
        <strong>${purchase.player_name}</strong>
        - ${purchase.team}
        - ${purchase.username}
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
