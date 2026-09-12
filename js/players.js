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
}
loadPlayers();
