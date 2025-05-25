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
  question: "Who trained Geralt at Kaer Morhen?",
  answers: ["Vesemir", "Lambert", "Eskel", "Leo"],
  correct: 1,
  },
  {
  question: "What is the name of the magical substance used to create Witcher potions?",
  answers: ["Ether", "Mandrake", "Albedo", "Mutagen"],
  correct: 4,
  },
  {
  question: "Which creature is vulnerable to the Yrden sign?",
  answers: ["Ghouls", "Wraiths", "Bandits", "Drowners"],
  correct: 2,
  },
  {
  question: "What is the Wild Hunt?",
  answers: [
    "A guild of assassins",
    "An army of undead knights",
    "A group of Nilfgaardian generals",
    "A Skellige tradition",
  ],
  correct: 2,
  },
  {
  question: "What is the name of the sorceress who is Geralt's main love interest?",
  answers: ["Triss Merigold", "Keira Metz", "Fringilla Vigo", "Yennefer of Vengerberg"],
  correct: 4,
  },
  {
  question: "What type of monster is a Leshen?",
  answers: ["Specter", "Elemental", "Cursed One", "Relict"],
  correct: 4,
  },
  {
  question: "What is the name of the school Geralt belongs to?",
  answers: ["School of the Bear", "School of the Griffin", "School of the Wolf", "School of the Cat"],
  correct: 3,
  },
  {
  question: "Which of these potions increases night vision?",
  answers: ["Thunderbolt", "Swallow", "Cat", "White Raffard's Decoction"],
  correct: 3,
  },
  {
  question: "Who is the ruler of Skellige?",
  answers: ["Birna Bran", "Crach an Craite", "Hjalmar", "Ermion"],
  correct: 2,
  },
  {
  question: "What is Zoltan Chivay's race?",
  answers: ["Human", "Elf", "Dwarf", "Halfling"],
  correct: 3,
  },
  {
  question: "What is the name of Geralt's sword used for fighting monsters?",
  answers: ["Steel sword", "Silver sword", "Obsidian blade", "Witchblade"],
  correct: 2,
  },
  {
  question: "Which of the following is NOT a Witcher sign?",
  answers: ["Igni", "Axii", "Heli", "Quen"],
  correct: 3,
  }
];

const quiz = new Quiz(questions, {
  header: "#header",
  list: "#list",
  submitBtn: "#submit",
});

quiz.start();
