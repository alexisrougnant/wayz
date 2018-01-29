//(function (window) {
// You can enable the strict mode commenting the following line  
'use strict';

function Abilia() {
    var _myAbilia = {};

    // This variable will be inaccessible to the user
    var credentials = {
        email: null,
        token: null
    };

    var mediaLibraryWindow = {
        features: "location=0,height=570,width=820,scrollbars=yes,status=yes,addressbar=no",
        url: "http://abilia.org/library/index.html",
        self: null,
        target: null,
        returnQuantity: "one",
        closed: null,
        resourceType: "ANY"
    }

    var api_url = "http://abilia.org/api/";

    var notification = {
        error_alerts: false,
        error_popups: true,
        error_console: true,
        success_alerts: false,
        success_popups: true,
        success_console: true
    }

    _myAbilia.setCredentials = function (email, token) {
        credentials.email = email;
        credentials.token = token;
        return true;
    };

    _myAbilia.setNotification = function (notification) {
        notification.error_alerts = notification.error_alerts || false;
        notification.error_popus = notification.error_popus || false;
        notification.error_console = notification.error_console || false;
        notification.success_alerts = notification.success_alerts || false;
        notification.success_popups = notification.success_popups || false;
        notification.success_console = notification.success_console || false;
        return true;
    };


    _myAbilia.setApiUrl = function (url) {
        api_url = url;
        return true;
    };

    _myAbilia.MediaLibrary = function (callbackReturnedItem, returnQuantity, callbackClosed, resourceType) {
        if (callbackReturnedItem === undefined) {
            _myAbilia.Notify("error", String(element) + " does not exist in the current context");
        } else {
            mediaLibraryWindow.target = callbackReturnedItem;

            mediaLibraryWindow.returnQuantity = returnQuantity;

            if (resourceType !== undefined) {
                mediaLibraryWindow.resourceType = resourceType;
            }

            var url = mediaLibraryWindow.url + "?rt=" + mediaLibraryWindow.resourceType;
            mediaLibraryWindow.self = window.open(url, "_blank", mediaLibraryWindow.features);
            if (callbackClosed !== undefined) {
                mediaLibraryWindow.closed = callbackClosed;
                mediaLibraryWindow.self.onbeforeunload = function () {
                    mediaLibraryWindow.closed();
                }
            }
        }

    }
    _myAbilia.MediaLibraryReturnValue = function (val) {
        if (mediaLibraryWindow.returnQuantity == "one") {
            mediaLibraryWindow.self.close();
        }
        console.log(mediaLibraryWindow.target);
        console.log(val);
        mediaLibraryWindow.target(val);
        event.preventDefault();
        return val;
    };


    _myAbilia.query = function (request, data, successCallback, errorCallback) {

        checkRequest(request);
        data = checkData(data);

        var payload = {
            "request": request,
            "email": credentials.email,
            "token": credentials.token,
            "data": data
        };

        $.ajax({
            url: api_url,
            type: "POST",
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {
                if (typeof successCallback === 'undefined') {
                    return response;
                } else {
                    if (response.status == "success") {
                        successCallback(response);
                    } else {
                        if (typeof errorCallback !== 'undefined') {
                            errorCallback(request);
                        } else {
                            return response;
                        }
                    }

                }
            },
            error: function (request, error) {
                if (typeof errorCallback === 'undefined')
                    return request;
                else
                    errorCallback(request, error);
            }
        });

    };


    _myAbilia.Notify = function (type, content) {
        if (type == "error") {
            if (notification.error_console) console.error(content);
            if (notification.error_alerts) alert(content);
            if (notification.error_popups) _myAbilia.NotifyPopup(type, content);
            throw new Error(content);
        } else if (type == "success") {
            if (notification.success_console) console.log(content);
            if (notification.success_alerts) alert(content);
            if (notification.success_popups) _myAbilia.NotifyPopup(type, content);
        }

    }

    _myAbilia.NotifyPopup = function (title, body, icon) {
        if (window.isNotificationEnabled) {
            if (Notification.permission !== "granted")
                Notification.requestPermission();
            else {
                var notification = new Notification(title, {
                    icon: icon,
                    body: body,
                });

                notification.onclick = function () {
                    //window.open("url");
                };

            }
        }

    }

    function checkLocation() {
        //not valid
        /*
        var string = window.location.origin;
        if (string.indexOf("abilia") == -1){
            alert('You cannot use this API from you server, you should include it in this way: <script type="application/javascript" src="http://abilia.org/api/platform/javascript/abilia.js"></script>');
        }*/
    };

    function checkData(data) {

        try {
            if (JSON.parse(data)) {
                return JSON.parse(data);
            } else if (JSON.stringify(data)) {
                return data;
            } else {
                _myAbilia.Notify("error", "invalid data");
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    function checkRequest(request) {
        if (typeof request === 'undefined' || request == null || request == "") {
            _myAbilia.Notify("error", "invalid request");
        }
    }


    return _myAbilia;
}


// We need that our library is globally accesible, then we save in the window
/*if (typeof (window.abilia) === 'undefined') {
    window.abilia = Abilia();
}*/
//})(window); // We send the window variable withing our function

document.addEventListener('DOMContentLoaded', function () {
    window.isNotificationEnabled = true;
    if (!Notification) {
        window.isNotificationEnabled = false;
        return;
    }

    if (Notification.permission !== "granted") Notification.requestPermission();
});