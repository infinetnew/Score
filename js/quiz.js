let currentQuestion = null;
let seconds = 120;
let timer = null;
let quizStartedAt = null;
let answerSubmitted = false;

async function loadQuestion() {

    clearInterval(timer);

    answerSubmitted = false;

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

    // Riattiva i pulsanti
    document.querySelectorAll('.option').forEach(button => {
        button.disabled = false;
    });

    // Recupera l'orario della prima apertura
    quizStartedAt = new Date(currentQuestion.started_at);

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


async function submitAnswer(answer) {

    // Evita doppi click
    if (answerSubmitted) {
        return;
    }

    // Se il tempo è scaduto
    if (seconds <= 0) {
        return;
    }

    answerSubmitted = true;

    clearInterval(timer);

    disableButtons();

    const { data, error } = await supabaseClient
        .rpc('score_submit_quiz_answer', {
            p_question_id: currentQuestion.id,
            p_answer: answer
        });

    if (error) {

        console.error('Errore invio risposta:', error);

        answerSubmitted = false;

        document.querySelectorAll('.option').forEach(button => {
            button.disabled = false;
        });

        return;
    }

    console.log('Risultato quiz:', data);

    const result = data[0];

    if (result.correct) {

        document.getElementById('timer').textContent =
            '+' + result.credits_earned + ' CREDITI';

    } else {

        document.getElementById('timer').textContent =
            'RISPOSTA ERRATA';

    }
}


// =========================
// RISPOSTE A / B / C / D
// =========================

document.getElementById('option_a').addEventListener('click', () => {
    submitAnswer('A');
});

document.getElementById('option_b').addEventListener('click', () => {
    submitAnswer('B');
});

document.getElementById('option_c').addEventListener('click', () => {
    submitAnswer('C');
});

document.getElementById('option_d').addEventListener('click', () => {
    submitAnswer('D');
});


// =========================
// CHIUDI QUIZ
// =========================

document.getElementById('close_quiz').addEventListener('click', () => {

    clearInterval(timer);

    document.getElementById('quiz_screen').style.display = 'none';

});
