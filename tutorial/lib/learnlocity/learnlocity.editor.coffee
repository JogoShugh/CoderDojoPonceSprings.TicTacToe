(->
	mod = angular.module('learnlocity.editor', ['ui.ace', 'ui.bootstrap'])

	mod.controller 'editorController', ($scope)->
		CHANGE_HEIGHT_DELTA = 50

		$scope.displays =
			html:true
			css:true
			js:true
			preview:true

		jsEditor = null
		htmlEditor = null
		cssEditor = null
		editors =
			html: null
			css: null
			js: null

		changeHeight = (target, delta) ->
			el = editors[target].container.parentElement
			height = adjustedHeight(el.offsetHeight, delta)
			el.style.height = height
			editors[target].resize()
	  
		adjustedHeight = (height, delta) ->
			return height + "px"  if height <= 100 and delta < 0
			height = height + delta + "px"
			return height

		$scope.htmlLoaded = (ace) ->
			htmlEditor = ace
			editors["html"] = ace

		$scope.cssLoaded = (ace) ->
			cssEditor = ace
			editors["css"] = ace

		$scope.jsLoaded = (ace) ->
			jsEditor = ace
			editors["js"] = ace

		$scope.shorter = (target) ->
			changeHeight target, -CHANGE_HEIGHT_DELTA

		$scope.taller = (target) ->
			changeHeight target, CHANGE_HEIGHT_DELTA

		$scope.shorterPreview = ->
			el = angular.element("#" + $scope.code.name)[0]
			height = adjustedHeight(el.offsetHeight, -CHANGE_HEIGHT_DELTA)
			el.style.height = height

		$scope.tallerPreview = ->
			el = angular.element("#" + $scope.code.name)[0]
			height = adjustedHeight(el.offsetHeight, CHANGE_HEIGHT_DELTA)
			el.style.height = height

		$scope.preview = ->
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

			iframe = document.getElementById($scope.code.name)

			doc = iframe.contentWindow.document
			doc.open()
			doc.write "<html>" + html.html() + "</html>"
			doc.close()
)()