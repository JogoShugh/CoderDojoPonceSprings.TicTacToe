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

  app.provider('Bus', function() {
    this._busType = 'Bus';

    this.useBusInMemory = function(busType) {
      this._busType = 'BusInMemory';
    };

    function createBusInMemory() {
      var channels = [];
      function channelFind(name) {
        return _.findWhere(channels, {name: name});
      }
      return {
        subscribe: function(channel, callback) {
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
        },
        publish: function(channel, messageType, data) {
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
        }
      };
    }

    function createBus() {
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
    }

    this.$get = function() {
      if (this._busType == 'BusInMemory') {
        return createBusInMemory();
      } else {
        return createBus();
      }
    };
  });

  /*
  app.service('BusInMemory', 
  });
  */
  /*
  app.service('Bus',
  });
  */

  /*
  app.config(function(BusProvider){
    BusProvider.useBusInMemory();
  });
  */

  app.controller('lobbyCtrl', function($scope, $rootScope, Bus) {
    //var Bus = BusInMemory;
    var lobbyChannel = 'The_Lobby';    

    var gameName = {
          label: 'Game name',
          type: 'text',
          required: 'true',
          value: '',
          order: 0
        },
        boardSize = {
          label: 'How many rows and columns',
          type: 'number',
          required: 'true',
          value: 3,
          order: 1
        },
        streakLen = {
          label: 'Winning streak length',
          type: 'number',
          required: 'true',
          value: 3,
          order: 2
        };
    $scope.gameName = gameName;
    $scope.gameCreateForm = [
      gameName,
      boardSize,
      streakLen
    ];

    function subscribeToTheLobby() {
      Bus.subscribe(lobbyChannel, function(message) {
        invoke($scope, $scope, 'on' + message.message_type, [message]);
      });
    }

    function publishToLobby(messageType, data) {
      Bus.publish(lobbyChannel, messageType, data);
    }

    var gamesOpen = [];
    $scope.gamesOpen = gamesOpen;
    var gamesJoined = [];
    
    var gamesActive = [];
    $scope.gamesActive = gamesActive;

    function gameTabActivate(gameToActivate) {
      angular.forEach($scope.gamesActive, function(game) {
        game.active = false;
      });
      gameToActivate.active = true;
    }

    $scope.gameCreate = function() {
      var game = new TicChatToe(boardSize.value, streakLen.value, gameName.value);
      game.active = false;
      gamesActive.push(game);
      gamesJoined.push(gameName.value);
      gameTabActivate(game);
      $rootScope.gameCreateChannel(gameName.value, game);
      publishToLobby('game_created', {
        name: gameName.value,
        boardSize: boardSize.value,
        streakLen: streakLen.value
      });
    };

    $scope.gameJoin = function(game) {
      var game = new TicChatToe(game.boardSize, game.streakLen, game.name, TicChatToe.PlayerO);
      game.active = false;
      gamesActive.push(game);
      gamesJoined.push(game.name);
      gameTabActivate(game);
      $rootScope.gameCreateChannel(game.name, game);
    };

    $rootScope.gameCreateChannel = function(gameName, game) {
      Bus.subscribe(gameName, function(message) {
        invoke($scope, game, 'on' + message.message_type, [message.message]);
      });
    };    

    $rootScope.sendLobbyMessage = publishToLobby;

    subscribeToTheLobby();

    // Handlers:
    $scope.ongame_created = function(message) {
      if (!_.findWhere(gamesJoined, {name:message.message.name})) {
        gamesOpen.push(message.message);
      }
    };
  });

  app.controller('gameCtrl', function($scope, $rootScope, $timeout, Bus) {
    //var Bus = BusInMemory;
    $scope.gameStarted = false;
    $scope.moveAttempted = false;

    $scope.gameInit = function(game) {
      $scope.board = game.getBoard();
      $scope.game = game;
      $scope.gameStarted = true;
    };

    function sendGameMessage(message_type, data) {
      Bus.publish($scope.game.name, message_type, data)
    }

    $scope.move = function(cell) {
      console.log('Game player: ' + $scope.game.player);
      console.log('Player current: ' + $scope.game.playerCurrent);
      if ($scope.game.player != $scope.game.playerCurrent) {
        return;
      }
      var moveAttempt = TicChatToe.move(cell.row, cell.col, $scope.game.player);
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