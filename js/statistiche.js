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
const commentary = generateMatchCommentary(
    opponent.username,
    myGoals,
    opponentGoals,
    myScore,
    opponentScore,
    myH2HPoints
);

document.getElementById('stats_last_commentary').textContent =
    commentary;
const myH2HPoints =
    lastMatch.player1_id === user.id
        ? lastMatch.player1_score
        : lastMatch.player2_score;

document.getElementById('stats_last_h2h_points').textContent =
    myH2HPoints;
}
}
function generateMatchCommentary(
    opponentName,
    myGoals,
    opponentGoals,
    myScore,
    opponentScore,
    myH2HPoints
) {

    const goalDifference = Math.abs(myGoals - opponentGoals);
let performanceDescription;

if (myScore <= 20) {
    performanceDescription = 'una prestazione sottotono';
} else if (myScore <= 25) {
    performanceDescription = 'una prestazione discreta';
} else if (myScore <= 30) {
    performanceDescription = 'una buona prestazione';
} else if (myScore <= 35) {
    performanceDescription = 'un’ottima prestazione';
} else {
    performanceDescription = 'una prestazione stratosferica';
}

  // VITTORIA
if (myGoals > opponentGoals) {

    let opening;

    if (goalDifference === 1) {
        opening = `Hai superato ${opponentName} per ${myGoals}-${opponentGoals}, in una sfida decisa sul filo di lana. Una vittoria di misura`;
    } else if (goalDifference === 2) {
        opening = `Hai superato ${opponentName} per ${myGoals}-${opponentGoals}, con una prestazione convincente. Una vittoria meritata`;
    } else if (goalDifference <= 4) {
        opening = `Hai dominato la sfida contro ${opponentName}, imponendoti ${myGoals}-${opponentGoals}. Una vittoria netta`;
    } else {
        opening = `Prestazione stratosferica contro ${opponentName}! Hai chiuso la partita con un incredibile ${myGoals}-${opponentGoals}. Una vittoria devastante`;
    }

    return `${opening}, con ${performanceDescription}: ${myScore} punti FW1 contro gli ${opponentScore} dell'avversario. In classifica guadagni ${myH2HPoints} punti.`;
}


// SCONFITTA
if (myGoals < opponentGoals) {

    let opening;

    if (goalDifference === 1) {
        opening = `Hai ceduto a ${opponentName} per ${myGoals}-${opponentGoals}, al termine di una sfida decisa sul filo di lana. Una sconfitta di misura`;
    } else if (goalDifference === 2) {
        opening = `Contro ${opponentName} arriva una sconfitta per ${myGoals}-${opponentGoals}. L'avversario ha avuto la meglio`;
    } else if (goalDifference <= 4) {
        opening = `Una partita difficile contro ${opponentName}, che si impone ${myGoals}-${opponentGoals}. Una sconfitta pesante`;
    } else {
        opening = `Serata da dimenticare contro ${opponentName}: arriva una pesante sconfitta per ${myGoals}-${opponentGoals}. L'avversario domina la sfida`;
    }

    return `${opening}, con ${performanceDescription}: ${myScore} punti FW1 contro gli ${opponentScore} dell'avversario. In classifica guadagni ${myH2HPoints} punti.`;
}


// PAREGGIO
if (myGoals === 0) {

    return `Una sfida bloccata contro ${opponentName}: finisce ${myGoals}-${opponentGoals}, dopo una partita senza gol. La tua prestazione è stata ${performanceDescription}: ${myScore} punti FW1 contro gli ${opponentScore} dell'avversario. In classifica guadagni ${myH2HPoints} punti.`;

} else if (myGoals <= 2) {

    return `Grande equilibrio contro ${opponentName}: la sfida termina ${myGoals}-${opponentGoals}, con entrambe le squadre incapaci di prevalere. La tua prestazione è stata ${performanceDescription}: ${myScore} punti FW1 contro gli ${opponentScore} dell'avversario. In classifica guadagni ${myH2HPoints} punti.`;

} else {

    return `Spettacolo ed emozioni contro ${opponentName}! La sfida termina con un combattutissimo ${myGoals}-${opponentGoals}, dopo una partita ricca di gol. La tua prestazione è stata ${performanceDescription}: ${myScore} punti FW1 contro gli ${opponentScore} dell'avversario. In classifica guadagni ${myH2HPoints} punti.`;
}
}
