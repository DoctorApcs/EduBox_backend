import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function Quiz({ quizData, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === quizData.questions[currentQuestion].correct_answer) {
      setScore(score + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      // Wrong answer animation
      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), 500);
    }

    if (currentQuestion < quizData.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer("");
      }, 1000);
    } else {
      setShowResult(true);
    }
  };

  useEffect(() => {
    // Add keyframe animation for shake effect
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(5px); }
        50% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
        100% { transform: translateX(0); }
      }
      .shake {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const optionColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-custom-primary-end p-8 rounded-lg max-w-4xl w-full">
        {!showResult ? (
          <>
            <h2 className="text-3xl font-bold mb-6 text-white">
              Question {currentQuestion + 1}
            </h2>
            <p className="mb-6 text-xl text-white">
              {quizData.questions[currentQuestion].question}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(quizData.questions[currentQuestion].options).map(
                ([key, value], index) => (
                  <button
                    key={key}
                    onClick={() => handleAnswer(key)}
                    className={`p-4 rounded text-white text-lg ${
                      selectedAnswer === key
                        ? selectedAnswer ===
                          quizData.questions[currentQuestion].correct_answer
                          ? "bg-green-600"
                          : "bg-red-600"
                        : `${optionColors[index]} hover:opacity-90`
                    }`}
                    disabled={selectedAnswer !== ""}
                  >
                    {key}: {value}
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Quiz Completed!</h2>
            <p className="text-2xl mb-6">
              Your score: {score} / {quizData.questions.length}
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-6 py-3 rounded text-xl hover:bg-indigo-700"
            >
              Close Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
