(->
	dbUrl = "https://api.mongolab.com/api/1/databases/coderdojochat/collections"
	apiKey = "bWK-cL1WKkJF6yyunAhSjhszvkkTTOlM"
	angular.module("learnlocity.api", ["ngResource"])
	.factory("User", ($resource) ->
		User = mongoLabResourceFactory($resource, dbUrl, "user", apiKey)
		User
	).factory("Snippet", ($resource) ->
		Snippet = mongoLabResourceFactory($resource, dbUrl, "snippet", apiKey)
		Snippet
	).factory "Favorite", ($resource) ->
		Favorite = mongoLabResourceFactory($resource, dbUrl, "favorite", apiKey)
		Favorite
)()