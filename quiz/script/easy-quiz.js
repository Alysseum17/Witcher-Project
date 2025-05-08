"use strict";

class Quiz {
  constructor(questions, containerIds) {
    this.questions = questions;
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.isCompleted = false;

    // DOM elements
    this.headerContainer = document.querySelector(containerIds.header);
    this.listContainer = document.querySelector(containerIds.list);
    this.submitBtn = document.querySelector(containerIds.submitBtn);

    // Event listeners
    this.submitBtn.addEventListener("click", () => this.handleSubmit());
  }

  start() {
    this.isCompleted = false;
    this.score = 0;
    this.currentQuestionIndex = 0;
    this._clearPage();
    this._renderQuestion();
    this._updateSubmitButton("Answer");
  }

  _clearPage() {
    this.headerContainer.innerHTML = "";
    this.listContainer.innerHTML = "";
  }

  _renderQuestion() {
    const question = this.questions[this.currentQuestionIndex];

    this.headerContainer.innerHTML = `<h2 class="title">${question.question}</h2>`;

    question.answers.forEach((answer, index) => {
      const answerHTML = `
        <li>
          <label>
            <input type="radio" name="answer" value="${
              index + 1
            }" class="answer">
            <span>${answer}</span>
          </label>
        </li>
      `;
      this.listContainer.insertAdjacentHTML("beforeend", answerHTML);
    });
  }

  _disableInputs() {
    this.listContainer
      .querySelectorAll('input[name="answer"]')
      .forEach((input) => (input.disabled = true));
    this.submitBtn.disabled = true;
  }

  _enableInputs() {
    this.listContainer
      .querySelectorAll('input[name="answer"]')
      .forEach((input) => (input.disabled = false));
    this.submitBtn.disabled = false;
  }

  handleSubmit() {
    if (this.isCompleted) {
      this.start();
      return;
    }

    const selectedAnswer = this._getSelectedAnswer();
    if (!selectedAnswer) return;

    // Перевірка чи правильна відповідь
    const correctIndex = this.questions[this.currentQuestionIndex].correct;
    const isCorrect = parseInt(selectedAnswer.value) === correctIndex;

    // Знаходиться батьківський <label> і додається потрібний клас
    const selectedLabel = selectedAnswer.closest("label");
    selectedLabel.classList.add(isCorrect ? "correct" : "wrong");

    // Блокуєтсья вибір та кнопка answer
    this._disableInputs();

    setTimeout(() => {
      this._checkAnswer(selectedAnswer);
      this._handleNextStep();
    }, 1500);
  }

  _getSelectedAnswer() {
    return this.listContainer.querySelector('input[name="answer"]:checked');
  }

  _checkAnswer(selectedAnswer) {
    const correctIndex = this.questions[this.currentQuestionIndex].correct;
    if (parseInt(selectedAnswer.value) === correctIndex) {
      this.score++;
    }
  }

  _handleNextStep() {
    this._enableInputs(); 
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this._clearPage();
      this._renderQuestion();
    } else {
      this.isCompleted = true;
      this._showResults();
    }
  }

  _showResults() {
    this._clearPage();
    const result = this._calculateResult();

    const resultsHTML = `
      <h2 class="title">${result.title}</h2>
      <h3 class="summary">${result.message}</h3>
      <p class="result">${result.scoreText}</p>
    `;

    this.headerContainer.innerHTML = resultsHTML;
    this._updateSubmitButton("Play again");
  }

  _calculateResult() {
    const correctAnswers = this.score;
    const totalQuestions = this.questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;

    let title, message;
    if (percentage === 100) {
      title = "Congratulations! 🎉";
      message = "You answered all the questions correctly!";
    } else if (percentage >= 50) {
      title = "Well done! 👍";
      message = "You answered most of the questions correctly!";
    } else {
      title = "Can be better! 💪";
      message = "You need to read the material a little more!";
    }

    return {
      title,
      message,
      scoreText: `${correctAnswers} / ${totalQuestions}`,
    };
  }

  _updateSubmitButton(text) {
    this.submitBtn.textContent = text;
  }
}

const questions = [
  {
    question: "What is the name of the main character in The Witcher?",
    answers: ["Geralt", "Ciri", "Dandelion", "Vesemir"],
    correct: 1,
  },
  {
    question: "What is Geralt's nickname?",
    answers: [
      "The White Wolf",
      "The Red Lion",
      "The Black Cat",
      "The Silver Hawk",
    ],
    correct: 1,
  },
  {
    question: "What is the name of Geralt's horse?",
    answers: ["Roach", "Shadow", "Windrunner", "Blaze"],
    correct: 1,
  },
  {
    question: "What is Ciri's full name?",
    answers: [
      "Cirilla Fiona Elen Riannon",
      "Cirilla of Kaer Morhen",
      "Cirilla Geraltovna",
      "Cirilla Nilfgaard",
    ],
    correct: 1,
  },
  {
    question: "Who is the bard and Geralt's close friend?",
    answers: ["Dandelion", "Triss", "Zoltan", "Emhyr"],
    correct: 1,
  },
  {
    question: "What monster is weak to silver weapons?",
    answers: ["Ghouls", "Humans", "Bandits", "Knights"],
    correct: 1,
  },
  {
    question: "What is the name of the Witchers' fortress?",
    answers: ["Kaer Morhen", "Novigrad", "Oxenfurt", "Skellige"],
    correct: 1,
  },
  {
    question: "Which of these is a Witcher sign?",
    answers: ["Aard", "Frost", "Blast", "Blink"],
    correct: 1,
  },
  {
    question: "What does Geralt drink to enhance his abilities?",
    answers: ["Potions", "Tea", "Milk", "Wine"],
    correct: 1,
  },
  {
    question: "Who is the Emperor of Nilfgaard?",
    answers: ["Emhyr var Emreis", "Radovid", "Foltest", "Dijkstra"],
    correct: 1,
  },
  {
    question: "What sign gives the witcher protection?",
    answers: ["Aard", "Yrden", "Quen", "Igni"],
    correct: 3,
  },
  {
    question: "Whom Geralt considered his father?",
    answers: ["Lambert", "Eskel", "Emhyr var Emreis", "Vesemir"],
    correct: 4,
  },
];

const quiz = new Quiz(questions, {
  header: "#header",
  list: "#list",
  submitBtn: "#submit",
});

quiz.start();
