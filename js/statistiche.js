let statsPreviousDisplay = new Map();

document.getElementById('open_stats').addEventListener('click', () => {

    const app = document.getElementById('app');
    const statsScreen = document.getElementById('stats_screen');

    statsPreviousDisplay.clear();

    Array.from(app.children).forEach(element => {

        if (element.id !== 'stats_screen') {
            statsPreviousDisplay.set(element, element.style.display);
            element.style.display = 'none';
        }

    });

    statsScreen.style.display = 'flex';
});


document.getElementById('close_stats').addEventListener('click', () => {

    const app = document.getElementById('app');
    const statsScreen = document.getElementById('stats_screen');

    statsScreen.style.display = 'none';

    statsPreviousDisplay.forEach((display, element) => {
        element.style.display = display;
    });

    statsPreviousDisplay.clear();
});
async function loadStats() {

    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Errore recupero utente:', error);
        return;
    }

    console.log('Utente statistiche:', user.id);

    const { data: matches, error: matchesError } = await supabaseClient
        .from('score_h2h_matches')
        .select(`
            id,
            matchday,
            player1_id,
            player2_id,
            player1_score,
            player2_score,
            player1_goals,
            player2_goals,
            result,
            player1_points,
            player2_points,
            created_at
        `)
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    if (matchesError) {
        console.error('Errore recupero partite statistiche:', matchesError);
        return;
    }

    console.log('Partite H2H statistiche:', matches);
}
document.getElementById('open_stats').addEventListener('click', async () => {
    await loadStats();
});
