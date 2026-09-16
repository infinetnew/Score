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


    if (password !== passwordConfirm) {

        document.getElementById('auth_message').textContent =
            'Le password non coincidono.';

        return;
    }


    // Controlliamo se il nickname è già utilizzato
    const { data: existingUser, error: nicknameError } =
        await supabaseClient
            .from('score_users')
            .select('id')
            .eq('username', username)
            .maybeSingle();


    if (nicknameError) {

        console.error(nicknameError);

        document.getElementById('auth_message').textContent =
            'Errore nel controllo del nickname.';

        return;
    }


    if (existingUser) {

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
            error.message;

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
            error.message;

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
    // Recuperiamo la lega dell'utente nella giornata attiva
    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        console.error('Sessione non trovata:', sessionError);
        return;
    }

    const userId = sessionData.session.user.id;

    const { data: leagueData, error: leagueError } =
        await supabaseClient
            .from('score_league_members')
            .select('league_number')
            .eq('matchday', matchday)
            .eq('user_id', userId)
            .single();

    if (leagueError || !leagueData) {
        console.error('Errore recupero lega:', leagueError);
        return;
    }

    const leagueNumber = leagueData.league_number;
// Recuperiamo tutti gli utenti della stessa lega
const { data: leagueMembers, error: membersError } =
    await supabaseClient
        .from('score_league_members')
        .select('user_id')
        .eq('matchday', matchday)
        .eq('league_number', leagueNumber);

if (membersError) {
    console.error('Errore recupero membri della lega:', membersError);
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

console.log('Membri della mia lega:', leagueUsers);
    // Recuperiamo tutti gli scontri della lega
    const { data: leagueMatches, error: leagueMatchesError } =
        await supabaseClient
            .from('score_h2h_matches')
            .select(`
                player1_id,
                player2_id
            `)
            .eq('matchday', matchday);

    if (leagueMatchesError) {
        console.error('Errore recupero scontri della lega:', leagueMatchesError);
        return;
    }

    console.log('Scontri della giornata:', leagueMatches);
    // ID degli utenti appartenenti alla mia lega
    const leagueUserIds = leagueMembers.map(member => member.user_id);

    // Teniamo solo gli scontri tra utenti della mia lega
const myLeagueMatches = leagueMatches.filter(match =>
    leagueUserIds.includes(match.player1_id) &&
    leagueUserIds.includes(match.player2_id)
);

    console.log('Scontri della mia lega:', myLeagueMatches);

    const { data: match, error: matchError } =
        await supabaseClient.rpc(
            'score_get_my_h2h_match',
            {
                p_matchday: matchday
            }
        );

    if (matchError) {
        console.error('Errore scontro:', matchError);

        document.getElementById('next_h2h_match').textContent =
            'Errore nel caricamento dello scontro';

        return;
    }

    if (!match || match.length === 0) {

        document.getElementById('next_h2h_match').textContent =
            'Nessuno scontro assegnato';

        return;
    }

    const matchContainer =
        document.getElementById('next_h2h_match');

    let html = `
        <div class="h2h-league-title">
            🏆 LEGA ${leagueNumber}
        </div>
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
            user1.score_users?.username || 'Giocatore';

        const username2 =
            user2.score_users?.username || 'Giocatore';

const isMyMatch =
    match.player1_id === userId ||
    match.player2_id === userId;

        html += `
            <div class="h2h-match ${isMyMatch ? 'my-h2h-match' : ''}">
                <span>${username1}</span>

                <img
                    src="/Score/assets/vs.png"
                    alt="VS"
                >

                <span>${username2}</span>
            </div>
        `;
    });

    matchContainer.innerHTML = html;
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
