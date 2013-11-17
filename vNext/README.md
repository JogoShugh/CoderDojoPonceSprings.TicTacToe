# vNext of Tic-Tac-Toe, with multiplayer support, multi-game support, and history, stats, etc. Blueskies ahead.

This is a work-in-progress, and is being developed by students and mentors from http://www.meetup.com/CoderDojoPonceSprings.

You can see the current work in action at http://jogoshugh.github.io/CoderDojoPonceSprings.TicTacToe/vNext/index.html

Just be warned that it's always changing and is likely to have bugs :) We welcome bug reports and test cases!

# Contributing 

To contribute, you first need to set up your local development environment. 

## Windows

If you're running windows, do this:

* Open a Windows Command prompt, `cmd.exe`, **As Administrator**.
* Create a directory for this project by typing `md C:\Projects` and hitting `Enter`.
* Type `cd C:\Projects` and hit `Enter`.
* Now type `dev_setup\win\01_install_chocolatey.bat` to install the Chocolatey package manager for Windows.
* After Chocolatey installs, you have to start a **brand new** Windows Command prompt and then type `cd C:\Projects` to get back into the directory you just created. This is because Chocolatey is now in your system PATH, so you can easily run it.
* Now type `dev_setup\win\02_install_dev_tols.bat` to install Git and Node.js -- two tools needed to work on this project.
* Now, from your Windows Start Menu, look for `Git Bash` and run it. This is a different kind of command prompt that is more powerful and more standard than the Windows Command prompt.
* Navigate to the Projects directory by typing `cd /c/Projects`.

## Mac

TODO: We'd love help if someone can document how to get started on Mac.

## Linux

TODO: See Mac above.

## After OS-specific steps above

Once you have your operating-system specific setup completed, the steps become essentially the same.

* Assuming you are in the `Projects` directory, then:
* Type `git clone https://github.com/JogoShugh/CoderDojoPonceSprings.TicTacToe.git`.
  * This clones, or copies, the source code from GitHub.com into a directory called `CoderDojoPonceSprings.TicTacToe`.
* Once the code is clonsed, start typing `cd Coder` but then hit the `Tab` key on your keyboard. This should automatically complete the directory name for you. Then just hit enter!
* Now, for the fun stuff.
* Type `cd vNext` to get into the directory where the game code is.
* Type `cat 01_install_globals.sh`. 

This should produce something like this:

```text
jgough@JGOUGH /c/Projects/CoderDojoPonceSprings.TicTacToe/vNext (master)
$ cat 01_install_globals.sh
#!/bin/bash
npm i -g nws
npm i -g mocha

```

The `cat` command simply [catenates](http://www.merriam-webster.com/dictionary/catenate) the lines from the file name you give it out to the screen so you can see what's inside the file. That's all.

* Type `./01_install_globals.sh` now to **execute** the same file to run the commands inside of it.

If this works, you should start to see output like this:

```text
jgough@JGOUGH /c/Projects/github/CoderDojoPonceSprings.TicTacToe/vNext (master)
$ ./01_install_globals.sh
npm http GET https://registry.npmjs.org/nws
npm http 304 https://registry.npmjs.org/nws
npm http GET https://registry.npmjs.org/optimist/0.3.1
npm http GET https://registry.npmjs.org/connect
npm http GET https://registry.npmjs.org/open/0.0.4
...

```

**Note:** You might see some errors or warnings, but that will probably be OK as long as most things worked. We just 
ran a **shell script** that executed two calls to the `npm` program, which is the Node Package Manager, a tool used
to download JavaScript **code libraries** from the internet that you can build your programs with.

* Now type `npm install`. Again, you should see something similar to above.
* Finally, to verify whether everything worked, type `nws &`

If everything worked, you should see a message similar to this:

```text
$ Listening on port 3030 with root:
        c:\Projects\CoderDojoPonceSprings.TicTacToe\vNext
```

If you got that, now try to browse to link: [http://localhost:3030/index.html](http://localhost:3030/index.html)

If it comes up, then **congratulations** you are now hosting your own game server and you can play against others!

# Getting help

If the installation didn't work, please submit an Issue in our GitHub issues and include the steps to reproduce any errors you saw, and also copy and paste any error messages into the issue.
