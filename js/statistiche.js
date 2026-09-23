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
}
document.getElementById('open_stats').addEventListener('click', async () => {
    await loadStats();
});
