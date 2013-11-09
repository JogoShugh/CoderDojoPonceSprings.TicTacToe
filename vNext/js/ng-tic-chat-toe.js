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
        
  var app = angular.module('tic-chat-toe', ['ui.bootstrap', 'learnlocity.identity']);

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
        },
        here_now: function(channel, callback) {      
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
          myPubNub.subscribe(subscription);
        },
        publish: function(channel, messageType, data) {
          var message = {
            channel: channel,
            message: {
              message_type: messageType,
              message: data
            }
          };
          myPubNub.publish(message);
        },
        here_now: function(channel, callback) {
          myPubNub.here_now({
            channel: channel,
            callback: callback
          });
        },
        history: function(channel, callback) {
          myPubNub.history({
            channel: channel,
            limit: 100,
            callback: callback
          });
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

  var myPubNub = null;
  var lobbyChannel = 'The_Lobby'; 

  app.controller('lobbyCtrl', function($scope, $rootScope, Bus) {
    $scope.audioEnabled = true;

    function playAudio(audioName, callback, scope) {
      if ($scope.audioEnabled) {
        var callbackExecuted = false;
        try {
          var audio = document.createElement('audio');        
          audio.src = 'audio/' + audioName + '.mp3';    
          audio.addEventListener('ended', function() {
            if (callback) {
              scope.$apply(function() {
                callback();
                callbackExecuted = true;
                audio.pause();       
              });
            }
          });
          audio.play();
        } catch (ex) {
          if (callback && !callbackExecuted ) {
            callback();
          }
        }
      } else {
        if (callback) {
          callback();
        }
      }
    }

    $rootScope.gameEvent = playAudio;

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
        },
        gameModeSinglePlayer = {
          label: 'Single player game?',
          type: 'test',
          value: false,
          order: 3
        }
    $scope.gameName = gameName;
    $scope.gameCreateForm = [
      gameName,
      boardSize,
      streakLen,
      gameModeSinglePlayer
    ];

    function subscribeToTheLobby() {
      Bus.subscribe(lobbyChannel, function(message) {
        invoke($scope, $scope, 'on' + message.message_type, [message]);
      });
      Bus.here_now(lobbyChannel, function(messages) {
        invoke($scope, $scope, 'onherenow', [messages.uuids]);
      });
    }

    function subscribeToMyOwnChannel() {
      Bus.subscribe($rootScope.userName, function(message) {
        invoke($scope, $scope, 'on' + message.message_type, [message]);
      });
    }

    function publishToLobby(messageType, data) {
      Bus.publish(lobbyChannel, messageType, data);
    }

    var gamesOpen = [];
    $scope.gamesOpen = gamesOpen;
    
    $scope.gamesOpenCount = function() {
      if (gamesOpen.length > 0) {
        return " (" + gamesOpen.length + ")";
      } else {
        return "";
      }
    };

    $scope.gamesOpenClass = function() {
      if (gamesOpen.length > 0) {
        return "flash";
      } else {
        return "";
      }
    };    


    var gamesJoined = [];
    
    var gamesActive = [];
    $scope.gamesActive = gamesActive;

    var gamesCompleted = [];
    $rootScope.gamesCompleted = gamesCompleted;

    var gamesAllCompleted = [];
    $rootScope.gamesAllCompleted = gamesAllCompleted;    

    function gameTabActivate(gameToActivate) {
      angular.forEach($scope.gamesActive, function(game) {
        game.active = false;
      });
      gameToActivate.active = true;
    }

    $scope.gameCreate = function() {
      var game = new TicChatToe(boardSize.value, streakLen.value, gameName.value);
      game.onmoveComplete = function(move) {
        var gameEventType = 'playerMove' + move.player;
        $rootScope.gameEvent(gameEventType);
      };
      game.active = false;
      game.gameModeSinglePlayer = gameModeSinglePlayer.value;
      game.hostedByMe = true;
      gamesActive.push(game);
      gamesJoined.push(gameName.value);
      gameTabActivate(game);
      $rootScope.gameCreateChannel(gameName.value, game);
      publishToLobby('game_created', {
        name: gameName.value,
        boardSize: boardSize.value,
        streakLen: streakLen.value,
        userHosting: $rootScope.userName
      });
    };

    $scope.gameJoinRequest = function(game) {
      var joinRequest = {
        gameName: game.name,
        userChallenger: $rootScope.userName
      };
      Bus.publish(game.userHosting, 'joinRequest', joinRequest);
    };

    $scope.onjoinRequest = function(message) {
      $rootScope.gameEvent('challengeIncoming', function() {
        var challengeAcceptedResult = confirm(message.message.userChallenger + " wants to play you in game " + message.message.gameName + ". Do you accept?");
        var acceptChallengeMessage = {
          gameName: message.message.gameName,
          userHosting: $rootScope.userName,
          challengeAccepted: challengeAcceptedResult
        };
        if (challengeAcceptedResult === true) {
          var game = gamesActiveFindByName(message.message.gameName);
          game.opponent = message.message.userChallenger;        
        }
        Bus.publish(message.message.userChallenger, 'challengeAcceptAnswer', acceptChallengeMessage);
        if (challengeAcceptedResult === true) {
          publishToLobby('gameStarted', {
            name: message.message.gameName,
            userHosting: $rootScope.gameName,
            opponent: message.message.userChallenger
          });
        }
      }, $scope);
    };

    $scope.onchallengeAcceptAnswer = function(message) {
      if (message.message.challengeAccepted) {
        $rootScope.gameEvent('challengeAccepted');
        var game = gameFindByName(message.message.gameName);
        if (game) {
          $scope.gameJoin(game);
        }
      } else {
        $rootScope.gameEvent('challengeDeclined');
      }
    };

    var gameFindByName = function(gameName) {
      return _.findWhere(gamesOpen, {name:gameName});
    };

    var gamesActiveFindByName = function(gameName) {
      return _.findWhere(gamesActive, {name:gameName});
    };    

    $scope.gameJoin = function(gameCreate) {
      var game = new TicChatToe(gameCreate.boardSize, gameCreate.streakLen, gameCreate.name, TicChatToe.PlayerO);
      game.onmoveComplete = function(move) {
        var gameEventType = 'playerMove' + move.player;
        $rootScope.gameEvent(gameEventType);
      };      
      game.active = false;
      game.opponent = gameCreate.userHosting;
      gamesActive.push(game);
      gamesJoined.push(game.name);
      gameTabActivate(game);
      $rootScope.gameCreateChannel(game.name, game, true);
      var joinMessage = {
        gameName: game.name,
        userChallenger: $rootScope.userName
      };
      Bus.publish(game.name, 'join', joinMessage);
    };

    $rootScope.gameCreateChannel = function(gameName, game, requestHistory) {
      Bus.subscribe(gameName, function(message) {
        invoke($scope, game, 'on' + message.message_type, [message.message]);
      });
      if (requestHistory) {
        Bus.history(gameName, function(messages) {
          for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            invoke($scope, game, 'on' + message.message_type, [message.message]);
          }
        });
      }
    };    

    $rootScope.sendLobbyMessage = publishToLobby;

    // Watch for login, then take action by configuring PubNub:
    $rootScope.$watch('userName', function(val) {
      if (val === undefined) return;
      try {
        myPubNub = PUBNUB.init({
          publish_key   : 'pub-c-f4a90e76-f06e-42b8-9594-3756a8bac175',
          subscribe_key : 'sub-c-daf9c6dc-e063-11e2-ab32-02ee2ddab7fe',
          uuid          : $rootScope.userName
        });
      } catch (ex) {        
      }
      subscribeToTheLobby();
      subscribeToMyOwnChannel();
    });    

    // Handlers:
    $scope.ongame_created = function(message) {
      if (!_.findWhere(gamesJoined, {name:message.message.name})) {
        $rootScope.gameEvent('gameOpenAvailable', function() {
          gamesOpen.push(message.message);
        }, $scope);
      }
    };

    var whoIsOnline = [];
    $scope.whoIsOnline = whoIsOnline;
    $scope.onherenow = function(messages) {
      angular.forEach(messages, function(who) {
        $scope.whoIsOnline.push({uuid:who});        
      });
    };

    $scope.ongameStarted = function(message) {
      var game = gameFindByName(message.message.name);
      for(var i = 0; i < gamesOpen.length; i++) {
        if (gamesOpen[i] === game) {
          gamesOpen.splice(i);
        }
      }
    };

    $scope.ongameCompleted = function(message) {
      $rootScope.gameEvent('gameAllComplete', function() {
        $rootScope.gamesAllCompleted.unshift(message.message);
      }, $scope);
    };
  });

  app.controller('gameCtrl', function($scope, $rootScope, $timeout, Bus) {
    $scope.gameStarted = false;
    $scope.moveAttempted = false;
    $scope.gameInit = function(game) {
      $scope.board = game.getBoard();
      $scope.game = game;
      $scope.gameStarted = true;
    };

    function sendGameMessage(message_type, data) {
      Bus.publish($scope.game.name, message_type, data);
    }

    function publishToLobby(messageType, data) {
      Bus.publish(lobbyChannel, messageType, data);
    }    

    $scope.move = function(cell) {
      if (!$scope.game.gameModeSinglePlayer === "true" || $scope.game.player != $scope.game.playerCurrent) {
        return;
      }
      var moveAttempt = TicChatToe.move(cell.row, cell.col, $scope.game.playerCurrent);
      $scope.moveAttempted = true;
      sendGameMessage('move', moveAttempt);
    };

    $scope.getWinnerStatus = function(move) {
      if (!$scope.moveAttempted) return '';
      if (!$scope.game.gameOver()) return '';
      if ($scope.game.winningMoves.length > 0) {
        var item = _.findWhere($scope.game.winningMoves, {row:move.row, col:move.col});
        var found = item != null && item != undefined;
        if (found) return 'winner';
      }
      return 'loser';
    };

    $scope.$watch('game.gameOver()', function(val) {
      if (val === true) {
        var game = $scope.game;        
        var winner = game.getWinner().winner;
        // TODO: maybe move this into the game logic itself?
        var playerWinner = '',
            playerLoser = '';
        if (game.hostedByMe && winner === TicChatToe.PlayerX
            ||
            !game.hostedByMe && winner === TicChatToe.PlayerO
          ) {
            game.playerWinner = "You";
            playerWinner = $rootScope.userName;
            game.playerLoser = game.opponent;
            playerLoser = game.opponent;
            $rootScope.gameEvent('gameWon');
        } else {
          game.playerWinner = game.opponent;
          playerWinner = game.opponent;
          game.playerLoser = "you";
          playerLoser = $rootScope.userName;
          $rootScope.gameEvent('gameLost');
        }
        $rootScope.gamesCompleted.unshift(game);
        // Send a global message to all players
        if (game.hostedByMe) {
          publishToLobby('gameCompleted', {
            name: game.name,
            playerWinner: playerWinner,
            playerLoser: playerLoser
          });
        }
      }
    });    
  });
})();