(->
	mod = angular.module('learnlocity.editor', ['ui.ace', 'ui.bootstrap'])

	mod.controller 'editorController', ($scope, $timeout, $window)->
		$scope.displays =
			step:true
			html:true
			css:true
			js:true
			preview:false

		$scope.update = { whenTyping : true, previewBelow: false }

		getNumDisplaysVisible = ->
			numTurnedOn = 0
			for k,v of $scope.displays
				if v == true then numTurnedOn++

			if $scope.displays.preview and $scope.update.previewBelow 
				numTurnedOn--
		
			numTurnedOn

		
		$scope.getEditorsClass = ->
			numTurnedOn = getNumDisplaysVisible()
			sizesMap = 
				'1':12
				'2':6
				'3':4
				'4':3
				'5':2
				'6':2
			'col-md-' + sizesMap[numTurnedOn]


		$scope.getPreviewClass = ->
			numTurnedOn = getNumDisplaysVisible()
			console.log 'on: ' + numTurnedOn
			sizesMap =
				'1':12
				'2':6
				'3':4
				'4':3
				'5':4
				'6':2
			if not $scope.update.previewBelow 
				'col-md-' + sizesMap[numTurnedOn]
			else
				'col-md-12'

		jsEditor = null
		htmlEditor = null
		cssEditor = null
		editors =
			html: null
			css: null
			js: null

		$scope.editorsToLoadCount = 3

		updateEditorHeights = ->
			baseLineOffsetTop = $('#step').offset().top
			$('.editor, .ace_wrapper, .preview').each ->
				newHeight = $window.document.body.clientHeight - baseLineOffsetTop - 2
				$(@).height(newHeight)
			for key, editor of editors
				editor.resize()

		angular.element($window).bind 'resize', updateEditorHeights

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

			codeId = $scope.code.id

			$("#" + codeId).each ->
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
					updateEditorHeights()
				, 250
)()