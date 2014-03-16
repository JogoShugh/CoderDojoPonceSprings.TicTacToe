(->
	mod = angular.module('learnlocity.editor', ['ui.ace', 'ui.bootstrap'])

	mod.controller 'editorController', ($scope, $timeout)->
		$scope.displays =
			html:true
			css:true
			js:true
			preview:false

		$scope.update = { whenTyping : true }

		$scope.getEditorsClass = ->
			return if $scope.displays.preview then 'col-md-3' else 'col-md-4'

		jsEditor = null
		htmlEditor = null
		cssEditor = null
		editors =
			html: null
			css: null
			js: null

		$scope.editorsToLoadCount = 3

		configureEditor = (editor) ->
			editor.setFontSize("14px")
			session = editor.getSession()
			session.on("change", editorContentChanged)
			$scope.editorsToLoadCount--

		editorContentChanged = ->
			if $scope.displays.preview && $scope.update.whenTyping then $scope.preview()

		$scope.htmlLoaded = (editor) ->
			htmlEditor = editor
			editors["html"] = editor
			configureEditor editor

		$scope.cssLoaded = (editor) ->
			cssEditor = editor
			editors["css"] = editor
			configureEditor editor

		$scope.jsLoaded = (editor) ->
			jsEditor = editor
			editors["js"] = editor
			configureEditor editor

		$scope.preview = ->
			$scope.displays.preview = true
			script = document.createElement("script")
			script.type = "text/javascript"	    
			script.text = jsEditor.getSession().getValue()

			head = $("<head></head>")
			head.append "<title>CoderDojo Ponce Springs</title>"
			head.append $(script)

			style = $("<style type='text/css'></style>")
			style.append cssEditor.getSession().getValue()
			head.append style

			body = $("<body></body>")
			body.append htmlEditor.getSession().getValue()

			html = $("<html></html>")
			html.append head
			html.append body

			$("#" + $scope.code.id).each ->
				doc = @contentWindow.document
				doc.open()
				doc.write "<html>" + html.html() + "</html>"
				doc.close()
		
		$scope.previewHide = ->
			$scope.displays.preview = false

		# TODO: this is a little bit hacktastic:
		$scope.$watch 'editorsToLoadCount', ->
			if $scope.editorsToLoadCount <= 0
				$timeout ->
					if $scope.previewOnLoad
						$scope.preview()
				, 250
)()