var app = angular.module('tic-chat-toe', ['ui.bootstrap']);

app.controller('gameCtrl', function($scope, $timeout) {
  $scope.gameStarted = false;
  $scope.boardSize = 3;
  $scope.streakSize = 3;
  $scope.gameStart = function() {
    var game = new TicChatToe($scope.boardSize, $scope.streakSize);
    $scope.board = game.getBoard();
    $scope.game = game;
    $scope.gameStarted = true;
  }
  
  $scope.move = function(cell) {
    var moveAttempt = event(cell.row, cell.col, $scope.game.playerCurrent);
    $scope.game.onmove(moveAttempt);
  }

  $scope.getWinnerStatus = function(move) {
    if (!$scope.game.gameOver) return '';
    if ($scope.game.winningMoves.length > 0) {
      var item = _.findWhere($scope.game.winningMoves, {row:move.row, col:move.col});
      var found = item != null && item != undefined;
      if (found) return 'winner';
    }
    return 'loser';
  }
  /*
  // Simulate interaction:
  var test = tests[3];
  var moves = createEventsFromArray(test);
  var move_index = 0;
  var moves_length = moves.length;
  
  function next_move() {
    var move = moves[move_index];  
    game.onmove(move);
    move_index++;
    if (move_index < moves_length)
      $timeout(next_move, 250);
  }
  next_move();
  */
});

function event(row, col, player) {
  return {
    row: row,
    col: col,
    player: player
  };
}

var x = 'x';
var o = 'o';

var test = [
  [x, o, o],
  [o, x, o],
  [o, o, x]
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

function createEventsFromArray(array) {
  var events = [];
  for (var r = 0; r < array.length; r++) {
    for (var c = 0; c < array[r].length; c++) {
      events.push(event(r, c, array[r][c]));
    }
  }
  return events;
}