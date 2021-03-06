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

    function subscribeToMyOwnChannel() {
      Bus.subscribe($rootScope.userName, function(message) {
        invoke($scope, $scope, 'on' + message.message_type, [message]);
      });
    }

    function publishToLobby(messageType, data) {
      Bus.publish(lobbyChannel, messageType, data);
    }

    function subscribeToTheLobby() {
      Bus.subscribe(lobbyChannel, function(message) {
        console.log(message);
        invoke($scope, $scope, 'on' + message.message_type, [message]);
      });
    }

    var lobbyChatMessages = [];
    $scope.lobbyChatMessages = lobbyChatMessages;

    $scope.lobbyChatMessageInput = {value: ''};

    $scope.lobbyChatMessageSend = function() {
      publishToLobby('lobbyChatMessage', {
        uuid: $rootScope.userName,
        message: $scope.lobbyChatMessageInput.value
      });      
      $scope.lobbyChatMessageInput.value = '';
    };    

    $scope.onlobbyChatMessage = function(message) {
      lobbyChatMessages.unshift(message.message);
    };

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
      if (!game.requested) {
        var joinRequest = {
          gameName: game.name,
          userChallenger: $rootScope.userName
        };
        game.requested = true;
        Bus.publish(game.userHosting, 'joinRequest', joinRequest);
      }
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
      publishToLobby('lobbyChatMessage', {
        uuid: 'Tic-Chat-Toe',
        message: $rootScope.userName + ' joined the lobby chat'
      });      
    });    

    // Handlers:
    $scope.ongame_created = function(message) {
      if (!_.findWhere(gamesJoined, {name:message.message.name})) {
        $rootScope.gameEvent('gameOpenAvailable', function() {
          message.message.requested = false;
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

    $scope.gameClose = function(game) {
      for(var i = 0; i < gamesActive.length; i++) {
        if (gamesActive[i] === game) {
          gamesActive.splice(i);
        }
      }
    };
  });

  app.controller('gameCtrl', function($scope, $rootScope, $timeout, Bus) {
    $scope.gameStarted = false;
    $scope.moveAttempted = false;
    $scope.gameInit = function(game) {
      $scope.board = game.getBoard();
      $scope.game = game;
      $scope.gameStarted = true;
      gameChatInit(game);
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

    function gameChatInit(game) {
      var gameChatMessages = [];
      $scope.gameChatMessages = gameChatMessages;

      $scope.gameChatMessageInput = {value: ''};

      $scope.gameChatMessageSend = function() {
        sendGameMessage('gameChatMessage', {
          uuid: $rootScope.userName,
          message: $scope.gameChatMessageInput.value
        });      
        $scope.gameChatMessageInput.value = '';
      };    

      game.ongameChatMessage = function(message) {
        gameChatMessages.unshift(message);
      };
    }
  });
})();