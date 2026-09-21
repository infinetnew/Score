async function registerUser() {

    const username =
        document.getElementById('register_username').value.trim();

    const email =
        document.getElementById('register_email').value.trim();

    const password =
        document.getElementById('register_password').value;

    const passwordConfirm =
        document.getElementById('register_password_confirm').value;


    if (!username || !email || !password || !passwordConfirm) {

        document.getElementById('auth_message').textContent =
            'Compila tutti i campi.';

        return;
    }
// Controllo formato email
const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {

    document.getElementById('auth_message').textContent =
        'Inserisci un indirizzo email valido.';

    return;
}

    if (password !== passwordConfirm) {

        document.getElementById('auth_message').textContent =
            'Le password non coincidono.';

        return;
    }


// Controlliamo se il nickname è già utilizzato
const { data: usernameExists, error: nicknameError } =
    await supabaseClient.rpc(
        'score_username_exists',
        {
            p_username: username
        }
    );


    if (nicknameError) {

        console.error(nicknameError);

        document.getElementById('auth_message').textContent =
            'Errore nel controllo del nickname.';

        return;
    }


if (usernameExists) {

    document.getElementById('auth_message').textContent =
        'Questo nickname è già utilizzato. Scegline un altro.';

    return;
}


    // Creazione account
    const { data, error } =
        await supabaseClient.auth.signUp({
            email: email,
            password: password
        });


if (error) {

    console.error(error);

    document.getElementById('auth_message').textContent =
        'Questa email è già associata a un altro utente.';

    return;
}


    const user = data.user;


    if (!user) {

        document.getElementById('auth_message').textContent =
            'Impossibile creare l’account.';

        return;
    }


    console.log('Account creato:', user.id);


    // Salviamo il nickname
    const { error: profileError } =
        await supabaseClient
            .from('score_users')
            .update({
                username: username
            })
            .eq('id', user.id);


    if (profileError) {

        console.error(profileError);

        document.getElementById('auth_message').textContent =
            'Account creato, ma non riesco a salvare il nickname.';

        return;
    }


    console.log('Nickname salvato:', username);


    // Login automatico
    const { data: loginData, error: loginError } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


    if (loginError) {

        console.error(loginError);

        document.getElementById('auth_message').textContent =
            'Account creato, ma il login automatico non è riuscito.';

        return;
    }


    console.log('Login automatico effettuato:', loginData.user.id);


    // Entriamo nell'app
    enterApp(username);
}



async function loginUser() {

    const email =
        document.getElementById('login_email').value.trim();

    const password =
        document.getElementById('login_password').value;


    if (!email || !password) {

        document.getElementById('auth_message').textContent =
            'Inserisci email e password.';

        return;
    }


    // Login
    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


if (error) {

    console.error(error);

    document.getElementById('auth_message').textContent =
        'Email o password non corrette.';

    return;
}

    console.log('Utente collegato:', data.user.id);


    // Recuperiamo lo username
    const { data: profile, error: profileError } =
        await supabaseClient
            .from('score_users')
            .select('username')
            .eq('id', data.user.id)
            .single();


    if (profileError) {

        console.error(profileError);

        document.getElementById('auth_message').textContent =
            'Accesso effettuato, ma non riesco a recuperare il tuo profilo.';

        return;
    }


    const username = profile.username || 'giocatore';


    // Entriamo nell'app
    enterApp(username);
}



function enterApp(username) {

    // Nasconde login / registrazione
    document.querySelector('.auth-container').style.display =
        'none';


    // Mostra l'app
    document.getElementById('app').style.display =
        'block';


    // Mostra il nome
    document.getElementById('welcome_user').textContent =
        'Bentornato ' + username + '!';
    // Carica i crediti
    loadCredits();
loadNextH2H();
}
async function loadCredits() {

    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        console.error('Sessione non trovata:', sessionError);
        return;
    }

    const userId = sessionData.session.user.id;

    const { data, error } =
        await supabaseClient
            .from('score_credit_transactions')
            .select('amount')
            .eq('user_id', userId);

    if (error) {
        console.error('Errore caricamento crediti:', error);
        return;
    }

    const balance = data.reduce(
        (total, transaction) => total + transaction.amount,
        0
    );

    document.getElementById('credit_balance').textContent =
        balance + ' crediti';
}
async function loadNextH2H() {

    const { data: matchday, error: matchdayError } =
        await supabaseClient.rpc('score_get_active_matchday');

    if (matchdayError || !matchday) {
        console.error('Errore giornata:', matchdayError);
        return;
    }

const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

if (sessionError || !sessionData.session) {
    console.error('Sessione non trovata:', sessionError);
    return;
}

const userId = sessionData.session.user.id;


// Recuperiamo la lega dell'utente
const { data: leagueData, error: leagueError } =
    await supabaseClient
        .from('score_league_members')
        .select('league_number, matchday')
        .eq('matchday', matchday)
        .eq('user_id', userId)
        .maybeSingle();

if (leagueError || !leagueData) {
    console.error('Errore recupero lega:', leagueError);
    return;
}

const leagueNumber = leagueData.league_number;
const leagueMatchday = leagueData.matchday;


// Recuperiamo tutti i partecipanti della lega
const { data: leagueMembers, error: membersError } =
    await supabaseClient
        .from('score_league_members')
        .select('user_id')
        .eq('matchday', matchday)
        .eq('league_number', leagueNumber);

if (membersError) {
    console.error('Errore recupero partecipanti:', membersError);
    return;
}


// Recuperiamo gli username
const leagueUserIds = leagueMembers.map(member => member.user_id);

const { data: leagueUsers, error: usersError } =
    await supabaseClient
        .from('score_users')
        .select('id, username')
        .in('id', leagueUserIds);

if (usersError) {
    console.error('Errore recupero username:', usersError);
    return;
}



// Recuperiamo tutti gli scontri della giornata
const { data: leagueMatches, error: leagueMatchesError } =
    await supabaseClient
        .from('score_h2h_matches')
        .select('player1_id, player2_id')
        .eq('matchday', matchday);

if (leagueMatchesError) {
    console.error('Errore recupero scontri:', leagueMatchesError);
    return;
}




// Solo gli scontri della nostra lega
const myLeagueMatches = leagueMatches.filter(match =>
    leagueUserIds.includes(match.player1_id) &&
    leagueUserIds.includes(match.player2_id)
);


const matchContainer =
    document.getElementById('next_h2h_match');


let html = `
<div class="h2h-league-title">
    <img src="/Score/assets/giornata.png" alt="Giornata">
    Giornata ${leagueMatchday}
    <span>—</span>
    <img src="/Score/assets/lega.png" alt="Lega">
    Lega ${leagueNumber}
</div>
`;


// =========================================
// SE GLI SCONTRI NON SONO ANCORA CREATI
// =========================================

if (myLeagueMatches.length === 0) {

    html += `
        <div class="h2h-league-members">

            <h3>
    <img src="/Score/assets/partecipanti.png" alt="Partecipanti">
    PARTECIPANTI
</h3>
    `;

    leagueMembers.forEach(member => {

const user = leagueUsers.find(
    u => u.id === member.user_id
);

const username =
    user?.username || 'Giocatore';

const isMe =
    member.user_id === userId;

html += `
    <div class="h2h-league-member ${isMe ? 'my-league-member' : ''}">
        <img src="/Score/assets/giocatore.png" alt="Giocatore">
        ${username}
    </div>
`;
    });

    html += `
            <p class="h2h-waiting-message">
    <img src="/Score/assets/clessidra.png" alt="Attesa">
    Scontri da creare.
</p>

        </div>
    `;

} else {

    // =========================================
    // SCONTRI DELLA LEGA
    // =========================================

    html += `
        <h3>
    <img src="/Score/assets/scontri-lega.png" alt="Scontri">
    Scontri della Lega
</h3>
    `;

    myLeagueMatches.forEach(match => {

        const user1 = leagueMembers.find(
            member => member.user_id === match.player1_id
        );

        const user2 = leagueMembers.find(
            member => member.user_id === match.player2_id
        );

        if (!user1 || !user2) return;

const username1 =
    leagueUsers.find(u => u.id === match.player1_id)?.username || 'Giocatore';

const username2 =
    leagueUsers.find(u => u.id === match.player2_id)?.username || 'Giocatore';

        const isMyMatch =
            match.player1_id === userId ||
            match.player2_id === userId;

html += `
    <div
        class="h2h-match ${isMyMatch ? 'my-h2h-match' : ''}"
        data-player1="${match.player1_id}"
        data-player2="${match.player2_id}"
        data-matchday="${matchday}"
    >

        <span>${username1}</span>

        <img
            src="/Score/assets/vs.png"
            alt="VS"
        >

        <span>${username2}</span>

        <button
            class="h2h-view-formations"
            type="button"
        >
            VEDI FORMAZIONI
        </button>

    </div>
`;
    });
}


matchContainer.innerHTML = html;
matchContainer
    .querySelectorAll('.h2h-view-formations')
    .forEach(button => {

        button.addEventListener('click', async (event) => {

            event.stopPropagation();

            const match = button.closest('.h2h-match');

            if (!match) {
                return;
            }

            const player1Id = match.dataset.player1;
            const player2Id = match.dataset.player2;
            const matchday = Number(match.dataset.matchday);

            await openH2HFormations(
                player1Id,
                player2Id,
                matchday
            );

        });

    });

}
async function openH2HFormations(
    player1Id,
    player2Id,
    matchday
) {

    const container =
        document.getElementById('h2h_formations_container');

    if (!container) {
        console.error(
            'Contenitore formazioni H2H non trovato.'
        );
        return;
    }

    console.log(
        'Caricamento formazioni H2H:',
        {
            player1Id,
            player2Id,
            matchday
        }
    );


    // =========================================
    // RECUPERIAMO I GIOCATORI DEI DUE UTENTI
    // =========================================

    const { data: purchases, error: purchasesError } =
        await supabaseClient
            .from('score_purchases')
            .select(`
                user_id,
                player_id,
                slot_type,
                league_number,
                score_players (
                    id,
                    name,
                    role,
                    team,
                    team_logo
                )
            `)
            .in('user_id', [player1Id, player2Id])
            .eq('matchday', matchday);


    if (purchasesError) {

        console.error(
            'Errore caricamento formazioni H2H:',
            purchasesError
        );

        container.innerHTML = `
            <p>
                Errore nel caricamento delle formazioni.
            </p>
        `;

        container.style.display = 'block';

        return;
    }


    console.log(
        'Giocatori H2H recuperati:',
        purchases
    );


    // =========================================
    // DIVIDIAMO LE DUE FORMAZIONI
    // =========================================

    const formation1 =
        purchases.filter(
            purchase =>
                purchase.user_id === player1Id
        );

    const formation2 =
        purchases.filter(
            purchase =>
                purchase.user_id === player2Id
        );


    console.log(
        'Formazione giocatore 1:',
        formation1
    );

    console.log(
        'Formazione giocatore 2:',
        formation2
    );


    // =========================================
    // MOSTRIAMO IL CONTENITORE
    // =========================================

    container.style.display = 'block';

    container.innerHTML = `
        <div class="h2h-formations-test">

            <h3>FORMAZIONI</h3>

            <div>
                <strong>Giocatore 1</strong>
            </div>

            <div>
                ${formation1.map(purchase => `
                    <div>
                        ${purchase.score_players?.name || 'Giocatore'}
                        -
                        ${purchase.score_players?.role || ''}
                        -
                        ${purchase.slot_type}
                    </div>
                `).join('')}
            </div>

            <br>

            <div>
                <strong>Giocatore 2</strong>
            </div>

            <div>
                ${formation2.map(purchase => `
                    <div>
                        ${purchase.score_players?.name || 'Giocatore'}
                        -
                        ${purchase.score_players?.role || ''}
                        -
                        ${purchase.slot_type}
                    </div>
                `).join('')}
            </div>

        </div>
    `;

}
document.getElementById('open_h2h').addEventListener('click', () => {

    document.getElementById('h2h_screen').style.display = 'flex';

    loadNextH2H();

});


document.getElementById('close_h2h').addEventListener('click', () => {

    document.getElementById('h2h_screen').style.display = 'none';

});
document.getElementById('logout_button').addEventListener('click', async () => {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('Errore disconnessione:', error);
        return;
    }

    location.reload();
});
document.getElementById('send_reset_email')
    .addEventListener('click', async () => {

        const email =
            document.getElementById('forgot_password_email').value.trim();

        const message =
            document.getElementById('forgot_password_message');

        if (!email) {
            message.textContent = 'Inserisci la tua email.';
            return;
        }

        message.textContent = 'Invio link...';

        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });

        if (error) {
            console.error('Errore recupero password:', error);

            message.textContent =
                'Non è stato possibile inviare il link.';
            return;
        }

        message.textContent =
            'Controlla la tua email: ti abbiamo inviato il link per reimpostare la password.';
    });
// SALVATAGGIO NUOVA PASSWORD
document.getElementById('save_new_password')
    .addEventListener('click', async () => {

        const password =
            document.getElementById('reset_password').value;

        const confirmPassword =
            document.getElementById('reset_password_confirm').value;

        const message =
            document.getElementById('reset_password_message');


        // Controllo campi vuoti
        if (!password || !confirmPassword) {

            message.textContent =
                'Compila entrambi i campi.';

            return;
        }


        // Controllo corrispondenza
        if (password !== confirmPassword) {

            message.textContent =
                'Le password non coincidono.';

            return;
        }


        // Aggiornamento password
        const { error } =
            await supabaseClient.auth.updateUser({
                password: password
            });


        if (error) {

            console.error(
                'Errore aggiornamento password:',
                error
            );

            message.textContent =
                'Non è stato possibile aggiornare la password.';

            return;
        }


message.textContent =
    'Password aggiornata con successo!';

setTimeout(() => {

    // Rimuoviamo il riferimento al recupero password
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );

    // Ricarichiamo la pagina
    // Supabase troverà la sessione e aprirà direttamente il gioco
    window.location.reload();

}, 1000);

    });
