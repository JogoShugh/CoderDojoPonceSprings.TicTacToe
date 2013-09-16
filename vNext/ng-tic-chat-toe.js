(function() {
  'use strict';

  var app = angular.module('tic-chat-toe', ['ui.bootstrap']);

  app.controller('lobbyCtrl', function($scope, $rootScope) {
    var lobby_channel_name = 'The_Lobby';
    /*  
      Lobby functions:
      The_Lobby is a channel that we use
      to send message about overall things,
      such as games getting created.
    */
    function subscribe_to_The_Lobby() {
      var subscription_setup = {
        channel: lobby_channel_name,
        callback: function(message) {
          var handler_function_name = 'on' + message.message_type;
          if ($scope[handler_function_name]) {
            $scope[handler_function_name](message);
          }
        }
      };
      PUBNUB.subscribe(subscription_setup);
    }

    function send_lobby_message(message_type, data) {
      var message_to_send = {
        channel: lobby_channel_name,
        message: {
          message_type: message_type,
          data: data
        }
      };
      PUBNUB.publish(message_to_send);
      return false;
    }

    $rootScope.sendLobbyMessage = send_lobby_message;

    function create_game_channel(gameName, game) {
      var subscriptionSetup = {
          channel: gameName,
          callback: function(message) {
            var handlerFunctionName = 'on' + message.message_type;
            if (game[handlerFunctionName]) {
              game[handlerFunctionName](message.data);
            }
          }
      };
      PUBNUB.subscribe(subscriptionSetup);
    }

    $rootScope.createGameChannel = function(gameName, game) {      
      create_game_channel(gameName, game);
      send_lobby_message('game_created', gameName);      
    }

    subscribe_to_The_Lobby();
  });

  app.controller('gameCtrl', function($scope, $rootScope, $timeout) {
    $scope.gameStarted = false;
    $scope.boardSize = 3;
    $scope.streakSize = 3;
    $scope.moveAttempted = false;
    $scope.gameName = 'Josh';
    $scope.gameStart = function() {
      var game = new TicChatToe($scope.boardSize, $scope.streakSize);
      $scope.board = game.getBoard();
      $scope.game = game;
      $scope.gameStarted = true;
      $rootScope.createGameChannel($scope.gameName, game);
    };

    function sendGameMessage(message_type, data) {
      var message_to_publish = {
        channel: $scope.gameName,
        message: {
          message_type: message_type,
          data: data
        }
      };
      PUBNUB.publish(message_to_publish);
      return false;
    }
    
    /*
    $scope.move = function(cell) {
      var moveAttempt = TicChatToe.move(cell.row, cell.col, $scope.game.playerCurrent);
      $scope.moveAttempted = true;
      $scope.game.onmove(moveAttempt);
    };
    */

    $scope.move = function(cell) {
      var moveAttempt = TicChatToe.move(cell.row, cell.col, $scope.game.playerCurrent);
      $scope.moveAttempted = true;
      sendGameMessage('move', moveAttempt);
     };    

    $scope.getWinnerStatus = function(move) {
      if (!$scope.moveAttempted) return '';
      if (!$scope.game.gameOver()) return '';
      if ($scope.game.winningMoves.length > 0) {
        var item = _.findWhere($scope.game.winningMoves, {row:move.row, col:move.col});
        console.dir(item);
        var found = item != null && item != undefined;
        if (found) return 'winner';
      }
      return 'loser';
    };
  });
})();