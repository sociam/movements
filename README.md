### Movements Cordova Application

`movements` is the cordova directory

To set up and simulate the app, you can do the following to:

(You might have to first do: `sudo npm install -g ios-sim`)

    cd movements
    ./init.sh
    cordova platform add ios
    cordova build
    cordova emulate ios

