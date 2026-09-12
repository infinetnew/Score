async function loadPlayers() {

    const { data, error } = await supabaseClient
        .from('score_players')
        .select('id, name, role, team, price, available')
        .eq('available', true)
        .order('price', { ascending: false });

    if (error) {
        console.error('Errore caricamento giocatori:', error);
        return;
    }

    console.log('Giocatori caricati:', data);

    const market = document.getElementById('players_market');

    if (!market) {
        console.error('Contenitore mercato non trovato.');
        return;
    }

    market.innerHTML = '';

    const roles = {
        P: 'PORTIERI',
        D: 'DIFENSORI',
        C: 'CENTROCAMPISTI',
        A: 'ATTACCANTI'
    };

    Object.entries(roles).forEach(([role, roleName]) => {

        const players = data.filter(player => player.role === role);

        const section = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = roleName;

        section.appendChild(title);

        players.forEach(player => {

            const playerRow = document.createElement('div');

            playerRow.innerHTML = `
                <strong>${player.name}</strong>
                - ${player.team}
                - ${player.price} crediti
            `;

            section.appendChild(playerRow);
        });

        market.appendChild(section);
    });
}

loadPlayers();
