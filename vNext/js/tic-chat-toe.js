(function(windowTarget, globalTarget) {
  'use strict';
  // Constants
  //var _ = require('./underscore.min');
  var X = 'X';
  var O = 'O';
  var s = ' ';
  var playerNextMap = {};
  playerNextMap[X] = O;
  playerNextMap[O] = X;
  
  function TicChatToe(boardSize, streakLen, name, player) {
    this.boardSize = boardSize || 3;
    this.streakLen = streakLen || 3;
    this.name = name || 'Tic-Chat-Toe';
    this.player = player || X;
    this.initializeNewGame();
  }

  TicChatToe.PlayerO = O;
  TicChatToe.PlayerX = X;

  TicChatToe.move = function(row, col, player) {
    return {
      row: row,
      col: col,
      player: player
    };
  };

  TicChatToe.prototype.initializeNewGame = function() {
    this.board = [];
    this.moves = [];
    this.winningMoves = [];
    this.catsGame = false;
    this.playerCurrent = X;
    
    for (var row_index = 0; row_index < this.boardSize; row_index++) {
      var row = [];
      for(var col_index = 0; col_index < this.boardSize; col_index++) {
        var initialMove = TicChatToe.move(row_index, col_index, s);
        row.push(initialMove);
      }
      this.board.push(row);
    }
  };

  TicChatToe.prototype.startNewGame = function() {
    this.initializeNewGame();
  }
  
  TicChatToe.prototype.getMaxMovesCount = function() {
    return this.board.length * this.board.length;
  };

  TicChatToe.prototype.gameOver = function() {
    return (this.winningMoves.length > 0 || this.catsGame);
  };

  TicChatToe.prototype.onmove = function(move) {
    if (this.gameOver()) {
      console.error('Game over already!');
      return;
    }
    if (this.board[move.row][move.col].player != s) {
      console.error('This cell has already been played in');
      return;
    }
    /* TODO: not sure whether should resurface in a different way:
    if (move.player != this.playerCurrent) {
      console.error('Do not play out of turn');
      return;
    }
    */
    this.moves.push(move);
    this.board[move.row][move.col].player = move.player;
    
    var winningMoves = TicChatToe.findWinner(this.moves, this.streakLen);
   
    if (winningMoves.length == this.streakLen) {
      this.winningMoves = winningMoves;
    } 
    else if (this.moves.length == this.getMaxMovesCount()) {
      this.catsGame = true;    }
    else {
      console.log('Changing playerCurrent (old): ' + this.playerCurrent);
      this.playerCurrent = playerNextMap[this.playerCurrent];
      console.log('Changing playerCurrent (new): ' + this.playerCurrent);      
    }
  };

  TicChatToe.prototype.onjoin = function(join) {
    console.log('join: ' + join);
    /*
    if (message.userChallenger == $rootScope.userName) return;
    console.log(message.userChallenger + ' joined');
    */
  };
 
  TicChatToe.prototype.getBoard = function() {
    return this.board;
  };
  
  TicChatToe.prototype.getWinner = function() {
    if (this.winningMoves.length != 0) {
      return {
        hasWinner: true,
        winner: this.winningMoves[0].player,
        winningMoves: this.winningMoves
      };
    }
    return {
      hasWinner: false,
      winner: s,
      winningMoves: []
    }
  }

  TicChatToe.findWinner = function(moves, streakLen) {
    if (moves.length < streakLen) return []; 
    
    var winningWays = [findWinnerByRow, findWinnerByCol, findWinnerByDiag];
    
    for (var i = 0; i < moves.length; i++) {
      for (var f = 0; f < winningWays.length; f++) {
        var winningMoves = winningWays[f](moves, moves[i], streakLen);
        if (winningMoves.length == streakLen) return winningMoves;
      }
    }
    return [];
    
    /* Strategies to find a winner */

    function findWinnerByRow(moves, move, targetCount) {
      return findStreak(moves,
        move.row, move.col, move.player, 1, 0, targetCount, []);
    }
    
    function findWinnerByCol(moves, move, targetCount) {
      return findStreak(moves,
        move.row, move.col, move.player, 0, 1, targetCount, []);    
    }
    
    function findWinnerByDiag(moves, move, targetCount) {
      var matches = findStreak(moves,
        move.row, move.col, move.player, 1, 1, targetCount, []);
      if (matches.length == targetCount) return matches;
      
      return findStreak(moves,
        move.row, move.col, move.player, -1, 1, targetCount, []);
    }  
    
    /* Recursive algorithm that follows a strategy */

    function findStreak(moves, 
                    matchRow, matchCol, matchPlayer,
                    deltaRow, deltaCol, 
                    targetCount, matchedMoves) {
      var matchedMove = _.find(moves, function(move) {
        return move.player == matchPlayer &&
               move.row == matchRow &&
               move.col == matchCol;
      });
  
      if (!matchedMove) return matchedMoves;
  
      matchedMoves.push(matchedMove);
  
      if (matchedMoves.length == targetCount) return matchedMoves;
      
      return findStreak(_.reject(moves, function(m) { return m == matchedMove }),
        matchRow + deltaRow, matchCol + deltaCol, matchPlayer,
        deltaRow, deltaCol,
        targetCount, matchedMoves);
    }
  };
  // Set reference in the supplied global namespace
  try {
    if (window) {
      window.TicChatToe = TicChatToe;
    }
  } catch (ex) {
    module.exports = TicChatToe;
  } 
})();