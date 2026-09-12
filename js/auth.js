async function registerUser() {

    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;
    const username = document.getElementById('register_username').value;

    if (!email || !password || !username) {
        document.getElementById('auth_message').textContent =
            'Compila tutti i campi.';
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
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
            'Controlla la tua email per confermare la registrazione.';
        return;
    }

    const { error: profileError } = await supabaseClient
        .from('score_users')
        .update({
            username: username
        })
        .eq('id', user.id);

    if (profileError) {
        console.error(profileError);

        document.getElementById('auth_message').textContent =
            'Account creato, ma si è verificato un problema con lo username.';

        return;
    }

    document.getElementById('auth_message').textContent =
        'Registrazione completata!';

}


async function loginUser() {

    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error(error);

        document.getElementById('auth_message').textContent =
            error.message;

        return;
    }

    document.getElementById('auth_message').textContent =
        'Accesso effettuato!';

    console.log('Utente collegato:', data.user.id);
}
