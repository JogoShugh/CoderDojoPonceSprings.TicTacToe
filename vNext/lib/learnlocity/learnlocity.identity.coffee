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

  dialog = null

  dialogOptions =
    controller: 'identityController'
    templateUrl: 'lib/learnlocity/partials/learnlocity.identity.identifyUser.html'
    backdrop: true
    keyboard: true
    backdropClick: true

  mod.controller 'identityController', ($rootScope, $scope, $dialog, User) ->
    clearErrors = ->
      $scope.userNameTaken = false
      $scope.loginFailed = false
    
    $scope.form =
      userName: ''
      password: ''
      passwordConfirmation: ''

    $scope.userIdentifyDialogShow = ->
      dialog = $dialog.dialog(dialogOptions)
      dialog.open().then (result) -> console.log result if result

    $scope.close = (result) ->
      dialog.close result

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
          dialog.close true
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
            dialog.close true
          ), apiErrorHandle
      ), apiErrorHandle
)()