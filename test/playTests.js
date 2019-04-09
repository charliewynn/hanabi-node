const hanabi = require("../source/hanabi");

module.exports = {
  setUp: function(cb) {
    hanabi.wipeForTests();
    cb();
  },
  loadingPartialDoesntAffectGame: function(test) {
    var game_init = hanabi.createGame({ playerNames: ["charlie", "jordan"] });
    const game = hanabi.getGame();
    const whosTurn = game.players[game.whosTurn].id;
    const partial = hanabi.getPlayerGameState(whosTurn);
    console.log(
      "partial",
      partial.players
        .map(p => p.hand.map(c => [c.color, c.number].join(" ")).join(" - "))
        .join("  --  ")
    );
    console.log(
      "hands",
      game.players
        .map(p => p.hand.map(c => [c.color, c.number].join(" ")).join(" - "))
        .join("  --  ")
    );

    test.done();
  }
};
