'use strict';
var should = require('should');
var tct = require('./tic-chat-toe');
var _ = require('./underscore.min');

var X = 'X';
var O = 'O';
var s = ' ';

function runTest(spec) {
  var game = new tct(spec.boardSize, spec.requiredStreakLen);
  for(var i = 0; i < spec.movesOrder.length; i++) {
    var moveCoordinates = spec.movesOrder[i];
    var movePlayer = spec.moves[moveCoordinates[0]][moveCoordinates[1]];
    var move = tct.move(moveCoordinates[0], moveCoordinates[1], movePlayer);
    game.onmove(move);
  }
  var winner = game.getWinner();
  winner.hasWinner.should.eql(spec.hasWinner)
  if (winner.hasWinner) {
    winner.winner.should.eql(spec.winner);
  }
}

describe('3 by 3', function() {
  
  it('is won by O for top row', function(done) {
    runTest({
      boardSize: 3,
      requiredStreakLen: 3,
      moves: [
        [O, O, O],
        [X, X, s],
        [s, s, X]
      ],
      movesOrder: [
        [1,0],
        [0,0],
        [1,1],
        [0,1],
        [2,2],
        [0,2]
      ],
      hasWinner: true,
      winner: O,
      winningMoves: [tct.move(0,0,O), tct.move(0,1,O), tct.move(0,2,O)]
    });
    done();
  });

  it('is won by X for diagonal top left to bottom right', function(done) {
    runTest({
      boardSize: 3,
      requiredStreakLen: 3,
      moves: [
        [X, O, O],
        [s, X, s],
        [s, s, X]
      ], 
      movesOrder: [
        [0,0],
        [0,1],
        [1,1],
        [0,2],
        [2,2]
      ],
      hasWinner: true,
      winner: X,
      winningMoves: [
        [0,0], [1,1], [2,2]
      ]
    });
    done();
  });

});

/*
var test = [

];

tests = [
  [ // no winner
    [o, x, o],
    [x, o, x],
    [x, o, x]
  ],
  [ // o
    [o, o, o],
    [x, x, o],
    [x, o, x]
  ],
  [ // x
    [o, x, o],
    [x, x, x],
    [x, o, o]
  ],
  [ // x
    [o, x, o],
    [x, x, o],
    [o, x, x]
  ],
  [ // o
    [o, o, x],
    [o, o, x],
    [x, x, o]
  ],
  [ // x
    [o, o, x],
    [o, x, x],
    [x, o, o]
  ],
  [ // no
    [x, o, x],
    [o, o, x],
    [x, x, o]
  ],
  [ // x
    [x, o, x, o],
    [o, o, x, x],
    [x, x, x, o],
    [x, x, x, o],    
  ],
  [ // x
    [x, o, x, o],
    [o, x, o, x],
    [x, x, x, o],
    [x, x, o, x],    
  ],
  [ // x
    [x, o, x, o],
    [o, o, o, x],
    [x, o, x, o],
    [o, x, o, x],    
  ],
  [ // o
    [x, o, x, o, x],
    [o, o, o, x, o],
    [x, o, x, o, x],
    [o, x, o, x, o],
    [o, o, o, o, o]    
  ],
  [ // x
    [x, o, x, o, x],
    [o, o, o, x, o],
    [x, o, x, o, x],
    [o, x, o, x, o],
    [x, o, o, o, o]    
  ]
]

*/