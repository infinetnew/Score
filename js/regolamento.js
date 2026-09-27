// ============================================
// FANTA 5 - REGOLAMENTO
// ============================================

console.log("REGOLAMENTO.JS CARICATO");

function apriRegolamento() {

    console.log("CLICK REGOLAMENTO");

    const app = document.getElementById("app");
    const rules = document.getElementById("rules_screen");

    if (!rules) {
        console.error("ERRORE: rules_screen NON TROVATO");
        return;
    }

    // Nasconde tutta la Home
    app.style.display = "none";

    // Mostra il regolamento
    rules.style.display = "block";

    // Torna all'inizio
    window.scrollTo(0, 0);
}


function chiudiRegolamento() {

    console.log("CHIUDI REGOLAMENTO");

    const app = document.getElementById("app");
    const rules = document.getElementById("rules_screen");

    if (!rules) {
        console.error("ERRORE: rules_screen NON TROVATO");
        return;
    }

    // Nasconde il regolamento
    rules.style.display = "none";

    // Riporta la Home
    app.style.display = "block";
}


// ============================================
// CONTENUTO
// ============================================

function caricaRegolamento() {

    const contenitore = document.getElementById("rules_content");

    if (!contenitore) {
        console.error("ERRORE: rules_content NON TROVATO");
        return;
    }

    contenitore.innerHTML = `

        <h1>REGOLAMENTO FANTA 5</h1>

        <h2>1. Cos'è Fanta 5</h2>

        <p>
            Fanta 5 è un gioco fantasy basato sulle prestazioni
            dei calciatori di Serie A e sulla sfida tra i partecipanti.
        </p>

        <p>
            Ogni settimana ogni partecipante viene assegnato automaticamente
            a una lega e riceve un budget di crediti con cui costruire
            la propria squadra acquistando i calciatori disponibili.
        </p>

        <h2>2. I crediti</h2>

        <p>
            Alla registrazione ogni partecipante riceve
            <strong>50 crediti</strong>.
        </p>

        <p>
            I crediti possono essere ottenuti attraverso i risultati
            degli scontri e i quiz giornalieri.
        </p>

        <h2>3. Il mercato</h2>

        <p>
            Ogni partecipante deve acquistare 5 giocatori titolari:
        </p>

        <ul>
            <li>1 portiere</li>
            <li>1 difensore</li>
            <li>1 centrocampista</li>
            <li>1 attaccante</li>
            <li>1 quinto giocatore di movimento</li>
        </ul>

        <p>
            Sono inoltre disponibili, facoltativamente,
            1 portiere di riserva e 1 giocatore di movimento di riserva.
        </p>

        <h2>4. Chiusura del mercato</h2>

        <p>
            Il mercato chiude automaticamente
            <strong>ogni venerdì alle ore 14:00</strong>.
        </p>

        <h2>5. Le leghe</h2>

        <p>
            I partecipanti vengono divisi casualmente in gruppi
            da massimo 8 partecipanti.
        </p>

        <h2>6. Gli scontri</h2>

        <p>
            All'interno della propria lega ogni partecipante affronta
            un altro partecipante in uno scontro diretto.
        </p>

        <h2>7. Come si decide chi vince</h2>

        <p>
            Il punteggio della squadra viene trasformato in gol.
            Il primo gol viene assegnato a 28 punti e successivamente
            viene assegnato un gol ogni 2,5 punti.
        </p>

        <h2>8. I crediti degli scontri</h2>

        <p>
            Vittoria: <strong>16 crediti</strong><br>
            Pareggio: <strong>8 crediti</strong><br>
            Sconfitta: <strong>0 crediti</strong>
        </p>

        <h2>9. I voti dei calciatori</h2>

        <p>
            I voti utilizzati sono quelli di Fantacalcio.it.
        </p>

        <h2>10. La mia formazione</h2>

        <p>
            Mostra i giocatori acquistati e, dopo la creazione degli scontri,
            le informazioni relative all'avversario.
        </p>

        <h2>11. Le statistiche</h2>

        <p>
            Permettono di consultare i risultati, il punteggio,
            le statistiche personali e gli ultimi cinque scontri.
        </p>

        <h2>12. Le classifiche</h2>

        <p>
            Sono presenti la Classifica a punti e la Classifica F1.
        </p>

        <h2>13. I quiz</h2>

        <p>
            Ogni giorno è disponibile un quiz sul calcio internazionale.
            Più velocemente si risponde, più crediti si possono ottenere.
        </p>

        <h2>14. Le notifiche</h2>

        <p>
            Le notifiche permettono di ricevere aggiornamenti
            sulle principali attività del gioco.
        </p>

        <h2>15. Le impostazioni</h2>

        <p>
            È possibile gestire la musica e le notifiche dell'app.
        </p>

    `;
}


// ============================================
// COLLEGAMENTO PULSANTI
// ============================================

const pulsanteRegolamento = document.getElementById("open_rules");

if (pulsanteRegolamento) {

    pulsanteRegolamento.onclick = function () {

        caricaRegolamento();
        apriRegolamento();

    };

    console.log("PULSANTE REGOLAMENTO COLLEGATO");

} else {

    console.error("ERRORE: open_rules NON TROVATO");

}


const pulsanteChiudi = document.getElementById("close_rules");

if (pulsanteChiudi) {

    pulsanteChiudi.onclick = function () {

        chiudiRegolamento();

    };

    console.log("PULSANTE CHIUDI REGOLAMENTO COLLEGATO");

} else {

    console.error("ERRORE: close_rules NON TROVATO");

}
