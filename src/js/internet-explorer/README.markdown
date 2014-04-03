Requirements for building:

- open FiveUI.csproj
- Run Visual Studio as Administrator
- private / public keys: .snk, .suo, .sln
- RC.exe is in Windows SDK - need special PATH setting
    * Can find it using developer console app
- run make, copy over build/firefox/data

Copying scripts into place:

    src/js/fiveui/**/*                     -> src/js/internet-explorer/FiveUI/data/
    src/js/lib/**/*                        -> src/js/internet-explorer/FiveUI/data/
    src/js/internet-explorer/injected/**/* -> src/js/internet-explorer/FiveUI/data/injected/

Other required files:

- bundled.css
- tabIds.js
- main.js
