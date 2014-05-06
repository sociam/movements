/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// basic promise queue
var functionLock = false;
var promiseQueue = [];

var nextPromise = function(recursive) {
    if (!functionLock || recursive){
        functionLock = true;
        if (promiseQueue.length > 0){
            var promise = new Promise(promiseQueue.pop());
            promise.then(function(){ nextPromise(true); });
        } else {
            functionLock = false;
        }
    }
};

var lockingFunction = function(func) {
    promiseQueue.push(func);
    nextPromise(false);
};

var saveLocation = function(loc){
    lockingFunction(function(resolve, reject){
        // get the existing locations if they exist
        localforage.getItem("indx-locations", function(locs){
            if (locs === null){
                locs = [];
            }
            console.log("There were " + locs.length + " existing locations saved.");
            locs.push(loc);
            localforage.setItem("indx-locations", locs, function(){
                console.log("New value of length " + locs.length + " saved.");
                resolve(1);
            });
        });
    });
};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready'); // updates DOM view

        console.log("Enabling background mode");
        window.plugin.backgroundMode.enable();

        console.log("Enabling geolocation watching");

        var trackTime = 1000 * 60 * 1; // at least every 1 minute, unless they move
        var geolocationOptions = { maximumAge: trackTime, enableHighAccuracy: false };

        var geolocationSuccess = function(position) {
            console.log('Latitude: '          + position.coords.latitude          + '\n' +
                        'Longitude: '         + position.coords.longitude         + '\n' +
                        'Altitude: '          + position.coords.altitude          + '\n' +
                        'Accuracy: '          + position.coords.accuracy          + '\n' +
                        'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                        'Heading: '           + position.coords.heading           + '\n' +
                        'Speed: '             + position.coords.speed             + '\n' +
                        'Timestamp: '         + position.timestamp                + '\n');

            var loc = {"timestamp": position.timestamp,
                        "position": {"latitude": position.coords.latitude,
                                     "longitude": position.coords.longitude,
                                     "altitude": position.coords.altitude,
                                     "accuracy": position.coords.accuracy,
                                     "altitude-accuracy": position.coords.altitudeAccuracy,
                                     "heading": position.coords.heading,
                                     "speed": position.coords.speed
                                    }
                       };

            saveLocation(loc);
        };

        // onError Callback receives a PositionError object
        //
        var geolocationError = function onError(error) {
            console.log('Geolocation Error with code: '    + error.code    + '\n' +
                        'message: ' + error.message + '\n');
        }

        // watches for location changes
        var watchId = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, geolocationOptions);

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
