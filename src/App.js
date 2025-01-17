import { useState, useEffect } from "react";
import "./App.scss";

function App() {
  const [allQuestions, setAllQuestions] = useState([]); // 모든 파일의 문제를 저장
  const [questions, setQuestions] = useState([]); // 현재 페이지의 문제
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [currentFileName, setCurrentFileName] = useState("전체"); // 현재 파일 이름 저장
  const [showAnswers, setShowAnswers] = useState({}); // 정답 표시 여부 관리
  const [isFinished, setIsFinished] = useState(false); // 종료 여부 상태 관리
  const [selectedFiles, setSelectedFiles] = useState([]); // 선택된 파일 목록
  const QUESTIONS_PER_PAGE = 10; // 한 페이지당 보여줄 문제 수
  const [version, setVersion] = useState("VERSION 1.0")

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/dataset/file-list.json`)
      .then((response) => response.json())
      .then((files) => {
        setFileList(files);
        setSelectedFiles(files); // 기본값으로 전체 파일 선택
      });
  }, []);

  const loadQuestionsFromFiles = () => {
    const fetchQuestions = selectedFiles.map((file) =>
      fetch(`${process.env.PUBLIC_URL}/dataset/${file}`).then((response) => response.json())
    );

    Promise.all(fetchQuestions).then((results) => {
      const allQuestions = results.flatMap((result) => result.questions);
      setQuestions(allQuestions);

      // 초기 정답 상태 설정
      const initialAnswers = {};
      allQuestions.forEach((_, index) => {
        initialAnswers[index + 1] = { selected: "", result: "", input: "" };
      });
      setAnswers(initialAnswers);
      setShowAnswers({});
      setCurrentPage(0);
      setIsFinished(false);
    });
  };

  const handleFileSelection = (fileName) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileName)) {
        return prev.filter((file) => file !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedFiles(fileList);
  };

  const handleDeselectAll = () => {
    setSelectedFiles([]);
  };

  const handleSelectWithKeyword = (keyword) => {
    setSelectedFiles(fileList.filter((file) => file.includes(keyword)));
  };

  const handleDeselectWithKeyword = (keyword) => {
    setSelectedFiles((prev) => prev.filter((file) => !file.includes(keyword)));
  };

  const handleSelectByNumber = (number) => {
    const regex = new RegExp(`^${number}_`);
    setSelectedFiles(fileList.filter((file) => regex.test(file)));
  };

  const handleCheckboxChange = (questionNumber, optionKey) => {
    setAnswers((prevAnswers) => {
      const question = questions[questionNumber - 1];
      const isCorrect = question.answer === optionKey;

      const updatedAnswers = {
        ...prevAnswers,
        [questionNumber]: {
          ...prevAnswers[questionNumber],
          selected: optionKey,
          result: isCorrect ? "O" : "X",
        },
      };
      return updatedAnswers;
    });
  };

  const handleInputChange = (questionNumber, value) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [questionNumber]: {
          ...prevAnswers[questionNumber],
          input: value,
          result: questions[questionNumber - 1].answer === value ? "O" : "X",
        },
      };
      return updatedAnswers;
    });
  };

  const handleRestart = () => {
    setQuestions([]);
    setAnswers({});
    setIsFinished(false);
    setShowAnswers({});
    setSelectedFiles(fileList);
    setCurrentFileName("전체");
  };

  const toggleAnswerVisibility = (questionNumber) => {
    setShowAnswers((prevShowAnswers) => ({
      ...prevShowAnswers,
      [questionNumber]: !prevShowAnswers[questionNumber],
    }));
  };

  const handleNextPage = () => {
    if (currentPage < fileList.length - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      alert("마지막 페이지입니다.");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleFinish = () => {
    const updatedAnswers = { ...answers };
    questions.forEach((_, index) => {
      const questionNumber = index + 1;
      if (!updatedAnswers[questionNumber]?.selected && !updatedAnswers[questionNumber]?.input) {
        updatedAnswers[questionNumber] = {
          ...updatedAnswers[questionNumber],
          selected: "선택 안 함",
          input: "",
          result: "X",
        };
      }
    });
    setAnswers(updatedAnswers);
    setIsFinished(true);
  };

  const getCurrentPageQuestions = () => {
    const start = currentPage * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return questions.slice(start, end);
  };

  return (
    <div className="App">
      <header>
        <h2>정보처리산업기사 과정평가형 기출예상 문제</h2>
        <div className="copyright">
             Developed by Jung Woo Gyun, 2025. | {version} <br/>
             Email : jwg8910@naver.com  | Kakao : jwg1323 (선호) <br/>
             정리된 자료주시면 문제에 반영하겠습니다<br/>
        </div>
      </header>
      <main>
        {!questions.length ? (
          <div className="module_index">
            <h3>시험 모듈_목차 선택</h3>
            <button onClick={handleSelectAll}>전체 선택</button>
            <button onClick={handleDeselectAll}>전체 선택 해제</button>
            <button onClick={() => handleSelectWithKeyword("빈칸")}>"빈칸" 포함 선택</button>
            <button onClick={() => handleDeselectWithKeyword("빈칸")}>"빈칸" 포함 해제</button>
            <button onClick={() => handleSelectWithKeyword("4지선다")}>"4지선다" 포함 선택</button>
            <button onClick={() => handleDeselectWithKeyword("4지선다")}>"4지선다" 포함 해제</button>
            
            <table>
              <thead>
                <tr>
                  <th>선택</th>
                  <th>모듈_목차명</th>
                </tr>
              </thead>
              <tbody>
                {fileList.map((file, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file)}
                        onChange={() => handleFileSelection(file)}
                      />
                    </td>
                    <td>{file.replace(".json", "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer>
              <button onClick={loadQuestionsFromFiles}>시험 시작</button>
            </footer>
          </div>
        ) : !isFinished ? (
          <div>
            <h3>{currentFileName}</h3>
            {getCurrentPageQuestions().map((question, index) => {
              const questionIndex = currentPage * QUESTIONS_PER_PAGE + index + 1;
              return (
                <div key={index} className="question">
                  <p>
                    <strong>문제 {questionIndex}:</strong> {question.question}
                  </p>
                  {question.options ? (
                    <ul>
                      {question.options.map((option, optionIndex) => {
                        const optionKey = Object.keys(option)[0];
                        const optionValue = Object.values(option)[0];
                        return (
                          <li key={optionIndex}>
                            <label>
                              <input
                                type="checkbox"
                                name={`question-${questionIndex}`}
                                value={optionKey}
                                checked={
                                  answers[questionIndex]?.selected === optionKey
                                }
                                onChange={() =>
                                  handleCheckboxChange(questionIndex, optionKey)
                                }
                              />
                              {optionValue}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <input
                      type="text"
                      value={answers[questionIndex]?.input || ""}
                      onChange={(e) =>
                        handleInputChange(questionIndex, e.target.value)
                      }
                      placeholder="답을 입력하세요"
                    />
                  )}
                </div>
              );
            })}
            <footer>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                이전 페이지
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(questions.length / QUESTIONS_PER_PAGE) - 1)
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(questions.length / QUESTIONS_PER_PAGE) - 1
                }
              >
                다음 페이지
              </button>
              <button onClick={handleFinish}>시험 종료</button>
            </footer>
          </div>
        ) : (
          <div>
            <h3>결과</h3>
            <p>전체 문항 수: {questions.length}</p>
            <p>
              정답 수: {Object.values(answers).filter((ans) => ans.result === "O").length}
            </p>
            <p>
              오답 수: {Object.values(answers).filter((ans) => ans.result === "X").length}
            </p>
            <h3>틀린 문제</h3>
            <table>
              <thead>
                <tr>
                  <th >번호</th>
                  <th>문제</th>
                  <th>정답</th>
                  <th>내 답</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(answers)
                  .filter(([_, ans]) => ans.result === "X")
                  .map(([key, answer]) => {
                    const questionNumber = parseInt(key, 10);
                    const question = questions[questionNumber - 1];
                    const correctAnswer = question.answer;
                    const correctAnswerText = question.options
                      ? `${correctAnswer} (${question.options.find((option) => Object.keys(option)[0] === correctAnswer)[correctAnswer]})`
                      : correctAnswer;
                    const userAnswer = answer.selected
                      ? `${answer.selected} (${question.options?.find((option) => Object.keys(option)[0] === answer.selected)?.[answer.selected] || "선택 안 함"})`
                      : answer.input || "선택 안 함";

                    return (
                      <tr key={key}>
                        <td>{questionNumber}</td>
                        <td>{question.question}</td>
                        <td>{correctAnswerText}</td>
                        <td>{userAnswer}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <footer>
              <button onClick={handleRestart}>다시 시작</button>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
