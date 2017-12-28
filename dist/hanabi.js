'use strict';

var game = {};
var colors = ['red', 'blue', 'green', 'white', 'yellow'];
var numbers = [1, 1, 1, 2, 2, 3, 3, 4, 4, 5];

module.exports.wipeForTests = function () {
	game = {};
};

module.exports.getGame = function () {
	if (!game.id) {
		console.error("game.id did not exist");
		throw "No Game found, run createGame, or loadGame";
	}
	return game;
};
module.exports.loadGame = function (gameToLoad) {
	if (game.id) {
		console.error("game.id existed");
		throw "there seems to already be a game on this object - you probably didn't mean to run createGame";
	}
	game = gameToLoad;
	return {
		whosTurn: game.whosTurn,
		players: game.players.map(function (p) {
			return { name: p.name, id: p.id };
		}),
		id: game.id
	};
};

module.exports.discard = function (playerId, cardId) {
	if (!Number.isInteger(cardId)) {
		console.error("Tried to discard a non Integer cardId");
		throw "Tried to discard non int card id";
	}
	var whosTurn = game.players[game.whosTurn];
	if (whosTurn.id !== playerId) {
		console.error("Tried to discard as incorrect player");
		throw "Tried to discard as incorrect player";
	}
	if (whosTurn.hand.map(function (c) {
		return c.id;
	}).indexOf(cardId) === -1) {
		console.error("Tried to discard a card that's not in current player's hand");
		throw "That card doesn't belong to player who's turn it is";
	}
	if (game.advice === 8) {
		console.error("Tried to discard when advice was max");
		throw "Cannot discard when advice == 8";
	}

	game.advice++;
	var cardIndex = whosTurn.hand.findIndex(function (c) {
		return c.id === cardId;
	});
	var card = whosTurn.hand.splice(cardIndex, 1)[0];
	game.players[game.whosTurn].lastMove = ["Discard", card];
	game.lastMove = ["Discard", card, game.players[game.whosTurn].name];
	game.discards.push(card);
	//add to message, hcarlie discarded a card.color, card.number
	dealCardToPlayer(whosTurn);
	nextTurn();
};

module.exports.getPlayerGameState = function (playerid) {
	if (game.players.filter(function (p) {
		return p.id === playerid;
	}).length === 0) {
		console.error("Tried to get a game state for non-existant player");
		throw "Tried to get game state for non-existant player";
	}
	var partialGame = {};
	partialGame.id = game.id;
	partialGame.discards = game.discards;
	partialGame.played = game.played;
	partialGame.advice = game.advice;
	partialGame.bombs = game.bombs;
	partialGame.cardsInDeck = game.deck.length;
	partialGame.players = [];
	partialGame.lastMove = game.lastMove;
	console.log(game.players);
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = game.players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var player = _step.value;

			var partialPlayer = {
				name: player.name,
				hand: [],
				lastMove: player.lastMove
			};
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = player.hand[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var c = _step2.value;

					var card = {
						id: c.id,
						color: c.color,
						number: c.number,
						notColors: c.notColors,
						notNumbers: c.notNumbers,
						colors: c.colors,
						numbers: c.numbers
					};
					if (player.id === playerid) {
						card.color = undefined;
						card.number = undefined;
					}
					partialPlayer.hand.push(card);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			if (player.id === playerid) {
				partialPlayer.you = true;
			}
			partialGame.players.push(partialPlayer);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return partialGame;
};

module.exports.advise = function (advisor, to, colorOrNum) {
	if (game.players[game.whosTurn].id !== advisor) {
		console.error("Tried to advise off-turn");
		throw "Cannot give advice out of turn";
	}
	if (game.players[to].id === advisor) {
		console.error("Tried to give self advise");
		throw "Cannot give advice to self";
	}
	if (game.advice === 0) {
		console.error("Tried to give advice with no tokens");
		throw "Cannot give advice without tokens";
	}
	game.players[game.whosTurn].lastMove = ["Advise", game.players[to].name, colorOrNum];
	game.lastMove = ["Advise", game.players[to].name, colorOrNum, game.players[game.whosTurn].name];
	game.advice--;
	var adviceCards = game.players[to].hand;
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = adviceCards[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var card = _step3.value;

			if (Number.isInteger(colorOrNum)) {
				if (card.number === colorOrNum) {
					if (card.numbers.indexOf(colorOrNum) === -1) card.numbers.push(colorOrNum);
				} else {
					if (card.notNumbers.indexOf(colorOrNum) === -1) card.notNumbers.push(colorOrNum);
				}
			} else {
				if (card.color === colorOrNum) {
					if (card.colors.indexOf(colorOrNum) === -1) card.colors.push(colorOrNum);
				} else {
					if (card.notColors.indexOf(colorOrNum) === -1) card.notColors.push(colorOrNum);
				}
			}
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	nextTurn();
};

module.exports.createGame = function (_ref) {
	var playerNames = _ref.playerNames;


	if (game.id) {
		console.error("game.id existed");
		throw "there seems to already be a game on this object - you probably didn't mean to run createGame";
	}
	if (!Array.isArray(playerNames)) {
		console.error("Players param was nto an array");
		throw "You must pass playerNames:arr parameter";
	}
	if (playerNames.length < 2) {
		console.error("Hanabi requires at least two players");
		throw "You must include at least two player names";
	}
	if (playerNames.length > 5) {
		console.error("Hanabi requires at most five players");
		throw "You must include at most five player names";
	}

	game.id = new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
	var deck = [];
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = colors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var color = _step4.value;
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = numbers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var number = _step5.value;

					deck.push({
						color: color,
						number: number,
						notColors: [],
						notNumbers: [],
						colors: [],
						numbers: []
					});
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4.return) {
				_iterator4.return();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	game.deck = shuffle(deck).map(function (c, i) {
		return (c.id = i + 1) && c;
	});
	game.discards = [];
	game.played = {};
	game.over = false;
	colors.forEach(function (c) {
		return game.played[c] = 0;
	});
	game.whosTurn = 0;

	game.advice = 8;
	game.bombs = 3;
	game.lastMove = undefined;

	//games with 4,5 players have 4 cards, otherwise 5 cards
	var handSize = playerNames.length < 4 ? 5 : 4;

	playerNames = shuffle(playerNames);
	game.players = playerNames.map(function (p, i) {
		return {
			name: p,
			id: Math.floor((Math.random() + (i + 1)) * 100000), //player 1 gets a random id between 100000 and 200000
			hand: game.deck.splice(0, handSize),
			lastMove: undefined
		};
	});

	//only return enough data for the user to send links out.
	//the dev will need to call getGame() and save that to the database..
	return {
		whosTurn: game.whosTurn,
		players: game.players.map(function (p) {
			return { name: p.name, id: p.id };
		}),
		id: game.id
	};
};

function nextTurn() {
	game.whosTurn = (game.whosTurn + 1) % game.players.length;

	//if endGameStarted, check if everyone's gotten a turn
	if (game.inEndGame) {
		if (game.whosTurn === game.whoGetsLastTurn) {
			game.over = true;
		}
	}
	return game.over;
}

function shuffle(array) {
	var currentIndex = array.length,
	    temporaryValue,
	    randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

module.exports.play = function (playerId, cardId) {
	if (!Number.isInteger(cardId)) {
		console.log("You tried to play a card, try playing a card ID instead");
		throw "Attempted to play a non-integer cardId";
	}
	var whosTurn = game.players[game.whosTurn];
	if (whosTurn.id !== playerId) {
		console.error("Tried to play as incorrect player");
		throw "Tried to play as incorrect player";
	}
	if (whosTurn.hand.map(function (c) {
		return c.id;
	}).indexOf(cardId) === -1) {
		console.error("Tried to play a card that's not in current player's hand");
		throw "That card doesn't belong to player who's turn it is";
	}
	var cardIndex = whosTurn.hand.findIndex(function (c) {
		return c.id === cardId;
	});
	var card = whosTurn.hand.splice(cardIndex, 1)[0];

	if (game.played[card.color] === card.number - 1) {
		//card plays!
		game.played[card.color] = card.number;
		//card was a 5, give them advice
		if (card.number === 5 && game.advice < 8) game.advice++;
		whosTurn.lastMove = ["Play", true, card];
		game.lastMove = ["Play", true, card, game.players[game.whosTurn].name];
		dealCardToPlayer(whosTurn);
		nextTurn();
		return { success: true, reason: 'card played' };
	} else {
		game.discards.push(card);
		game.bombs--;
		whosTurn.lastMove = ["Play", false, card];
		game.lastMove = ["Play", false, card, game.players[game.whosTurn].name];
		if (game.bombs === 0) {
			//end of game
			game.over = true;
			return { success: 'false', reason: 'card did not play' };
		} else {
			whosTurn.lastMove = ["Play", false, card];
			game.lastMove = ["Play", false, card, game.players[game.whosTurn].name];
			dealCardToPlayer(whosTurn);
			nextTurn();
			return { success: 'false', reason: 'card did not play' };
		}
	}
};

function dealCardToPlayer(player) {
	if (game.inEndGame) return;
	var newCard = game.deck.splice(0, 1);

	//deck was empty, start endgame
	if (newCard.length === 0) {
		game.whoGetsLastTurn = game.players.findIndex(function (p) {
			return p.id === player.id;
		});
		game.inEndGame = true;
	} else {
		player.hand.push(newCard[0]);
	}
}