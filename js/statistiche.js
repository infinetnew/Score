let statsPreviousDisplay = new Map();

document.getElementById('open_stats').addEventListener('click', async () => {

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

    await loadStats();
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
if (matches.length > 0) {

    const lastMatch = matches[0];

    const opponentId =
        lastMatch.player1_id === user.id
            ? lastMatch.player2_id
            : lastMatch.player1_id;

    const { data: opponent, error: opponentError } = await supabaseClient
        .from('score_users')
        .select('username')
        .eq('id', opponentId)
        .single();

    if (opponentError) {
        console.error('Errore recupero avversario:', opponentError);
        return;
    }

    console.log('Avversario ultima partita:', opponent);
document.getElementById('stats_last_opponent').textContent =
    opponent.username;
const myGoals =
    lastMatch.player1_id === user.id
        ? lastMatch.player1_goals
        : lastMatch.player2_goals;

const opponentGoals =
    lastMatch.player1_id === user.id
        ? lastMatch.player2_goals
        : lastMatch.player1_goals;

document.getElementById('stats_last_goals').textContent =
    `${myGoals} - ${opponentGoals}`;
const myScore =
    lastMatch.player1_id === user.id
        ? lastMatch.player1_score
        : lastMatch.player2_score;

const opponentScore =
    lastMatch.player1_id === user.id
        ? lastMatch.player2_score
        : lastMatch.player1_score;

let lastResult;

if (myGoals > opponentGoals) {
    lastResult = 'Vittoria';
} else if (myGoals < opponentGoals) {
    lastResult = 'Sconfitta';
} else {
    lastResult = 'Pareggio';
}

document.getElementById('stats_last_result').textContent =
    lastResult;
const myH2HPoints =
    lastMatch.player1_id === user.id
        ? lastMatch.player1_score
        : lastMatch.player2_score;

document.getElementById('stats_last_h2h_points').textContent =
    myH2HPoints;
}
}
