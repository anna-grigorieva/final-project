define(['knockout', 'moment', 'dataContext', 'userContext', 'constructors/card', 'jquery'], function (ko, moment, dataContext, userContext, Card, $) {
    var
        subject = ko.observable(),
        today = moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 }),

        isAnswerVisible = ko.observable(false),
        flashcards = ko.observableArray(),
        currentCard = ko.observable();

    return {
        subject: subject,
        flashcards: flashcards,
        currentCard: currentCard,
        isAnswerVisible: isAnswerVisible,

        showAnswer: showAnswer,
        showNextCard: showNextCard,
        reviewCard: reviewCard,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: function (subjectName) {
            subject(subjectName);
            return getCards();
        }
    };

    function showAnswer() {
        isAnswerVisible(true);
    }
    function showNextCard() {
        var cardsLeft = flashcards().length;
        if (cardsLeft) {
            currentCard(flashcards()[cardsLeft - 1]);
        } else {
            currentCard('');
        }
        isAnswerVisible(false);
    }
    function reviewCard(grade) {
        var
            card = currentCard(),
            rewiews = card.repetition,
            newRepetition,
            newInterval,
            newEF,
            newDueDate,
            memorized = false;

        if (grade >= 3) {
            if (rewiews === 0) {
                newRepetition = 1;
                newInterval = 1;
            } else if (rewiews === 1) {
                newRepetition = 2;
                newInterval = 6;
            } else {
                newRepetition = rewiews + 1;
                newInterval = Math.round(card.interval * card.easinessFactor);
            }
            newDueDate = moment(card.dueDate()).add(newInterval, 'd');
            memorized = true;
        } else {
            newRepetition = 0;
            newInterval = 1;
        }
        newEF = card.easinessFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        newEF = Math.round(newEF * 1000) / 1000;
        newEF = (newEF < 1.3) ? 1.3 : newEF;

        dataContext.update({
            className: 'Flashcard',
            id: card.objectId,
            data: {
                repetition: newRepetition,
                interval: newInterval,
                easinessFactor: newEF,
                dueDate: newDueDate
            }
        }).then(function () {
            card.repetition = newRepetition;
            card.interval = newInterval;
            card.easinessFactor = newEF;
            card.dueDate(newDueDate);

            flashcards.remove(card);
            if (!memorized) {
                flashcards.unshift(card);
            }
            showNextCard();
        })
    }

    //--------------------------------------------------------- //
    function getCards() {
        return dataContext.getCollection({
            className: 'Flashcard',
            queryConstraints: { deck: subject(), dueDate: { "$lte": today } }
        }).then(function (cards) {
            var
                observableCards = [],
                number = cards.length,
                i;
            for (i = 0; i < number; i++) {
                observableCards.push(new Card(cards[i]));
            }
            flashcards(observableCards);
        });
    }
});