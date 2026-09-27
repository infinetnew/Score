console.log("REGOLAMENTO.JS CARICATO");
// ============================================
// FANTA 5 - REGOLAMENTO
// ============================================

function openRegolamento() {

    const rulesScreen = document.getElementById('rules_screen');

    if (!rulesScreen) {
        console.error('Schermata regolamento non trovata.');
        return;
    }

    rulesScreen.style.display = 'block';

    // Torna all'inizio del regolamento
    rulesScreen.scrollTop = 0;
}


function closeRegolamento() {

    const rulesScreen = document.getElementById('rules_screen');

    if (!rulesScreen) {
        console.error('Schermata regolamento non trovata.');
        return;
    }

    rulesScreen.style.display = 'none';
}


// ============================================
// CONTENUTO DEL REGOLAMENTO
// ============================================

function loadRegolamento() {

    const rulesContent = document.getElementById('rules_content');

    if (!rulesContent) {
        console.error('Contenitore del regolamento non trovato.');
        return;
    }

    rulesContent.innerHTML = `

        <h1>REGOLAMENTO FANTA 5</h1>

        <h2>1. Cos'è Fanta 5</h2>

        <p>
            <strong>Fanta 5 è un gioco fantasy basato sulle prestazioni
            dei calciatori di Serie A e sulla sfida tra i partecipanti.</strong>
        </p>

        <p>
            Ogni settimana ogni partecipante viene assegnato automaticamente
            a una lega e riceve un budget di crediti con cui dovrà costruire
            la propria squadra acquistando i calciatori disponibili.
        </p>

        <p>
            La squadra vale solamente per la giornata in corso.
            Al termine della giornata, i calciatori vengono azzerati e,
            con la nuova giornata, ogni partecipante dovrà costruire una
            nuova squadra.
        </p>

        <p>
            All'interno di ogni lega vengono creati gli scontri tra i
            partecipanti. Una volta disponibili i voti dei calciatori,
            il sistema calcola automaticamente i punteggi e stabilisce
            il risultato di ogni sfida.
        </p>

        <p>
            Fanta 5 non è quindi soltanto una questione di scelta dei
            giocatori: <strong>strategia, conoscenza del calcio e gestione
            dei crediti</strong> sono fondamentali per affrontare al meglio
            ogni giornata.
        </p>


        <h2>2. I crediti</h2>

        <p>
            Alla registrazione ogni partecipante riceve
            <strong>50 crediti</strong>.
        </p>

        <p>
            I crediti sono la valuta del gioco e servono principalmente
            per acquistare i calciatori durante il mercato.
        </p>

        <p>I crediti possono essere ottenuti attraverso:</p>

        <ul>
            <li>i risultati degli scontri;</li>
            <li>i quiz giornalieri.</li>
        </ul>

        <h3>I crediti non spesi</h3>

        <p>
            I crediti che non vengono utilizzati durante una giornata
            <strong>non vengono persi</strong>.
        </p>

        <p>
            Il saldo rimane disponibile anche nelle giornate successive.
        </p>

        <p>
            Questo significa che bisogna scegliere con attenzione come
            utilizzare i propri crediti: spendere tutto per una giornata
            può permettere di costruire una squadra più competitiva, ma
            conservare parte del proprio budget può essere importante
            per affrontare le giornate successive.
        </p>


        <h2>3. Il mercato</h2>

        <p>
            Il mercato è il luogo in cui ogni settimana si costruisce
            la propria squadra.
        </p>

        <p>
            Ogni partecipante deve acquistare
            <strong>5 giocatori titolari</strong>, rispettando questa
            composizione:
        </p>

        <ul>
            <li><strong>1 portiere</strong></li>
            <li><strong>1 difensore</strong></li>
            <li><strong>1 centrocampista</strong></li>
            <li><strong>1 attaccante</strong></li>
            <li>
                <strong>1 quinto giocatore</strong>, che può essere un
                difensore, un centrocampista oppure un attaccante.
            </li>
        </ul>

        <p>
            Una volta completati i cinque acquisti titolari, il sistema
            propone la possibilità di acquistare anche delle
            <strong>riserve</strong>.
        </p>

        <p>
            Le riserve sono <strong>facoltative</strong> e possono essere:
        </p>

        <ul>
            <li><strong>1 portiere di riserva</strong></li>
            <li>
                <strong>1 giocatore di movimento di riserva</strong>,
                che può essere un difensore, un centrocampista oppure
                un attaccante.
            </li>
        </ul>

        <p>
            Le riserve servono esclusivamente come sostituti nel caso
            in cui uno dei cinque titolari non abbia giocato e quindi
            non abbia ricevuto un voto.
        </p>

        <p>
            Il <strong>portiere di riserva</strong> può sostituire
            esclusivamente il portiere titolare.
        </p>

        <p>
            Il <strong>giocatore di movimento di riserva</strong> può
            sostituire uno qualsiasi dei quattro giocatori di movimento
            titolari.
        </p>

        <p>
            Le riserve non partecipano normalmente al calcolo del punteggio
            e vengono utilizzate solamente quando è necessario sostituire
            un titolare senza voto.
        </p>

        <h3>Un giocatore per squadra</h3>

        <p>
            All'interno della stessa lega,
            <strong>uno stesso calciatore può essere acquistato da un solo
            partecipante</strong>.
        </p>

        <p>
            Una volta acquistato, quel calciatore non sarà più disponibile
            per gli altri partecipanti della stessa lega.
        </p>

        <p>
            Questo rende il mercato ancora più importante: scegliere un
            determinato calciatore può impedire agli altri partecipanti
            della lega di poterlo utilizzare.
        </p>

        <h3>Una nuova squadra ogni settimana</h3>

        <p>
            I calciatori acquistati valgono solamente per la giornata
            in corso.
        </p>

        <p>
            Quando la giornata termina, la squadra viene azzerata.
            Con la nuova giornata si riparte quindi da zero e ogni
            partecipante dovrà costruire nuovamente la propria squadra.
        </p>


        <h2>4. Chiusura del mercato</h2>

        <p>
            Il mercato viene chiuso automaticamente
            <strong>ogni venerdì alle ore 14:00</strong>.
        </p>

        <p>
            Dopo la chiusura non è più possibile acquistare nuovi
            calciatori per la giornata in corso.
        </p>

        <p>
            Gli acquisti saranno nuovamente disponibili dopo la conclusione
            della giornata e la successiva assegnazione alle leghe.
        </p>

        <p>
            A quel punto si apre il mercato della nuova giornata e tutti
            potranno costruire la propria nuova squadra.
        </p>


        <h2>5. Le leghe</h2>

        <p>
            Ogni settimana il sistema assegna automaticamente i partecipanti
            alle leghe.
        </p>

        <p>
            Tutti gli utenti iscritti vengono divisi
            <strong>in modo casuale</strong> in gruppi da un massimo di
            <strong>8 partecipanti</strong>.
        </p>

        <p>
            L'assegnazione viene effettuata nuovamente per ogni giornata.
        </p>

        <p>
            Per questo motivo, da una settimana all'altra è possibile
            ritrovarsi in una lega diversa e affrontare partecipanti diversi.
        </p>


        <h2>6. Gli scontri</h2>

        <p>
            All'interno della propria lega, ogni partecipante affronta
            un altro partecipante in uno scontro diretto.
        </p>

        <p>
            Gli scontri vengono creati dopo la chiusura del mercato.
        </p>

        <p>
            Una volta creati, sarà possibile vedere il proprio avversario,
            i calciatori acquistati dai due partecipanti e le altre
            informazioni relative alla lega e alla sfida.
        </p>

        <p>
            Quando saranno disponibili i voti dei calciatori, il sistema
            calcolerà automaticamente il risultato dello scontro.
        </p>


        <h2>7. Come si decide chi vince</h2>

        <p>
            Il punteggio ottenuto dalla squadra viene trasformato in
            <strong>gol</strong>.
        </p>

        <p>
            Il primo gol viene assegnato al raggiungimento di
            <strong>28 punti</strong>.
        </p>

        <p>
            Dopodiché viene assegnato
            <strong>un ulteriore gol ogni 2,5 punti</strong>.
        </p>

        <p>
            Il risultato dello scontro viene quindi deciso in base al
            numero di gol realizzati dai due partecipanti.
        </p>

        <p>
            Chi realizza più gol vince lo scontro.
        </p>

        <p>
            Se i due partecipanti realizzano lo stesso numero di gol,
            lo scontro termina in pareggio.
        </p>


        <h2>8. I crediti degli scontri</h2>

        <p>In base al risultato dello scontro vengono assegnati:</p>

        <div class="rules-credit-table">

            <div class="rules-credit-row">
                <span>🏆 Vittoria</span>
                <strong>16 crediti</strong>
            </div>

            <div class="rules-credit-row">
                <span>🤝 Pareggio</span>
                <strong>8 crediti</strong>
            </div>

            <div class="rules-credit-row">
                <span>❌ Sconfitta</span>
                <strong>0 crediti</strong>
            </div>

        </div>

        <p>
            I crediti vengono aggiunti automaticamente al proprio saldo.
        </p>


        <h2>9. I voti dei calciatori</h2>

        <p>
            I voti utilizzati per il calcolo dei punteggi vengono presi
            dal sito <strong>Fantacalcio.it</strong>.
        </p>

        <p>
            Una volta disponibili i voti, il sistema aggiorna i punteggi
            e calcola automaticamente gli scontri della giornata.
        </p>


        <h2>10. La mia formazione</h2>

        <p>
            Nella sezione <strong>La mia formazione</strong> è possibile
            vedere tutti i calciatori acquistati per la giornata in corso.
        </p>

        <p>
            Dopo la creazione degli scontri sarà inoltre possibile vedere
            le informazioni relative al proprio avversario e ai calciatori
            acquistati dall'altro partecipante.
        </p>

        <p>
            La sezione permette quindi di avere sempre sotto controllo
            la propria squadra e la sfida della giornata.
        </p>


        <h2>11. Le statistiche</h2>

        <p>
            La sezione <strong>Statistiche</strong> raccoglie alcune
            informazioni personali sull'andamento del proprio gioco.
        </p>

        <p>È possibile consultare, tra le altre cose:</p>

        <ul>
            <li>la telecronaca dell'ultima giornata conclusa;</li>
            <li>il punteggio ottenuto;</li>
            <li>alcune statistiche personali;</li>
            <li>i risultati dei propri <strong>ultimi cinque scontri</strong>;</li>
            <li>altre informazioni relative al proprio andamento nel gioco.</li>
        </ul>

        <p>
            Le statistiche vengono aggiornate con l'elaborazione delle giornate.
        </p>


        <h2>12. Le classifiche</h2>

        <p>
            Fanta 5 prevede due classifiche:
        </p>

        <ul>
            <li><strong>Classifica a punti</strong></li>
            <li><strong>Classifica F1</strong></li>
        </ul>

        <p>
            Le classifiche vengono aggiornate in base ai risultati ottenuti
            durante le varie giornate.
        </p>


        <h2>13. I quiz</h2>

        <p>
            Ogni giorno è disponibile un
            <strong>quiz dedicato al calcio internazionale</strong>.
        </p>

        <p>
            Il quiz permette di ottenere crediti aggiuntivi, che potranno
            essere utilizzati per acquistare i calciatori durante il mercato.
        </p>

        <p>
            La velocità conta:
            <strong>più velocemente si risponde, più crediti si possono ottenere.</strong>
        </p>

        <p>
            Se il quiz non viene ancora completato, il sistema può inviare
            una notifica per ricordare che c'è ancora la possibilità di
            giocare e ottenere crediti.
        </p>


        <h2>14. Le notifiche</h2>

        <p>
            Fanta 5 dispone di un sistema di notifiche per tenere i
            partecipanti aggiornati sulle principali attività del gioco.
        </p>

        <p>
            Quando una giornata viene conclusa, è possibile ricevere
            una notifica che avvisa della conclusione della giornata
            e dell'apertura della nuova giornata.
        </p>

        <p>Da quel momento sarà possibile:</p>

        <ul>
            <li>andare nelle proprie statistiche e vedere il risultato ottenuto;</li>
            <li>consultare le statistiche aggiornate;</li>
            <li>controllare le classifiche;</li>
            <li>vedere la nuova lega a cui si è stati assegnati;</li>
            <li>iniziare a costruire la nuova squadra.</li>
        </ul>

        <p>
            Il sistema può inoltre inviare un promemoria quando il
            <strong>quiz giornaliero non è ancora stato completato</strong>.
        </p>


        <h2>15. Le impostazioni</h2>

        <p>
            Nella sezione <strong>Impostazioni</strong> è possibile gestire
            alcune preferenze personali dell'app.
        </p>

        <p>Tra queste:</p>

        <ul>
            <li>
                <strong>Musica:</strong> è possibile disattivare la musica
                dell'app.
            </li>
            <li>
                <strong>Notifiche:</strong> è possibile abilitare o
                disabilitare le notifiche.
            </li>
        </ul>

        <p>
            Le notifiche permettono di ricevere gli aggiornamenti relativi
            alle principali attività di Fanta 5.
        </p>

    `;
}


// ============================================
// INIZIALIZZAZIONE
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    const openRulesButton =
        document.getElementById('open_rules');

console.log("PULSANTE REGOLAMENTO:", openRulesButton);
    const closeRulesButton =
        document.getElementById('close_rules');

    if (openRulesButton) {

        openRulesButton.addEventListener(
            'click',
            () => {

                loadRegolamento();
                openRegolamento();

            }
        );

    }

    if (closeRulesButton) {

        closeRulesButton.addEventListener(
            'click',
            closeRegolamento
        );

    }

});
