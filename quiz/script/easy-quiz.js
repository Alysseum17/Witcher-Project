"use strict";

class Quiz {
  constructor(questions, containerIds) {
    this.questions = questions;
    this.shuffledQuestions = [];
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.isCompleted = false;
    this.userAnswers = [];

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
    this.shuffledQuestions = this._shuffleQuestions();
    this._renderQuestion();
    this._updateSubmitButton("Answer");
    this.userAnswers = [];
  }

  _clearPage() {
    this.headerContainer.innerHTML = "";
    this.listContainer.innerHTML = "";

    const reviewContainer = document.querySelector('.review-container');
    if (reviewContainer) reviewContainer.remove();
  }

    _shuffleQuestions() {
      const shuffled = [...this.questions];

    for(let i = shuffled.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[k]] = [shuffled[k], shuffled[i]];     
    }

    return shuffled;
  }

  _renderQuestion() {
    const question = this.shuffledQuestions[this.currentQuestionIndex];;

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
    const correctIndex = this.shuffledQuestions[this.currentQuestionIndex].correct;
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
  const question = this.shuffledQuestions[this.currentQuestionIndex];
  const userAnswer = parseInt(selectedAnswer.value);
  const isCorrect = userAnswer === question.correct;

  this.userAnswers.push({
    question: question.question,
    answers: question.answers,
    userAnswer,
    correctAnswer: question.correct
  });

  if (isCorrect) {
    this.score++;
  }
}

  _handleNextStep() {
    this._enableInputs(); 
    if (this.currentQuestionIndex < this.shuffledQuestions.length - 1) {
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

    const reviewContainer = document.createElement('div');
    reviewContainer.className = 'review-container';
    this.headerContainer.after(reviewContainer);

    this.userAnswers.forEach((item, index) => {
      const questionHTML = `
        <div class="review-item">
          <h3>Question ${index + 1}: ${item.question}</h3>
          <ul class="review-answers">
            ${item.answers.map((answer, i) => {
              const answerNumber = i + 1;
              let classes = '';
              if (answerNumber === item.correctAnswer) classes = 'correct';
              else if (answerNumber === item.userAnswer) classes = 'wrong';
              return `<li class="${classes}">${answer}</li>`;
            }).join('')}
          </ul>
        </div>
      `;
      reviewContainer.insertAdjacentHTML('beforeend', questionHTML);
    });

    this._updateSubmitButton("Play again");
  }

  _calculateResult() {
    const correctAnswers = this.score;
    const totalQuestions = this.shuffledQuestions.length;
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
    answers: ["Ciri", "Geralt", "Dandelion", "Vesemir"],
    correct: 2,
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
    answers: ["Blaze", "Shadow", "Windrunner", "Roach"],
    correct: 4,
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
    answers: ["Zoltan", "Triss", "Dandelion", "Emhyr"],
    correct: 3,
  },
  {
    question: "What monster is weak to silver weapons?",
    answers: ["Humans", "Ghouls", "Bandits", "Knights"],
    correct: 2,
  },
  {
    question: "What is the name of the Witchers' fortress?",
    answers: ["Kaer Morhen", "Novigrad", "Oxenfurt", "Skellige"],
    correct: 1,
  },
  {
    question: "Which of these is a Witcher sign?",
    answers: ["Frost", "Aard", "Blast", "Blink"],
    correct: 2,
  },
  {
    question: "What does Geralt drink to enhance his abilities?",
    answers: ["Wine", "Tea", "Milk", "Potions"],
    correct: 4,
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
