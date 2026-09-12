let currentQuestion = null;
let seconds = 120;
let timer = null;

async function loadQuestion() {

    const { data, error } = await supabaseClient
        .from('score_questions')
        .select('*')
        .limit(1);

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

    startTimer();
}

function startTimer() {

    seconds = 120;

    document.getElementById('timer').textContent = seconds;

    timer = setInterval(() => {

        seconds--;

        document.getElementById('timer').textContent = seconds;

        if (seconds <= 0) {

            clearInterval(timer);

            document.getElementById('timer').textContent =
                'TEMPO SCADUTO';

            disableButtons();
        }

    }, 1000);
}

function disableButtons() {

    document.querySelectorAll('.option').forEach(button => {
        button.disabled = true;
    });
}
