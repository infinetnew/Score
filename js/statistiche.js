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
const myGoals =
    lastMatch.player1_id === user.id
        ? lastMatch.player1_goals
        : lastMatch.player2_goals;

const opponentGoals =
    lastMatch.player1_id === user.id
        ? lastMatch.player2_goals
        : lastMatch.player1_goals;


const myScore =
    lastMatch.player1_id === user.id
        ? lastMatch.player1_score
        : lastMatch.player2_score;

const opponentScore =
    lastMatch.player1_id === user.id
        ? lastMatch.player2_score
        : lastMatch.player1_score;


const myH2HPoints =
    lastMatch.player1_id === user.id
        ? lastMatch.player1_points
        : lastMatch.player2_points;


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
    const scoreDifference = Math.abs(myScore - opponentScore);

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


    // ==================================================
    // VITTORIA
    // ==================================================

    if (myGoals > opponentGoals) {

        let commentary;

        // Vittoria di misura
        if (goalDifference === 1) {

            if (scoreDifference <= 3) {

                commentary =
                    `Che battaglia contro ${opponentName}! ` +
                    `La sfida termina ${myGoals}-${opponentGoals} e viene decisa da un margine davvero minimo. ` +
                    `Hai resistito alla pressione fino all'ultimo e trovato il modo di portare a casa una vittoria di misura. ` +
                    `Anche i punteggi F1 raccontano una partita estremamente equilibrata: ` +
                    `${myScore} punti F1 contro gli ${opponentScore} dell'avversario. ` +
                    `Una gara combattuta fino all'ultimo, nella quale la tua concretezza ha fatto la differenza.`;

            } else {

                commentary =
                    `Hai superato ${opponentName} per ${myGoals}-${opponentGoals} al termine di una sfida combattuta. ` +
                    `Il risultato è stretto, ma la tua prestazione ha fatto la differenza nei momenti decisivi. ` +
                    `Hai totalizzato ${myScore} punti F1 contro gli ${opponentScore} dell'avversario, ` +
                    `mettendo in campo ${performanceDescription}. ` +
                    `Una vittoria di misura, ma tutt'altro che casuale.`;
            }

        // Vittoria con 2 gol di differenza
        } else if (goalDifference === 2) {

            commentary =
                `Hai avuto la meglio su ${opponentName} per ${myGoals}-${opponentGoals}, ` +
                `al termine di una partita nella quale sei riuscito progressivamente a prendere il controllo della sfida. ` +
                `Il vantaggio di due reti certifica una vittoria convincente, costruita con attenzione e concretezza. ` +
                `Il tuo punteggio F1 è stato di ${myScore} punti contro i ${opponentScore} dell'avversario, ` +
                `con ${performanceDescription}. ` +
                `Una prestazione solida che ti permette di conquistare una vittoria meritata.`;

        // Vittoria larga
        } else if (goalDifference <= 4) {

            commentary =
                `Vittoria netta contro ${opponentName}! ` +
                `Hai chiuso la sfida sul ${myGoals}-${opponentGoals}, creando un divario importante e mantenendo il controllo della partita. ` +
                `La differenza di ${goalDifference} reti racconta una gara nella quale sei riuscito a fare la differenza con continuità. ` +
                `Anche il confronto F1 premia la tua prestazione: ${myScore} punti contro i ${opponentScore} dell'avversario. ` +
                `Con ${performanceDescription}, hai costruito un successo convincente e senza particolari rischi.`;

        // Goleada
        } else {

            commentary =
                `Prestazione devastante contro ${opponentName}! ` +
                `Hai letteralmente dominato la sfida, chiudendola con un incredibile ${myGoals}-${opponentGoals}. ` +
                `Un divario enorme che lascia pochissimi dubbi sull'andamento della partita: ` +
                `hai preso il controllo dell'incontro e non hai più lasciato spazio all'avversario. ` +
                `Il confronto F1 è altrettanto impressionante, con ${myScore} punti contro gli ${opponentScore} dell'avversario. ` +
                `Una prestazione di altissimo livello, difficile da migliorare.`;
        }

        return `${commentary} Grazie a questa vittoria guadagni ${myH2HPoints} punti in classifica.`;
    }


    // ==================================================
    // SCONFITTA
    // ==================================================

    if (myGoals < opponentGoals) {

        let commentary;

        // Sconfitta di misura
        if (goalDifference === 1) {

            if (scoreDifference <= 3) {

                commentary =
                    `Che beffa contro ${opponentName}. ` +
                    `La sfida termina ${myGoals}-${opponentGoals}, con una sola rete a separare le due squadre. ` +
                    `Una partita equilibratissima, nella quale hai lottato fino alla fine senza riuscire a trovare l'episodio decisivo. ` +
                    `Anche i punteggi F1 confermano l'equilibrio: ${myScore} punti contro i ${opponentScore} dell'avversario. ` +
                    `Una sconfitta arrivata davvero sul filo di lana.`;

            } else {

                commentary =
                    `Hai ceduto a ${opponentName} per ${myGoals}-${opponentGoals}, ` +
                    `al termine di una partita decisa da un margine minimo. ` +
                    `Il risultato non racconta una gara dominata dall'avversario: hai combattuto fino alla fine, ` +
                    `ma questa volta è mancato quel guizzo necessario per cambiare l'esito della sfida. ` +
                    `Hai totalizzato ${myScore} punti F1 contro gli ${opponentScore} dell'avversario. ` +
                    `Una sconfitta di misura che lascia qualche rimpianto.`;
            }

        // Sconfitta con 2 gol
        } else if (goalDifference === 2) {

            commentary =
                `Contro ${opponentName} arriva una sconfitta per ${myGoals}-${opponentGoals}. ` +
                `La partita è rimasta in equilibrio per diversi momenti, ma l'avversario è riuscito a trovare quel qualcosa in più per portare a casa il risultato. ` +
                `Il confronto F1 termina ${myScore}-${opponentScore}, mentre la tua prestazione è stata ${performanceDescription}. ` +
                `Un risultato da archiviare e dal quale ripartire nella prossima sfida.`;

        // Sconfitta pesante
        } else if (goalDifference <= 4) {

            commentary =
                `Partita difficile contro ${opponentName}, che si impone ${myGoals}-${opponentGoals}. ` +
                `Il divario di ${goalDifference} reti racconta una sfida nella quale l'avversario è riuscito a prendere il sopravvento. ` +
                `Anche il confronto F1 evidenzia la difficoltà della serata: ${myScore} punti contro i ${opponentScore} dell'avversario. ` +
                `Una sconfitta pesante, nonostante ${performanceDescription}.`;

        // Sconfitta pesantissima
        } else {

            commentary =
                `Serata da dimenticare contro ${opponentName}. ` +
                `L'avversario domina completamente la sfida e chiude con un pesantissimo ${myGoals}-${opponentGoals}. ` +
                `Il divario è enorme e la partita prende presto una direzione molto difficile da ribaltare. ` +
                `Il punteggio F1 conferma la serata complicata: ${myScore} punti contro i ${opponentScore} dell'avversario. ` +
                `Una battuta d'arresto netta dalla quale sarà importante ripartire.`;
        }

        return `${commentary} Con questa sconfitta non guadagni punti in classifica.`;
    }


    // ==================================================
    // PAREGGIO
    // ==================================================

    if (myGoals === 0) {

        return (
            `Una sfida completamente bloccata contro ${opponentName}: ` +
            `la partita termina ${myGoals}-${opponentGoals}, senza che nessuna delle due squadre riesca a trovare la giocata decisiva. ` +
            `Una gara fatta di equilibrio e attenzione, nella quale ogni dettaglio avrebbe potuto cambiare l'esito dell'incontro. ` +
            `Il tuo punteggio F1 è di ${myScore} punti contro i ${opponentScore} dell'avversario, ` +
            `per una prestazione che lascia entrambe le squadre con un punto. ` +
            `Con questo pareggio guadagni ${myH2HPoints} punto in classifica.`
        );

    } else if (myGoals <= 2) {

        return (
            `Grande equilibrio contro ${opponentName}! ` +
            `La sfida termina ${myGoals}-${opponentGoals} dopo una partita combattuta e ricca di duelli. ` +
            `Nessuno dei due è riuscito a trovare l'allungo decisivo e il risultato rimane in bilico fino al fischio finale. ` +
            `Hai totalizzato ${myScore} punti F1 contro i ${opponentScore} dell'avversario, ` +
            `in una gara nella quale le due squadre hanno dimostrato di potersi affrontare alla pari. ` +
            `Con questo pareggio guadagni ${myH2HPoints} punto in classifica.`
        );

    } else {

        return (
            `Che spettacolo contro ${opponentName}! ` +
            `La sfida termina con un combattutissimo ${myGoals}-${opponentGoals}, ` +
            `dopo una partita ricca di gol, emozioni e continui capovolgimenti di fronte. ` +
            `Ogni volta che sembrava poter arrivare una svolta, l'avversario è riuscito a rispondere, ` +
            `portando entrambe le squadre fino al fischio finale senza un vincitore. ` +
            `Hai chiuso con ${myScore} punti F1 contro gli ${opponentScore} dell'avversario. ` +
            `Con questo pareggio guadagni ${myH2HPoints} punto in classifica.`
        );
    }
}
