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

    document.getElementById('question').innerHTML =
        '🧠 <strong>Oggi niente quiz!</strong><br>' +
        'Le sfide tornano da lunedì a giovedì. ⚡<br>' +
        'Nel frattempo, tieniti pronto… la prossima domanda potrebbe valere crediti preziosi! 🪙';

    document.querySelector('.quiz-options').style.display = 'none';

    document.getElementById('confirm_quiz').style.display = 'none';

    document.getElementById('timer').textContent = '';

    return;
}
document.querySelector('.quiz-options').style.display = '';
document.getElementById('confirm_quiz').style.display = '';
document.getElementById('timer').style.display = '';

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

    // Nascondi completamente il timer
    document.getElementById('timer').style.display = 'none';

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


    document.getElementById('timer').innerHTML =
        `<img src="/Score/assets/orologio.png" class="quiz-timer-icon" alt="Tempo"> : ${seconds}`;


    if (seconds <= 0) {

        clearInterval(timer);

        document.getElementById('timer').textContent =
            'Tempo Scaduto';


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

loadCredits();
    // ==========================================
    // RISPOSTA CORRETTA
    // ==========================================

    if (result.correct) {

 document.getElementById('question').innerHTML =
    '<img src="/Score/assets/complimenti.png" class="quiz-correct-icon" alt="Complimenti">' +
    ' Complimenti! La soluzione è corretta.';


document.getElementById('timer').innerHTML =
    'Hai guadagnato: <span class="quiz-credits-earned">+' +
    result.credits_earned +
    ' CREDITI</span>';

    }


// ==========================================
// RISPOSTA SBAGLIATA
// ==========================================

else {

    document.getElementById('question').innerHTML =
        '<img src="/Score/assets/sbagliata.png" class="quiz-correct-icon" alt="Peccato">' +
        ' Peccato! Soluzione sbagliata.';

    document.getElementById('timer').innerHTML =
        'Hai guadagnato: <span class="quiz-credits-earned">0 CREDITI</span>';
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
