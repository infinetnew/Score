let currentQuestion = null;
let seconds = 120;
let timer = null;
let quizStartedAt = null;

async function loadQuestion() {

    const { data, error } = await supabaseClient
        .rpc('score_get_today_quiz');

    if (error) {
        console.error('Errore Supabase:', error);

        document.getElementById('question').textContent =
            'Errore nel caricamento della domanda.';

        return;
    }

    if (!data || data.length === 0) {
        document.getElementById('question').textContent =
            'Nessuna domanda disponibile.';

        return;
    }

    currentQuestion = data[0];

    document.getElementById('question').textContent =
        currentQuestion.question;

    document.getElementById('option_a').textContent =
        currentQuestion.option_a;

    document.getElementById('option_b').textContent =
        currentQuestion.option_b;

    document.getElementById('option_c').textContent =
        currentQuestion.option_c;

    document.getElementById('option_d').textContent =
        currentQuestion.option_d;

    await loadQuizStartTime();
}


async function loadQuizStartTime() {

    const { data, error } = await supabaseClient
        .from('score_quiz_sessions')
        .select('started_at, completed_at')
        .eq('question_id', currentQuestion.id)
        .maybeSingle();

    if (error) {
        console.error('Errore caricamento sessione:', error);
        return;
    }

    if (!data) {
        console.error('Sessione quiz non trovata.');
        return;
    }

    quizStartedAt = new Date(data.started_at);

    if (data.completed_at) {
        clearInterval(timer);
        document.getElementById('timer').textContent =
            'QUIZ COMPLETATO';
        disableButtons();
        return;
    }

    startTimer();
}


function startTimer() {

    clearInterval(timer);

    updateTimer();

    timer = setInterval(() => {

        updateTimer();

    }, 1000);
}


function updateTimer() {

    const now = new Date();

    const elapsedSeconds =
        Math.floor((now - quizStartedAt) / 1000);

    seconds = Math.max(0, 120 - elapsedSeconds);

    document.getElementById('timer').textContent = seconds;

    if (seconds <= 0) {

        clearInterval(timer);

        document.getElementById('timer').textContent =
            'TEMPO SCADUTO';

        disableButtons();
    }
}


function disableButtons() {

    document.querySelectorAll('.option').forEach(button => {
        button.disabled = true;
    });
}


document.getElementById('close_quiz').addEventListener('click', () => {

    clearInterval(timer);

    document.getElementById('quiz_screen').style.display = 'none';

});
