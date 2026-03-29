

import React from 'react';
// hien thi cau hoi quiz, dap an da chon va ket qua cham diem.
const QuizLessonContent = ({ activeLesson, quizAnswers, setQuizAnswers, quizResult }) => {
    if (!activeLesson) return null;

    return (
        <div className="space-y-5">
            {(activeLesson.quizQuestions || []).map((question, qIndex) => (
                <div key={`quiz-question-${qIndex + 1}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="mb-3 text-sm font-bold">{`Cau ${qIndex + 1}: ${question.question}`}</p>
                    <div className="space-y-2">
                        {(question.options || []).map((option, optionIndex) => (
                            <label key={`quiz-option-${qIndex + 1}-${optionIndex + 1}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                                <input
                                    type="radio"
                                    name={`quiz-${qIndex}`}
                                    checked={Number(quizAnswers[qIndex]) === optionIndex}
                                    onChange={() => setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }))}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {quizResult && (
                <div className={`rounded-lg border p-3 text-sm ${quizResult.passed ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>
                    <p className="font-bold">Ket qua quiz</p>
                    <p>{`Dung ${quizResult.correctCount}/${quizResult.total} cau (${quizResult.scorePercent}%).`}</p>
                    <p>{`Moc dat: ${quizResult.passingScore}%.`}</p>
                </div>
            )}
        </div>
    );
};

export default QuizLessonContent;