(function() {
  'use strict';
  function invoke(scope, obj, functionName, args) {
    var handler = obj[functionName];
    if (handler && typeof handler == 'function') {
      var phase = scope.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        handler.apply(obj, args);
      } 
      else {
        scope.$apply(function() {
          handler.apply(obj, args);
        });          
      }
    }
  }
        
  var app = angular.module('tic-chat-toe', ['ui.bootstrap']);

  app.service('BusInMemory', function() {
    var channels = [];
    function channelFind(name) {
      return _.findWhere(channels, {name: name});
    }

    function Bus() {
      // We don't really need the scope here...
    }

    Bus.prototype.subscribe = function(channel, callback) {
      var subscription = {
        channel: channel,
        callback: callback
      };
      var channel = channelFind(subscription.channel);
      if (!channel) {
        channel = { name: subscription.channel, subscribers:[] }
        channels.push(channel);
      }
      channel.subscribers.push(subscription.callback);
    };

    Bus.prototype.publish = function(channel, messageType, data) {
      var message = {
        channel: channel,
        message: {
          message_type: messageType,
          message: data
        }
      };        
      var channel = channelFind(message.channel);
      if (channel) {
        _.each(channel.subscribers, function(subscriber) {
          subscriber(message.message);
        });
      }
    };
    
    return new Bus();
  });

  app.service('Bus', function() {
    return {
      subscribe: function(channel, callback) {
        var subscription = {
          channel: channel,
          callback: callback
        };
        PUBNUB.subscribe(subscription);
      },
      publish: function(channel, messageType, data) {
        var message = {
          channel: channel,
          message: {
            message_type: messageType,
            message: data
          }
        };
        PUBNUB.publish(message);
      }
    };
  });

  app.controller('lobbyCtrl', function($scope, $rootScope, Bus) {
    //var Bus = BusInMemory;
    var lobbyChannel = 'The_Lobby';
    $scope.boardSize = 3;
    $scope.streakSize = 3;    

    function subscribeToTheLobby() {
      Bus.subscribe(lobbyChannel, function(message) {
        invoke($scope, $scope, 'on' + message.message_type, [message]);
      });
    }

    function publishToLobby(messageType, data) {
      Bus.publish(lobbyChannel, messageType, data);
    }

    var games = [];
    $scope.games = games;

    var gameName = 'Josh';
    var gameIndex = 0;

    $scope.gameCreate = function() {
      var gameChannel = gameName + gameIndex++;
      games.push(gameChannel);
    }

    $rootScope.createGameChannel = function(gameName, game) {
      Bus.subscribe(gameName, function(message) {
        invoke($scope, game, 'on' + message.message_type, [message.message]);
      });    
      publishToLobby('game_created', gameName);
    };    

    $rootScope.sendLobbyMessage = publishToLobby;

    subscribeToTheLobby();
  });

  app.controller('gameCtrl', function($scope, $rootScope, $timeout, Bus) {
    //var Bus = BusInMemory;
    $scope.gameStarted = false;
    $scope.moveAttempted = false;

    $scope.gameStart = function() {
      var game = new TicChatToe($scope.boardSize, $scope.streakSize);
      $scope.board = game.getBoard();
      $scope.game = game;
      $scope.gameStarted = true;
      console.log($scope.gameName);
      $rootScope.createGameChannel($scope.gameName, game);
    };

    function sendGameMessage(message_type, data) {
      Bus.publish($scope.gameName, message_type, data)
    }

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