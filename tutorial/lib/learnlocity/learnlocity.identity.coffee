(-> 
  apiErrorHandle = (err) ->
    message = 'Encountered an unexpected error:\n\n' + JSON.stringify(err)    
    console.error message

  mod = angular.module('learnlocity.identity', ['ui.bootstrap', 'learnlocity.api'])
  
  mod.directive 'match', ($parse) ->
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->
      scope.$watch (->
        $parse(attrs.match)(scope) is ctrl.$modelValue
      ), (currentValue) ->
        ctrl.$setValidity 'mismatch', currentValue

  modal = null

  dialogOptions =
    controller: 'identityController'
    templateUrl: 'partials/learnlocity.identity.identifyUser.html'
    backdrop: true
    keyboard: true
    backdropClick: true # TODO what this for anyway?

  mod.controller 'identityController', ($rootScope, $scope, $modal, User) ->
    clearErrors = ->
      $scope.userNameTaken = false
      $scope.loginFailed = false
    
    $scope.form =
      userName: ''
      password: ''
      passwordConfirmation: ''

    $scope.showIdentifyUserDialog = ->
      modal = $modal.open(dialogOptions)
      modal.result.then (result) -> console.log result if result

    $scope.close = (result) ->
      modal.close result

    $scope.logInWithGitHub = ->
      window.open "auth.html","Log In with GitHub","width=800,height=800"
      
    $scope.logIn = ->
      clearErrors()
      User.query
        q: JSON.stringify($and: [
          userName:
            $regex: '^' + $scope.form.userName + '$'
            $options: 'i'
        ,
          password: $scope.form.password
        ])
      , ((results) ->
        if results.length > 0
          user = results[0]
          $rootScope.userName = user.userName
          $rootScope.userLoggedIn = true
          modal.close true
        else
          $scope.loginFailed = true
      ), apiErrorHandle

    $scope.register = ->
      clearErrors()
      User.query
        q: JSON.stringify(userName:
          $regex: '^' + $scope.form.userName + '$'
          $options: 'i'
        )
      , ((results) ->
        if results.length > 0
          $scope.userNameTaken = true
        else
          user =
            userName: $scope.form.userName
            password: $scope.form.password

          User.save user, ((newUser) ->
            $rootScope.userName = newUser.userName
            $rootScope.userLoggedIn = true
            modal.close true
          ), apiErrorHandle
      ), apiErrorHandle
)()