define(['knockout', 'moment', 'dataContext', 'userContext', 'constructors/card'], function (ko, moment, dataContext, userContext, Card) {
    var
        subject = ko.observable(),
        today = moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 }),

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
        });

    return {
        subject: subject,
        flashcards: flashcards,
        cardToSave: cardToSave,
        cardToEdit: cardToEdit,
        isDirty: isDirty,

        resetState: resetState,
        saveCard: saveCard,
        editCard: editCard,
        addCard: addCard,
        deleteCard: deleteCard,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: function (subjectName) {
            subject(subjectName);
            return getCards();
        }
    };
    function saveCard() {
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

            resetState();
        })
    }
    function addCard() {
        var
            createdCard = {
                front: cardToSave.front(),
                back: cardToSave.back(),
                dueDate: today,
                deck: subject()
            };

        return dataContext.add({
            className: 'Flashcard',
            data: createdCard
        }).then(function (objectId) {
            createdCard.objectId = objectId;
            flashcards.push(new Card(createdCard));

            resetState();
        })
    }
    function editCard(card) {
        cardToEdit(card);
        cardToSave.front(card.front());
        cardToSave.back(card.back());
    }
    function deleteCard(card) {
        return dataContext.remove({
            className: 'Flashcard',
            id: card.objectId
        }).then(function () {
            flashcards.remove(card);
        })
    }

    //--------------------------------------------------------- //
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
    function resetState() {
        cardToEdit(undefined);
        cardToSave.front(undefined);
        cardToSave.back(undefined);
    }
});