

import { useEffect, useState } from "react";
import "./index.css";
import Login from "./Login";
const STORAGE_KEY = "quizCraftQuizzes";

const sampleQuiz = {
  id: "sample-quiz",
  title: "Basic Computer Quiz",
  durationMinutes: 0,
  randomizeOrder: true,
  questions: [
    {
      type: "mcq",
      question: "What does CPU stand for?",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Control Processing User",
      ],
      answer: 0,
    },
    {
      type: "mcq",
      question: "Which language is used to style web pages?",
      options: ["Python", "CSS", "C", "Java"],
      answer: 1,
    },
    {
      type: "truefalse",
      question: "HTML is used to structure web pages.",
      options: ["True", "False"],
      answer: 0,
    },
  ],
};

function loadSavedQuizzes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("quizCurrentUser") || "null"
    );
  } catch {
    return null;
  }
});
  const [page, setPage] = useState("home");
  const [savedQuizzes, setSavedQuizzes] = useState(loadSavedQuizzes);
  const [quiz, setQuiz] = useState(sampleQuiz);

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("mcq");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("2");
  const [randomizeOrder, setRandomizeOrder] = useState(true);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (page !== "take" || !timerEnabled) return;

    const timerId = setInterval(() => {
      setSecondsLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [page, timerEnabled]);

  // Automatically finish when the timer reaches zero
  useEffect(() => {
    if (page !== "take" || !timerEnabled || secondsLeft > 0) {
      return;
    }

    const total = quiz.questions.reduce((sum, item, index) => {
      return sum + (selected[index] === item.answer ? 1 : 0);
    }, 0);

    setScore(total);
    setPage("results");
  }, [page, timerEnabled, secondsLeft, quiz, selected]);

  function persistQuizzes(updatedQuizzes) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedQuizzes)
      );
      setSavedQuizzes(updatedQuizzes);
      return true;
    } catch {
      alert("Could not save quizzes. Browser storage may be full.");
      return false;
    }
  }

  function addQuestion() {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    let newQuestion;

    if (questionType === "truefalse") {
      newQuestion = {
        type: "truefalse",
        question: question.trim(),
        options: ["True", "False"],
        answer: Number(answer),
      };
    } else {
      if (options.some((item) => !item.trim())) {
        alert("Please fill in all four options.");
        return;
      }

      newQuestion = {
        type: "mcq",
        question: question.trim(),
        options: options.map((item) => item.trim()),
        answer: Number(answer),
      };
    }

    setQuestions((previous) => [...previous, newQuestion]);

    setQuestion("");
    setOptions(["", "", "", ""]);
    setAnswer("0");
  }

  function createQuiz() {
    if (!title.trim() || questions.length === 0) {
      alert("Enter a title and add at least one question.");
      return;
    }

    const newQuiz = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      questions: [...questions],
      durationMinutes: Number(durationMinutes),
      randomizeOrder,
    };

    const updatedQuizzes = [...savedQuizzes, newQuiz];

    if (!persistQuizzes(updatedQuizzes)) return;

    setTitle("");
    setQuestions([]);
    setDurationMinutes("2");
    setRandomizeOrder(true);

    startQuiz(newQuiz);
  }

  function startQuiz(selectedQuiz) {
    const questionsToUse = selectedQuiz.randomizeOrder
      ? shuffleQuestions(selectedQuiz.questions)
      : [...selectedQuiz.questions];

    setQuiz({
      ...selectedQuiz,
      questions: questionsToUse,
    });

    setCurrent(0);
    setSelected({});
    setScore(0);

    const seconds = Math.max(
      0,
      Number(selectedQuiz.durationMinutes || 0) * 60
    );

    setSecondsLeft(seconds);
    setTimerEnabled(seconds > 0);
    setPage("take");
  }

  function deleteQuiz(id) {
    if (!window.confirm("Delete this saved quiz?")) return;

    const updatedQuizzes = savedQuizzes.filter(
      (item) => item.id !== id
    );

    persistQuizzes(updatedQuizzes);
  }

  function submitQuiz() {
    const total = quiz.questions.reduce((sum, item, index) => {
      return sum + (selected[index] === item.answer ? 1 : 0);
    }, 0);

    setScore(total);
    setPage("results");
  }
if (!currentUser) {
  return <Login onLogin={setCurrentUser} />;
}
  return (
    <div className="app">
      <nav className="navbar">
        <button className="brand" onClick={() => setPage("home")}>
          Quiz<span>Craft</span>
        </button>

        <button className="nav-button" onClick={() => setPage("create")}>
          + Create Quiz
        </button>
        <button
  className="nav-button"
  onClick={() => {
    localStorage.removeItem("quizCurrentUser");
    setCurrentUser(null);
  }}
>
  Logout
</button>
      </nav>

      <main className="container">
        {page === "home" && (
          <section className="hero">
            <p className="eyebrow">LEARN • PLAY • IMPROVE</p>
            <h1>Make learning <span>fun.</span></h1>
            <p className="subtitle">
              Create quizzes, challenge yourself, and track your score.
            </p>

            <div className="actions">
              <button className="primary" onClick={() => setPage("create")}>
                Create a Quiz +
              </button>
              <button
                className="secondary"
                onClick={() => startQuiz(sampleQuiz)}
              >
                Try Sample Quiz →
              </button>
            </div>

            <div className="stats">
              <div>
                <strong>{savedQuizzes.length}</strong>
                <span>Saved quizzes</span>
              </div>
              <div>
                <strong>03</strong>
                <span>New features</span>
              </div>
            </div>

            <h2>Your Saved Quizzes</h2>

            {savedQuizzes.length === 0 ? (
              <div className="empty-state">
                <h3>No saved quizzes yet</h3>
                <p>Create your first quiz to see it here.</p>
                <button
                  className="primary"
                  onClick={() => setPage("create")}
                >
                  Create Quiz
                </button>
              </div>
            ) : (
              <div className="saved-grid">
                {savedQuizzes.map((item) => (
                  <div className="quiz-card" key={item.id}>
                    <div>
                      <span className="pill">SAVED QUIZ</span>
                      <h2>{item.title}</h2>
                      <p>{item.questions.length} questions</p>
                      <p>
                        {item.durationMinutes > 0
                          ? `${item.durationMinutes} minute timer`
                          : "No time limit"}
                      </p>
                      <p>
                        {item.randomizeOrder
                          ? "Random question order"
                          : "Fixed question order"}
                      </p>
                    </div>

                    <div className="card-actions">
                      <button
                        className="primary"
                        onClick={() => startQuiz(item)}
                      >
                        Start →
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteQuiz(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "create" && (
          <section className="panel">
            <button className="back" onClick={() => setPage("home")}>
              ← Home
            </button>

            <p className="eyebrow">QUIZ BUILDER</p>
            <h1>Create your quiz</h1>

            <label>Quiz title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ECE Basics"
            />

            <label>Time limit</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option value="0">No time limit</option>
              <option value="1">1 minute</option>
              <option value="2">2 minutes</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>

            <label className="check-label">
              <input
                type="checkbox"
                checked={randomizeOrder}
                onChange={(e) => setRandomizeOrder(e.target.checked)}
              />
              Randomize question order
            </label>

            <h2>Add a question</h2>

            <label>Question type</label>
            <select
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value);
                setAnswer("0");
              }}
            >
              <option value="mcq">Multiple Choice (4 options)</option>
              <option value="truefalse">True / False</option>
            </select>

            <label>Question text</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              rows="3"
            />

            {questionType === "mcq" ? (
              <>
                <label>Answer options</label>
                {options.map((item, index) => (
                  <input
                    key={index}
                    value={item}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[index] = e.target.value;
                      setOptions(updated);
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}

                <label>Correct answer</label>
                <select
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                >
                  {options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label>Correct answer</label>
                <select
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                >
                  <option value="0">True</option>
                  <option value="1">False</option>
                </select>
                <p className="helper">
                  This question will automatically use True and False as
                  its two answer choices.
                </p>
              </>
            )}

            <button className="secondary full" onClick={addQuestion}>
              + Add Question
            </button>

            <p className="helper">
              Questions added: {questions.length}
            </p>

            {questions.length > 0 && (
              <ul className="question-list">
                {questions.map((item, index) => (
                  <li key={index}>
                    {index + 1}. [{item.type === "truefalse" ? "T/F" : "MCQ"}]{" "}
                    {item.question}
                  </li>
                ))}
              </ul>
            )}

            <button className="primary full" onClick={createQuiz}>
              Save Quiz & Start →
            </button>
          </section>
        )}

        {page === "take" && (
          <section className="panel">
            <button className="back" onClick={() => setPage("home")}>
              ← Home
            </button>

            <p className="eyebrow">YOUR QUIZ</p>
            <h1>{quiz.title}</h1>

            {timerEnabled && (
              <div
                className={
                  secondsLeft <= 10 ? "timer urgent" : "timer"
                }
                role="timer"
                aria-live="off"
              >
                <span>Time remaining</span>
                <strong>{formatTime(secondsLeft)}</strong>
              </div>
            )}

            <div className="progress">
              <div
                style={{
                  width: `${
                    ((current + 1) / quiz.questions.length) * 100
                  }%`,
                }}
              />
            </div>

            <p className="helper">
              Question {current + 1} of {quiz.questions.length}
            </p>

            <h2>{quiz.questions[current].question}</h2>

            <div className="options">
              {quiz.questions[current].options.map((item, index) => (
                <button
                  key={index}
                  className={
                    selected[current] === index
                      ? "option selected"
                      : "option"
                  }
                  onClick={() =>
                    setSelected((previous) => ({
                      ...previous,
                      [current]: index,
                    }))
                  }
                >
                  <span>
                    {quiz.questions[current].type === "truefalse"
                      ? ""
                      : String.fromCharCode(65 + index)}
                  </span>
                  {item}
                </button>
              ))}
            </div>

            <div className="quiz-navigation">
              <button
                className="secondary"
                disabled={current === 0}
                onClick={() => setCurrent(current - 1)}
              >
                ← Previous
              </button>

              {current < quiz.questions.length - 1 ? (
                <button
                  className="primary"
                  onClick={() => setCurrent(current + 1)}
                >
                  Next →
                </button>
              ) : (
                <button className="primary" onClick={submitQuiz}>
                  Submit Quiz
                </button>
              )}
            </div>
          </section>
        )}

        {page === "results" && (
          <section className="panel result">
            <div className="result-icon">✓</div>
            <p className="eyebrow">QUIZ COMPLETED</p>
            <h1>Your results</h1>
            <div className="score">
              {score}/{quiz.questions.length}
            </div>
            <p className="subtitle">
              You scored{" "}
              {Math.round((score / quiz.questions.length) * 100)}%.
            </p>

            {timerEnabled && secondsLeft === 0 && (
              <p className="timer-note">
                Time expired. Your quiz was submitted automatically.
              </p>
            )}

            {quiz.questions.map((item, index) => (
              <div className="review" key={index}>
                <strong>
                  {index + 1}. {item.question}
                </strong>
                <p>
                  Your answer:{" "}
                  {selected[index] === undefined
                    ? "Not answered"
                    : item.options[selected[index]]}
                </p>
                <p className="correct">
                  Correct answer: {item.options[item.answer]}
                </p>
              </div>
            ))}

            <button
              className="primary full"
              onClick={() => setPage("home")}
            >
              Back to Home
            </button>

            <button
              className="secondary full"
              onClick={() => startQuiz(quiz)}
            >
              Try Again
            </button>
          </section>
        )}
      </main>

      <footer>QuizCraft · Learn something new every day.</footer>
    </div>
  );
}

export default App;