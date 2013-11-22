Before attempting to build a computer program, it's important to take some time to think about what you want to achieve, but without worrying about what the code will look like.

Some people call this step design. Others call it modeling. Some call it analysis.

I just call it thinking. Let's start thinking.

# Exercise 1: Write down what you know about Tic Tac Toe

Now let's think about how you play a typical pen and paper game of Tic Tac Toe

## Step 1: Take 3 to 5 minutes and think about the following aspects of a typical pen and paper game of Tic Tac Toe:

* What does the board that you draw look like? How many parts does it have, and what do you call them?
* How many players are in a game, and what symbols do they use?
* Who makes the first move, and what do they do?
* How does play alternate between players?
* When does a game end with a winner? 
* What are the different directions a winner can win with?
* When is a game over, but with a tie? 

## Step 2: Write your thoughts down

* Write down what comes to your mind, in plain English phrases or sentences. You can write on paper, or you can type it into the text box below. **While the mechanics and rules of such a simple game might seem like common sense to you, it's still important that you try this on your own first, because we'll be referring to your notes later when you play on paper, and when you build the game using code.** 
* Once you've done this, then compare your answers to what I came up with below. Your answers may differ. They are probably no worse or better than my own, but if you had any difficulty then my answers can help you.

## Step 3: Compare your thoughts with mine

* A tic tac toe board consists of 3 rows, each row containing 3 empty squares, for a total of 9 squares.
* A game has two players, player X, and player O.
* The first player to play is X, and makes the first move by drawing an X in one of the empty squares.
* After the first move, player O makes a move by drawing an O in one of the empty squares, and then play alternates between the two players.
* When one player has successfully put their letter in 3 contiguous squares, then that player is the winner.
* The squares may be contiguous horizontally, vertically, or diagonally.
* If all 9 squares get filled without either player connecting 3-in-a-row, then the game is a tie, or a "cats game".

# Exercise 2: Play a few games on paper with a friend

Game time!

## Step 1: Play a game with one set of rules

* Pair up with a classmate
* Decide whose notes you will follow first
* Play a game on paper using the rules defined by the notes you just selected
* Play a rematch!

## Step 2: Play a game with another set of rules

* Now, use the other person's notes as rules to play the third game
  * Probably they are the same, but see if you find any slight differences!
* Play another rematch!

## Step 3: Change your respective notes to be **compatible** with each other

You've likely heard the word **compatible** used in a variety of contexts. If not, here's a [simple definition
of compatible from Merriam-Webster dictionary](http://www.merriam-webster.com/dictionary/compatible):

> designed to work with another device or system without modification

These days, one of the most common types of compatibility has to do with cell-phone charging cables. If you or your friends or family members have Apple iPhones or iPads, but you use Android or other kinds of devices, then you know that you cannot use each others' charging cables. That's because the Apple cables are not **compatible** with the others.

**So, if you and your classmate's rules of gameplay are incompatible with each other, then modify them so that they are basically the same and thus *compatible* with each other.**

### Examples of incompatibility

* Most people say X goes first, while others claim O. 
* Well...that's the only one I can think of! Did you find others?

# Exercise 3: Design a version of your game to play on *separate* sheets of paper

It that was easy enough to play on a single sheet of paper, while sitting right next to your opponent, right?

Let's make things more complicated!

## Step 0: Imagine a simple, but useless, two-sheet version

What about playing the game on separate sheets of paper? This would be easy enough if you were just sitting next to each other. Instead of you actually doing this small change (because it will turn out to be pretty useless), let's just imagine a few variations of what that could be like:

* You could simply write your moves down on each other's sheets -- simple enough
* Or, you could each have your own sheet of paper and watch each other draw on your own sheets, and then write the same moves down on your own sheet

Maybe there are other ways, but we're not very interested in those, because ultimately, we want to design the computer game such that you could be sitting at home, and your classmate sitting at home, and you could **still play against each other**. It's no solution at all if you have to run across the neighborhood and draw X's and O's on each other's sheets of paper!
 
## Step 1: With your classmate, figure out a fun and useful two-sheet version!

OK. We said that it would be useless to just sit next to your opponent and draw on each other's sheets of paper, or simply watch and copy. So, it's your turn to figure out a better way, but there are some restrictions!

### The restrictions:

* Each of you will start a game with a blank game board drawn on it.
* You will verbally decide which player goes first.
* You must sit in a way that you cannot see each other's sheet.
* When the first player moves, he or she must communicate the move to his or her opponent without **speaking** and without **moving**.

**One more rule: you may use as many sheets of paper as you like and for whatever purpose you see fit!**





