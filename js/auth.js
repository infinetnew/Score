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


    // Salviamo lo username
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
            'Account creato, ma non riesco a salvare il nome utente.';

        return;
    }


    console.log('Username salvato:', username);


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
}
