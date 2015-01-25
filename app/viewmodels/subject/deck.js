define(['knockout', 'moment', 'dataContext', 'userContext', 'constructors/card'], function (ko, moment, dataContext, userContext, Card) {
    var
        subject = ko.observable(),
        flashcards = ko.observableArray(),
        cardToEdit = ko.observable(),
        cardToSave = {
            front: ko.observable(),
            back: ko.observable()
        },
        isDirty = ko.computed(function () {
            if (cardToEdit() && (cardToEdit().front() != cardToSave.front() || cardToEdit().back() != cardToSave.back())) {
                return true;
            }
            return false;
        }),
        isBusy = ko.observable(false);

    return {
        subject: subject,
        flashcards: flashcards,
        cardToSave: cardToSave,
        cardToEdit: cardToEdit,
        isDirty: isDirty,
        isBusy: isBusy,

        saveCard: saveCard,
        editCard: editCard,
        deleteCard: deleteCard,
        resetState: resetState,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: function (subjectName) {
            subject(subjectName);
            return getCards();
        }
    };

    function saveCard() {
        isBusy(true);

        if (cardToEdit()) {
            updateCard().then(function () {
                resetState();
                isBusy(false);
            });
        } else {
            addCard().then(function () {
                resetState();
                isBusy(false);
            });
        }
    }
    function editCard(card) {
        cardToEdit(card);
        cardToSave.front(card.front());
        cardToSave.back(card.back());
    }
    function deleteCard(card) {
        isBusy(true);

        return dataContext.remove({
            className: 'Flashcard',
            id: card.objectId
        }).then(function () {
            flashcards.remove(card);
            isBusy(false);
        })
    }
    function resetState() {
        cardToEdit(undefined);
        cardToSave.front(undefined);
        cardToSave.back(undefined);
    }

    function updateCard() {
        var
           updatedCard = {
               front: cardToSave.front(),
               back: cardToSave.back()
           };

        return dataContext.update({
            className: 'Flashcard',
            id: cardToEdit().objectId,
            data: updatedCard
        }).then(function () {
            cardToEdit().front(cardToSave.front());
            cardToEdit().back(cardToSave.back());
        })
    }
    function addCard() {
        var
            createdCard = {
                front: cardToSave.front(),
                back: cardToSave.back(),
                dueDate: moment(),
                deck: subject()
            };

        return dataContext.add({
            className: 'Flashcard',
            data: createdCard
        }).then(function (objectId) {
            createdCard.objectId = objectId;
            flashcards.unshift(new Card(createdCard));
        })
    }
    function getCards() {
        return dataContext.getCollection({
            className: 'Flashcard',
            queryConstraints: { deck: subject() }
        }).then(function (cards) {
            var
                observableCards = [],
                number = cards.length,
                i;
            for (i = 0; i < number; i++) {
                observableCards.push(new Card(cards[i]));
            }
            observableCards.sort(function (first, second) {
                return first.dueDate() - second.dueDate();
            });
            flashcards(observableCards);
        });
    }
});