let game = {};
const colors = ['red','blue','green','white','yellow'];
const numbers = [1,1,1,2,2,3,3,4,4,5];

module.exports.wipeForTests = function () { game = {}; };

module.exports.getGame = function(){
	if(!game.id){
		console.error("game.id did not exist");
		throw "No Game found, run createGame, or loadGame";
	}
	return game;
};
module.exports.loadGame = function(gameToLoad){
	if (game.id) {
		console.error("game.id existed");
		throw "there seems to already be a game on this object - you probably didn't mean to run createGame";
	}
	game = gameToLoad;
	return {
		whosTurn : game.whosTurn,
		players: game.players.map(p => { return { name: p.name, id: p.id }; }),
		id: game.id
	};
};

module.exports.discard = function(playerId, cardId){
	if(!Number.isInteger(cardId)){
		console.error("Tried to discard a non Integer cardId");
		throw "Tried to discard non int card id";
	}
	const whosTurn = game.players[game.whosTurn];
	if(whosTurn.id !== playerId){
		console.error("Tried to discard as incorrect player");
		throw "Tried to discard as incorrect player";
	}
	if(whosTurn.hand.map(c=>c.id).indexOf(cardId) === -1){
		console.error("Tried to discard a card that's not in current player's hand");
		throw "That card doesn't belong to player who's turn it is";
	}
	if(game.advice === 8){
		console.error("Tried to discard when advice was max");
		throw "Cannot discard when advice == 8";
	}

	game.advice++;
	const cardIndex = whosTurn.hand.findIndex(c=>c.id === cardId);
	const card = whosTurn.hand.splice(cardIndex,1);
	dealCardToPlayer(whosTurn);
	nextTurn();
};

module.exports.getPlayerGameState = function(playerid){
	if(game.players.filter(p=>p.id=== playerid).length === 0){
		console.error("Tried to get a game state for non-existant player");
		throw "Tried to get game state for non-existant player";
	}
	let partialGame = {};
	partialGame.id = game.id;
	partialGame.discards = game.discards;
	partialGame.played = game.played;
	partialGame.advice = game.advice;
	partialGame.bombs = game.bombs;
	partialGame.cardsInDeck = game.deck.length;
	partialGame.players = [];
	console.log(game.players);
	for(var player of game.players){
		let partialPlayer = {
			name : player.name,
			hand : []
		};
		for(const c of player.hand){
			let card = {
					id : c.id,
					color : c.color,
					number : c.number,
					notColors : c.notColors,
					notNumbers : c.notNumbers,
					colors : c.colors,
					numbers : c.numbers
			};
			if(player.id === playerid){
				card.color = undefined;
				card.number = undefined;
			}
			partialPlayer.hand.push(card);
		}
		if(player.id === playerid){ partialPlayer.you = true; }
		partialGame.players.push(partialPlayer);
	}
	return partialGame;
};

module.exports.adviseColor = function(advisor, to, colorOrNum){
	if(game.players[game.whosTurn].id !== advisor){
		console.error("Tried to advise off-turn");
		throw "Cannot give advice out of turn";
	}
	if(game.players[to].id === advisor){
		console.error("Tried to give self advise");
		throw "Cannot give advice to self";
	}
	if(game.advice === 0){
		console.error("Tried to give advice with no tokens");
		throw "Cannot give advice without tokens";
	}
	game.advice--;
	const adviceCards = game.players[to].hand;
	for(let card of adviceCards){
		if(Number.isInteger(colorOrNum)){
			if(card.number === colorOrNum){
				if(card.numbers.indexOf(colorOrNum) === -1)
					card.numbers.push(colorOrNum);
			}
			else {
				if(card.notNumbers.indexOf(colorOrNum) === -1)
					card.notNumbers.push(colorOrNum);
			}
		}
		else {
			if(card.color === colorOrNum) {
				if(card.colors.indexOf(colorOrNum) === -1)
					card.colors.push(colorOrNum);
			}
			else{
				if(card.notColors.indexOf(colorOrNum) === -1)
					card.notColors.push(colorOrNum);
			}
		}
	}
	nextTurn();
};

module.exports.createGame = function ({ playerNames }) {

	if (game.id) {
		console.error("game.id existed");
		throw "there seems to already be a game on this object - you probably didn't mean to run createGame";
	}
	if (!Array.isArray(playerNames)) {
		console.error("Players param was nto an array");
		throw "You must pass playerNames:arr parameter";
	}
	if(playerNames.length < 2){
		console.error("Hanabi requires at least two players");
		throw "You must include at least two player names";
	}
	if(playerNames.length > 5){
		console.error("Hanabi requires at most five players");
		throw "You must include at most five player names";
	}

	game.id = (new Date()).getTime() + '-' + Math.floor(Math.random() * 100000);
	let deck = [];
	for(var color of colors){
		for(var number of numbers){
			deck.push(
				{
					color,
					number,
					notColors : [],
					notNumbers : [],
					colors : [],
					numbers : []
				}
			);
		}
	}
	game.deck = shuffle(deck).map((c,i)=>(c.id=i+1)&&c);
	game.discards = [];
	game.played = {};
	game.over = false;
	colors.forEach(c=>game.played[c]=0);
	game.whosTurn = 0;

	game.advice = 8;
	game.bombs = 3;

	//games with 4,5 players have 4 cards, otherwise 5 cards
	const handSize = playerNames.length < 4 ? 5 : 4;

	playerNames = shuffle(playerNames);
	game.players = playerNames.map((p, i) => {
		return {
			name: p,
			id: Math.floor((Math.random() + (i + 1)) * 100000), //player 1 gets a random id between 100000 and 200000
			hand: game.deck.splice(0, handSize)
		};
	});

	//only return enough data for the user to send links out.
	//the dev will need to call getGame() and save that to the database..
	return {
		whosTurn : game.whosTurn,
		players: game.players.map(p => { return { name: p.name, id: p.id }; }),
		id: game.id
	};
};


function nextTurn(){
	game.whosTurn = (game.whosTurn+1)%game.players.length;

	//if endGameStarted, check if everyone's gotten a turn
	if(game.inEndGame){
		if(game.whosTurn === game.whoGetsLastTurn){
			game.over = true;
		}
	}
	return game.over;
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

module.exports.play = function(playerId, cardId){
	if(!Number.isInteger(cardId)){
		console.log("You tried to play a card, try playing a card ID instead");
		throw "Attempted to play a non-integer cardId";
	}
	const whosTurn = game.players[game.whosTurn];
	if(whosTurn.id !== playerId){
		console.error("Tried to play as incorrect player");
		throw "Tried to play as incorrect player";
	}
	if(whosTurn.hand.map(c=>c.id).indexOf(cardId) === -1){
		console.error("Tried to play a card that's not in current player's hand");
		throw "That card doesn't belong to player who's turn it is";
	}
	const cardIndex = whosTurn.hand.findIndex(c=>c.id === cardId);
	const card = whosTurn.hand.splice(cardIndex,1);

	if(game.played[card.color] === card.number-1){
		//card plays!
		game.played[card.color]=card.number;
		//card was a 5, give them advice
		if(card.number === 5 && game.advice < 8) game.advice++;
		dealCardToPlayer(whosTurn);
		nextTurn();
		return {success: true, reason: 'card played'};
	} else {
		game.discards.push(card);
		game.bombs--;
		if(game.bombs === 0){
			//end of game
			game.over = true;
			return { success: 'false', reason: 'card did not play' };
		}
		else {
			dealCardToPlayer(whosTurn);
			nextTurn();
			return { success: 'false', reason: 'card did not play' };
		}
	}
};

function dealCardToPlayer(player){
	if(game.inEndGame) return;
	const newCard = game.deck.splice(0,1);

	//deck was empty, start endgame
	if(newCard.length === 0) {
		game.whoGetsLastTurn = game.players.findIndex(p=>p.id === player.id);
		game.inEndGame = true;
	} else {
		player.hand.push(newCard[0]);
	}

}