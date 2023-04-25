var quizScoresLocalStorageKey = "quiz_scores";
var quizButtonIDStart = "quiz-button";
var choiceAttribute = "choice";

var highscoresTab = document.querySelector("#highscores-tab");
var pageHeader = document.querySelector("header");
var mainBodyContent = document.querySelector("main");
var quizHeader = document.querySelector("#quiz-header");
var quizDescription = document.querySelector("#quiz-description");
var startQuizButton = document.querySelector("#" + quizButtonIDStart);
var timeSpan = document.querySelector("#time");
var questionNumber = -1; // keep track of questions
var timeLeft = 0; // start at 0
var timerInterval = undefined; // undefined when timer is not running
var resultInterval = undefined; // undefined when span is not appended
var scores = {};

//load score first function
function loadScores() {
    var scoresString = localStorage.getItem(quizScoresLocalStorageKey);
    if(scoresString === undefined) {
        localStorage.setItem(quizScoresLocalStorageKey, JSON.stringify(scores));
        return;
    }
    JSON.parse(scoresString, (k, v) => {
        if(k !== "") {
            scores[k] = v;
        }
    });
}

loadScores();

function saveScores() {
    localStorage.setItem(quizScoresLocalStorageKey, JSON.stringify(scores));
}

function addScore(name, score) {
    scores[name] = score;
    // if a new entry was added to the scores array, we need to create a new element
    if(scores.length > scoreListElements.length) {
        var el = document.createElement("li");
        el.textContent = ". " + name + " - " + score;
        el.setAttribute("name", name);
        el.setAttribute("score", score.toString());
        scoreListElements.push(el);
    }
    //sort the leaderboard
    populateScores();
    //save
    saveScores();
}

function clearScores() {
    scores = [];
    populateScores();
    saveScores();
}

// align text when access
function alignText(element, type) {
    element.setAttribute("style", "text-align: " + type + ";");
}

// updating time
function updateTime(skipRemaining) {
    if(skipRemaining) {
        timeLeft = 0;
    }
    
    timeSpan.textContent = timeLeft.toString();
}

var questions = [
    {
        prompt: "The condition in an if/else statement is enclosed within ____.",
        a: "quotes",
        b: "curly braces",
        c: "parenthesis",
        d: "square brackets",
        answer: "c"
    },
    {
        prompt: "Commonly used data types DO NOT include:",
        a: "strings",
        b: "booleans",
        c: "alerts",
        d: "numbers",
        answer: "c"
    },
    {
        prompt: "Strings values must be enclosed within ____ when assigned to variables.",
        a: "commas",
        b: "curly braces",
        c: "quotes",
        d: "parenthesis",
        answer: "c"
    },
    {
        prompt: "A very useful tool used during development and debugging for printing content to the debugger is:",
        a: "JavaScript",
        b: "terminal/bash",
        c: "for loops",
        d: "console.log",
        answer: "d"
    },
    {
        prompt: "Arrays in JavaScript can be used to store ____.",
        a: "numbers and strings",
        b: "other arrays",
        c: "booleans",
        d: "all of the above",
        answer: "d"
    },
];

// shuffle question's order
function shuffleQuestions() {
    for(var i = questions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var qai = questions[i];
        questions[i] = questions[j];
        questions[j] = qai;
    }
}

shuffleQuestions();

// Get current question function
function getCurrentQuestion() {
    if(questionNumber < 0 || questionNumber > questions.length - 1) {
        return undefined;
    }
    return questions[questionNumber];
}

var defaultQuizHeaderText = quizHeader.textContent;
var defaultQuizDescriptionText = quizDescription.textContent;

highscoresTab.addEventListener('click', (event) => {
    displayHighScores();
});

// create answers element layout
var optionList = document.createElement("ol");
// load and setup answers buttons
var buttonA = document.createElement("button");
var buttonB = document.createElement("button");
var buttonC = document.createElement("button");
var buttonD = document.createElement("button");
// set ids of buttons to their proper answers 
buttonA.id = quizButtonIDStart + "-a";
buttonB.id = quizButtonIDStart + "-b";
buttonC.id = quizButtonIDStart + "-c";
buttonD.id = quizButtonIDStart + "-d";

// set up buttons as an array
var buttons = [buttonA, buttonB, buttonC, buttonD];

// span for answer feedback. correct or incorrect
var questionResultSpan = document.createElement("span");
questionResultSpan.id = "question-result";

// Create div for submit score functionality
var saveScoreElement = document.createElement("div");
saveScoreElement.id = "quiz-save-score";

var saveScoreLabel = document.createElement("label");
saveScoreLabel.id = "quiz-label-save-score";
saveScoreLabel.textContent = "Enter your initials: ";
saveScoreLabel.setAttribute("for", "quiz-input-save-score");
var saveScoreInput = document.createElement("input");
saveScoreInput.id = "quiz-input-save-score";
saveScoreInput.setAttribute("name", "quiz-input-save-score");
saveScoreInput.addEventListener('keypress', (event) => {
    if(event.target.nodeName === "INPUT" && event.key === 'Enter') {
        onSaveScoreEvent(event);
    }
})
var saveScoreButton = document.createElement("button");
saveScoreButton.id = "quiz-button-save-score";
saveScoreButton.textContent = "Submit";
saveScoreButton.addEventListener('click', onSaveScoreEvent);

function onSaveScoreEvent(event) {
    var initials = saveScoreInput.value.trim().toUpperCase();

    if(initials.length > 2 || initials.length < 2) {
        var splitInitials = initials.split(/\s+/);
        var splitLen = splitInitials.length;
        if(splitLen > 2 || splitLen < 2) {
            initials = "";
        } else {
            initials = splitInitials[0].charAt(0) + splitInitials[splitLen - 1].charAt(0);
        }
    }

    //reset value
    saveScoreInput.value = "";

    if(initials.length == 0) {
        window.alert("Please enter your first and last initials or a full name for your score!");
        return;
    }

    addScore(initials, timeLeft);

    displayHighScores();
}

saveScoreElement.append(saveScoreLabel);
saveScoreElement.append(saveScoreInput);
saveScoreElement.append(saveScoreButton);

var scoreList = document.createElement("ol");
var goBackButton = document.createElement("button");
goBackButton.id = "quiz-button-go-back";
goBackButton.textContent = "Go Back";
goBackButton.addEventListener('click', (event) => {
    scoreList.remove();
    goBackButton.remove();
    clearScoresButton.remove();
    resetDefaultPageText();
    mainBodyContent.append(quizDescription);
    mainBodyContent.append(startQuizButton);
});
var clearScoresButton = document.createElement("button");
clearScoresButton.id = "quiz-button-clear-scores";
clearScoresButton.textContent = "Clear Scores";
clearScoresButton.addEventListener('click', () => {
    clearScores();
})

var scoreListElements = [];

function populateScores() {
    scoreListElements.forEach((scoreEl) => {
        scoreEl.remove();
    });
    scoreListElements = [];
    for(key in scores) {
        var value = scores[key];
        var el = document.createElement("li");
        el.setAttribute("name", key);
        el.setAttribute("score", value.toString());
        scoreListElements.push(el);
    }

    sortScores();
}

populateScores();

function sortScores() {
    // sort
    scoreListElements.sort(function(el1, el2) {
        return el2.getAttribute("score") - el1.getAttribute("score");
    });

    // re-run
    scoreListElements.forEach((el, i) => {
        el.remove();
        el.textContent = (i + 1).toString() + ". " + el.getAttribute("name") + " - " + el.getAttribute("score");
        scoreList.append(el);
    });
}

function displayQuestionResultSpan(correct, endQuiz) {
    questionResultSpan.textContent = correct? "Correct!" : "Wrong";

    if(resultInterval !== undefined) {

        clearInterval(resultInterval);
        
        if(endQuiz) {
            questionResultSpan.remove();
            mainBodyContent.append(questionResultSpan);
        }
    } else {
        mainBodyContent.append(questionResultSpan);
    }

    resultInterval = setInterval(() => {
        questionResultSpan.remove();
        clearInterval(resultInterval);
        resultInterval = undefined;
    }, 1500);
}

function loadNextQuestion() {
    questionNumber++;
    var question = getCurrentQuestion();

    // return false for last question
    if(question === undefined) {
        return false;
    }

    quizHeader.textContent = question.prompt;

    buttons.forEach((button) => {
        var choice = button.getAttribute(choiceAttribute);
 
        button.textContent = choice.toUpperCase() + ": " + question[choice];
    });
    
    // return true if there was a next question loaded
    return true; 
}

function endQuiz(timeOut, displayEndScorePage) {
     // clear interval for timer
    clearInterval(timerInterval);
    updateTime(timeOut);
    shuffleQuestions();
    optionList.remove();

    if(!displayEndScorePage) {
        return;
    }

    // Display that quiz is done
    quizHeader.textContent = "All done!";
    quizDescription.textContent = "Your final score is: " + timeLeft;
    alignText(quizDescription, "left");
    mainBodyContent.append(quizDescription);

    mainBodyContent.append(saveScoreElement);
}

function resetDefaultPageText() {
    quizHeader.textContent = defaultQuizHeaderText;
    alignText(quizHeader, "center");
    quizDescription.textContent = defaultQuizDescriptionText;
    alignText(quizDescription, "center");
}

//allow user to input their highscore into the leaderboard
function onOptionButtonPress(event) {
    var buttonId = event.target.getAttribute(choiceAttribute);
    var correct = buttonId === questions[questionNumber].answer;
    // deduct incorrect answers and end quiz for when timer runs out 
    if(!correct) {
        //deduct 15 seconds for any incorrect answer, set timer to 0 if timer is less than 15
        timeLeft = Math.max(timeLeft - 15, 0);
        // check if timer is greater than 0
        if(timeLeft > 0) {
            // if it is, update remaing time without ending quiz
            updateTime(false);
        } else {
            // end quiz time deduction result to quiz end
            endQuiz(true, true);
            displayQuestionResultSpan(correct, true);
            return;
        }
    }

    if(!loadNextQuestion()) {
        endQuiz(false, true);
        displayQuestionResultSpan(correct, true);
        return;
    }

    displayQuestionResultSpan(correct, false);
}

function displayHighScores() {
    if(questionNumber === -1) {
        quizDescription.remove();
        startQuizButton.remove();
    } else if(questionNumber === questions.length) {
        quizDescription.remove();
        saveScoreElement.remove();
    } else {
        endQuiz(true, false);
    }

    mainBodyContent.append(scoreList);
    mainBodyContent.append(goBackButton);
    mainBodyContent.append(clearScoresButton);

    questionNumber = -1;
    timeLeft = 0;
    quizHeader.textContent = "High Scores";
}

buttons.forEach((button) => {
    button.addEventListener('click', onOptionButtonPress);
    var listItem = document.createElement("li");

    var choice = button.id.charAt(button.id.length - 1);
    // set choice attribute to the letter of the choice
    button.setAttribute(choiceAttribute, choice);

    listItem.appendChild(button);
    // put it on the list
    optionList.appendChild(listItem);
});

//start quiz on click button
startQuizButton.addEventListener('click', function(event) {
    // preload first question
    loadNextQuestion();

    quizDescription.remove();
    startQuizButton.remove();
    alignText(quizHeader, "left");

    mainBodyContent.appendChild(optionList);
    // start timer with 75 seconds
    timeLeft = 75;
    // update the timer
    updateTime(false);
    // start an interval
    timerInterval = setInterval(() => {
        // deincrement one second;
        timeLeft--;

        if(timeLeft <= 0) {
            endQuiz(true, true);
        } else {
            updateTime(false);
        }
    }, 1000);
});
