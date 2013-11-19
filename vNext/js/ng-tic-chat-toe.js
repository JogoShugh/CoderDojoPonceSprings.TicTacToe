(function() {
  'use strict';
  var AUDIO_BASE_URL = "http://jogoshugh.github.io/CoderDojoPonceSprings.TicTacToe/vNext/audio/";
        
  var app = angular.module('tic-chat-toe', ['ui.bootstrap', 'ngAnimate', 'message-bus', 'learnlocity.identity']);

  var lobbyChannelName = 'LobbyChannel'; // A channel for global messages that all members see

  app.controller('lobbyController', function($scope, $rootScope, Bus,$timeout) {
    $scope.audioEnabled = true;

    $rootScope.gameEvent = playAudio;

    var gameName = {
      label: 'Game name',
      type: 'text',
      required: 'true',
      value: '',
      order: 0,
      min: 3,
      max: 100     
    },
    boardSize = {
      label: 'How many rows and columns',
      type: 'number',
      required: 'true',
      value: 3,
      order: 1,
      min: 3,
      max: 20
    },
    streakLen = {
      label: 'Winning streak length',
      type: 'number',
      required: 'true',
      value: 3,
      order: 2,
      min: 3,
      max: 20
    },
    gameModeSinglePlayer = {
      label: 'Single player practice game?',
      type: 'checkbox',
      required: 'false',
      value: false,
      order: 3,
      min: 3,
      max: 20      
    };
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
      Bus.publish(lobbyChannelName, messageType, data);
    }

    function subscribeToTheLobby() {
      Bus.subscribe(lobbyChannelName, function(message) {
        console.log(message);
        invoke($scope, $scope, 'on' + message.message_type, [message]);
      });
    }
    
    function playAudio(audioName, callback, scope) {
      if ($scope.audioEnabled) {
        var callbackExecuted = false;
        try {
          var audio = document.createElement('audio');        
          audio.src = AUDIO_BASE_URL + audioName + '.mp3';    
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

    var lobbyChatMessageUnseenCount = 0;
    
    $scope.onlobbyChatMessage = function(message) {
      lobbyChatMessages.unshift(message.message);
      lobbyChatMessageUnseenCount++;
    };
    
    $scope.lobbyChatMessagesNewCount = function(tab) {
      // TODO this is now working right:
      //if (lobbyChatMessageUnseenCount > 0) {
      //  return "&nbsp;(" + lobbyChatMessageUnseenCount + ")";
      //}
      return "";
    };
    
    $scope.lobbyChatMessagesSeen = function() {
      lobbyChatMessageUnseenCount = 0;
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

    $scope.removeGame = function(game) {
      for(var i = 0; i < gamesActive.length; i++) {
        if (gamesActive[i] === game) {
          gamesActive.splice(i,1);
        }
      }
      for(var i = 0; i < gamesJoined.length; i++) {
        if (gamesJoined[i] === game.name) {
          gamesJoined.splice(i,1);
        }
      }
      for(var i = 0; i < $scope.gamesOpen.length; i++) {
        var gameToRemove = gameFindByName(game.name);
        if (gamesOpen[i] === gameToRemove) {
          $scope.gamesOpen.splice(i,1);
        }
      }
    }

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
      var timeoutValue = 30000;
      game.onmoveComplete = function(move) {
        var gameEventType = 'playerMove' + move.player;
        $rootScope.gameEvent(gameEventType);
      };
      game.active = false;
      console.log('gameModeSinglePlayer:');
      console.log(gameModeSinglePlayer.value);
      game.gameModeSinglePlayer = gameModeSinglePlayer.value;
      game.hostedByMe = true;
      gamesActive.push(game);
      gamesJoined.push(gameName.value);
      gameTabActivate(game);
      $rootScope.gameCreateChannel(gameName.value, game);
      if (!game.gameModeSinglePlayer) {
        publishToLobby('game_created', {
          name: gameName.value,
          boardSize: boardSize.value,
          streakLen: streakLen.value,
          userHosting: $rootScope.userName
        });
        var time = $timeout(function(){
          if(game.requested){
            $timeout.cancel(time);
          }
          else{
            $scope.removeGame(game);
          }  

        },timeoutValue);
      }

      gameName.value = '';
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
        $rootScope.gameEvent('challengeDeclined', function() {
          var game = gameFindByName(message.message.gameName);
          if (game) {
            game.challengeDeclined = true;
          }
        }, $rootScope);
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
        TicChatToeBus = PUBNUB.init({
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
          console.log(message.message);
        }, $scope);
      }
    };

    $scope.ongameStarted = function(message) {
      var game = gameFindByName(message.message.name);
      for(var i = 0; i < gamesOpen.length; i++) {
        if (gamesOpen[i] === game) {
          gamesOpen.splice(i,1);
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
          gamesActive.splice(i,1);
        }
      }
    };
  });

  app.controller('gameController', function($scope, $rootScope, $timeout, Bus) {
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
      Bus.publish(lobbyChannelName, messageType, data);
    }    

    $scope.move = function(cell) {
      if ($scope.game.gameModeSinglePlayer !== true && $scope.game.player != $scope.game.playerCurrent) {
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
        if (game.gameModeSinglePlayer) {
          $rootScope.gameEvent('gameWon');
          return;
        }
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