const hanabi = require('../source/hanabi');

module.exports = {
	setUp: function (cb) {
		hanabi.wipeForTests();
		cb();
	},

	playerNamesMustBeArray: function (test) {
		test.throws(function () {
			hanabi.createGame();
		}, "createGame function expects playerName param as array");

		var game_init = hanabi.createGame({ playerNames: ['charlie', 'brittany'] });
		test.done();
	},

	playersKeepNames: function (test) {
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({ playerNames: names });

		for (var name of names) {
			test.ok(game_init.players.map(p=>p.name).indexOf(name) >= 0, "Player name ended up in game");
		}
		test.strictEqual(names.length, game_init.players.length, "Game gets correct num of players");
		test.done();
	},

	defaultGameHas50Cards: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		//deck + player's hands should be 50
		test.strictEqual(50, game.deck.length + game.players.map(p=>p.hand.length).reduce((o,l)=>o+l), "Deck should have 50 cards");
		test.done();
	},

	cannotPlayDuringOthersTurn: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		//pick first or second player, either way - the one who's turn it isn't
		const whoWillPlay = (game.whosTurn+1)%names.length;
		test.throws(function(){
			hanabi.play(whoWillPlay.id, whoWillPlay.hand[0].id);
		}, "Can only play during your turn");

		test.done();
	},

	canPlayOnMyTurn: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		const startTurn = game.whosTurn;
		const playRes = hanabi.play(game.players[game.whosTurn].id, game.players[game.whosTurn].hand[0].id);
		console.log('playRes', playRes);
		test.done();
	},

	canPlayOneAtBeginning: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		const startTurn = game.whosTurn;
		const ones = game.players[game.whosTurn].hand.filter(c=>c.number === 1);
		if(ones.length === 0){
			console.log("was not dealt a one");
			test.done();
		}
		else {
			console.log('Attempting to play', ones[0]);
			const playRes = hanabi.play(game.players[game.whosTurn].id, ones[0].id);
			test.ok(playRes.success, "was able to play one");
			test.done();
		}
	},

	playingAtBeginningEndsWithFullHand: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		const startTurn = game.whosTurn;
		console.log("playerStartHand", game.players[startTurn].hand.map(c=>c.id).join(', '));
		hanabi.play(game.players[game.whosTurn].id, game.players[game.whosTurn].hand[0].id);
		console.log("playerEndHand", game.players[startTurn].hand.map(c=>c.id).join(', '));
		test.equal(game.players[startTurn].hand.length, 5, "Player who played should end with full hand");
		test.done();
	},

	playingAtBeginningIncrementsTurn: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		const startTurn = game.whosTurn;
		hanabi.play(game.players[game.whosTurn].id, game.players[game.whosTurn].hand[0].id);
		if(game.whosTurn === 0){
			test.equal(startTurn, names.length, "if new player is 0, last player should be last-player");
		} else{
			test.equal(startTurn+1, game.whosTurn, "Next player should be one higher than last");
		}
		test.done();
	},

	playingNonOneAtBeginningDecrementBombs: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		const startTurn = game.whosTurn;
		const non_ones = game.players[game.whosTurn].hand.filter(c=>c.number !== 1);
		if(non_ones.length === 0){
			test.equal(2, game.bombs, "Bombs should decrement on bad play");
		}
		test.done();
	},

	cannotDiscardOnFirstTurn: function(test){
		const names = ['a', 'b', 'c'];
		const game_init = hanabi.createGame({playerNames: names});
		const game = hanabi.getGame();
		const startTurn = game.whosTurn;
		test.throws(function(){
			hanabi.discard(game.players[game.whosTurn].id, game.players[game.whosTurn].hand[0].id);
		}, "cannot discard on first turn");
		test.done();
	}

};