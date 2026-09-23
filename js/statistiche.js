document.getElementById('open_stats').addEventListener('click', () => {

    const app = document.getElementById('app');
    const statsScreen = document.getElementById('stats_screen');

    Array.from(app.children).forEach(element => {
        if (element.id !== 'stats_screen') {
            element.style.display = 'none';
        }
    });

    statsScreen.style.display = 'flex';
});
