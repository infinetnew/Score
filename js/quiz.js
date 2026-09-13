let currentQuestion = null;
let seconds = 120;
let timer = null;
let quizStartedAt = null;
let answerSubmitted = false;


// ==========================================
// CARICA IL QUIZ
// ==========================================

async function loadQuestion() {

    clearInterval(timer);

    answerSubmitted = false;

    // Reset delle risposte
    document.querySelectorAll('input[name="quiz_answer"]').forEach(input => {
        input.checked = false;
        input.disabled = false;
    });

    document.getElementById('confirm_quiz').disabled = false;


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


    // ==========================================
    // CONTROLLO: QUIZ GIÀ COMPLETATO
    // ==========================================

if (currentQuestion.completed_at) {

    document.getElementById('question').textContent =
        'Hai già risposto al quiz di oggi!';

    // Nascondi completamente le risposte
    document.querySelector('.quiz-options').style.display = 'none';

    // Nascondi completamente il pulsante conferma
    document.getElementById('confirm_quiz').style.display = 'none';

    // Mostra lo stato del quiz
    document.getElementById('timer').textContent =
        'QUIZ COMPLETATO';

    return;
}


    // ==========================================
    // QUIZ NON ANCORA COMPLETATO
    // ==========================================

    document.getElementById('question').textContent =
        currentQuestion.question;


    document.getElementById('option_a_text').textContent =
        currentQuestion.option_a;

    document.getElementById('option_b_text').textContent =
        currentQuestion.option_b;

    document.getElementById('option_c_text').textContent =
        currentQuestion.option_c;

    document.getElementById('option_d_text').textContent =
        currentQuestion.option_d;


    // Recupera l'orario della prima apertura
    quizStartedAt = new Date(currentQuestion.started_at);

    startTimer();
}


// ==========================================
// TIMER
// ==========================================

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


    document.getElementById('timer').textContent =
        seconds;


    if (seconds <= 0) {

        clearInterval(timer);

        document.getElementById('timer').textContent =
            'TEMPO SCADUTO';


        document.querySelectorAll('input[name="quiz_answer"]').forEach(input => {
            input.disabled = true;
        });


        document.getElementById('confirm_quiz').disabled = true;
    }
}


// ==========================================
// INVIA RISPOSTA
// ==========================================

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


    // Disabilita le risposte
    document.querySelectorAll('input[name="quiz_answer"]').forEach(input => {
        input.disabled = true;
    });


    document.getElementById('confirm_quiz').disabled = true;


    const { data, error } = await supabaseClient
        .rpc('score_submit_quiz_answer', {
            p_question_id: currentQuestion.id,
            p_answer: answer
        });


    if (error) {

        console.error('Errore invio risposta:', error);

        answerSubmitted = false;


        document.querySelectorAll('input[name="quiz_answer"]').forEach(input => {
            input.disabled = false;
        });


        document.getElementById('confirm_quiz').disabled = false;

        return;
    }


    console.log('Risultato quiz:', data);


    const result = data[0];


    // ==========================================
    // RISPOSTA CORRETTA
    // ==========================================

    if (result.correct) {

        document.getElementById('question').textContent =
            '🎉 Complimenti! La soluzione è corretta.';


        document.getElementById('timer').textContent =
            '+' + result.credits_earned + ' CREDITI';

    }


    // ==========================================
    // RISPOSTA SBAGLIATA
    // ==========================================

    else {

        document.getElementById('question').textContent =
            '❌ Soluzione sbagliata.';


        document.getElementById('timer').textContent =
            '0 CREDITI';
    }
}


// ==========================================
// CONFERMA RISPOSTA
// ==========================================

document.getElementById('confirm_quiz')
    .addEventListener('click', () => {

        const selected =
            document.querySelector('input[name="quiz_answer"]:checked');


        if (!selected) {

            document.getElementById('question').textContent =
                'Seleziona una risposta prima di confermare.';

            return;
        }


        submitAnswer(selected.value);
    });


// ==========================================
// CHIUDI QUIZ
// ==========================================

document.getElementById('close_quiz')
    .addEventListener('click', () => {

        clearInterval(timer);

        document.getElementById('quiz_screen').style.display =
            'none';
    });
