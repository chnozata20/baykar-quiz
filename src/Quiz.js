import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./Quiz.css";

export default function Quiz() {
    const [quizConfig, setQuizConfig] = useState({ questions: [] });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isQuizComplete, setIsQuizComplete] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [isAnswerClickable, setIsAnswerClickable] = useState(false);
    const [timer, setTimer] = useState(30);
    const questionsRef = useRef(null);
    const intervalId = useRef(null);

    const config = {
        congratulationTitle2: 'Thanks!',
    };

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const response = await fetch("https://jsonplaceholder.typicode.com/posts");
                const data = await response.json();
                if (isMounted) {
                    const formattedQuestions = data.slice(0, 10).map((question) => ({
                        questionId: question.id,
                        questionName: question.title,
                        questionAnswers: question.body.split("\n"),
                    }));
                    setQuizConfig({ questions: formattedQuestions });
                }
            } catch (error) {
                console.error("Error fetching quiz data:", error);
            }
        };

        fetchData();

        return () => { isMounted = false };
    }, []);

    useEffect(() => {
        if (currentQuestionIndex < quizConfig.questions.length && !isQuizComplete) {
            setTimer(30);
            setIsAnswerClickable(false);

            intervalId.current = setInterval(() => {
                setTimer(prev => {
                    if (prev === 30) setIsAnswerClickable(true);
                    if (prev === 1) {
                        clearInterval(intervalId.current);
                        handleNextQuestion();
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalId.current);
    }, [currentQuestionIndex, quizConfig.questions.length, isQuizComplete]);

    const handleAnswerClick = useCallback((questionId, selectedAnswerIndex) => {
        if (!isAnswerClickable) return;

        const question = quizConfig.questions.find(q => q.questionId === questionId);
        if (!question) return;

        const questionElement = document.getElementById(questionId);
        if (questionElement) {
            const answerElements = Array.from(questionElement.querySelectorAll('li'));
            answerElements.forEach((element, idx) => {
                if (idx === selectedAnswerIndex) {
                    element.classList.add('correct-answer');
                }
            });
            questionElement.classList.add('pointer-none');

            setAnswers(prevAnswers => [
                ...prevAnswers, 
                { questionId, selectedAnswer: question.questionAnswers[selectedAnswerIndex] }
            ]);

            setTimeout(() => handleNextQuestion(), 1000);
        }
    }, [quizConfig.questions, isAnswerClickable]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < quizConfig.questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            setIsQuizComplete(true);
        }
    }, [currentQuestionIndex, quizConfig.questions.length]);

    const getOptionLabel = (index) => {
        return String.fromCharCode(65 + index);
    };

    return (
        <div className="quiz-overlay">
            <div className="quiz-wrapper">
                <div className="quiz-container">
                    <div className="quiz-questions" ref={questionsRef}>
                        {!isQuizComplete && quizConfig.questions.map((question, index) => (
                            index === currentQuestionIndex && (
                                <div className="question" id={question.questionId} key={question.questionId}>
                                    <div className="title-container">
                                        <p className="question-title">{question.questionName}</p>
                                        <h2 className="question-number">{currentQuestionIndex + 1}/10</h2>
                                        <p className="timer">Time left: {timer}s</p>
                                    </div>
                                    <ul className="question-answers">
                                        {question.questionAnswers.map((answer, idx) => (
                                            <li key={idx} onClick={() => handleAnswerClick(question.questionId, idx)}>
                                                <input type="radio" name={question.questionId} disabled={!isAnswerClickable} /> 
                                                <span style={{fontWeight:"bolder"}}>{getOptionLabel(idx)}</span>. {answer}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        ))}
                        {isQuizComplete && (
                            <div className="congratulation-win-page">
                                <img
                                    className="confetti"
                                    src="https://image.useinsider.com/maccosmetics/defaultImageLibrary/insider-confetti-1683556221.gif"
                                    alt="Confetti"
                                />
                                <h2 className="congratulation-title">{config.congratulationTitle2}</h2>
                                <table className="answers-table">
                                    <thead>
                                        <tr>
                                            <th>Question</th>
                                            <th>Your Answer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {answers.map((answer, idx) => (
                                            <tr key={idx}>
                                                <td>{quizConfig.questions.find(q => q.questionId === answer.questionId)?.questionName}</td>
                                                <td>{answer.selectedAnswer}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
