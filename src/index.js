window.jQuery = require("jquery");

const myButton = jQuery("button")[0];
myButton.addEventListener("click", function () {
    jQuery("ul").myPlugin({direction:"down"});
});


(function ($) {
    let params = {
        cities: ["Ivanovo", "Moscow", "Los Angeles", "London", "Brooklyn", "Amsterdam", "Narnia"],
        direction: "up"
    };

    const methods = {
        init: function (options) {
            $.extend(params, options);

            let list = this.children();

            getWeather();
            jQuery.proxy(initAnimation, this)();

            function getWeather() {
                const search = () => {
                    for (let i = 0; i < list.length; i++)
                        for (let k = 0; k < params.cities.length; k++) {
                            if (list[i].innerHTML.indexOf(params.cities[k]) !== -1)
                                return {
                                    city_id: k,
                                    li_id: i
                                };
                        }
                    return false;
                };

                const appId = "&APPID=97576b3b2b2568b4461029ef47e84865";
                let query = "weather";
                let qParams = "";

                const obj = search();
                if (obj)
                    send(params.cities[obj.city_id], query, qParams, function (response) {
                        console.log(response);
                        list[obj.li_id].innerHTML += " " + Math.round(response.main.temp) + "&#176;";
                    });

                function send(aTown, aQuery, aParams, callback) {
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", "http://api.openweathermap.org/data/2.5/" + aQuery + "?q=" + encodeURIComponent(aTown) + "&units=metric" + aParams + appId);

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState !== 4) return;

                        console.log("Done!");

                        if (xhr.status !== 200) {
                            console.log(xhr.status + ": " + xhr.statusText);
                            if (xhr.status === 404) {
                                console.log("The city is not found");
                            }
                            else {
                                if (xhr.status === 401) console.log("The function is paid and therefore temporarily unavailable");
                                else console.log("Temporary problems, please try again later");
                            }

                        } else {
                            callback(JSON.parse(xhr.responseText));
                        }
                    };

                    xhr.timeout = 60000;
                    xhr.ontimeout = function () {
                        console.log('Извините, запрос превысил максимальное время');
                    };

                    xhr.send();
                }
            }

            function initAnimation() {
                const contlisst = this;
                $(document).ready(function () {
                    list.on("click", function () {
                        let list = contlisst.children();
                        params.direction === "up" ? $(this).insertBefore(list[0]) : $(this).insertAfter(list[list.length-1]);

                        // console.log(list);
                        $(this).css("background-color", "green");
                    })
                })
            }
        }
    };

    $.fn.myPlugin = function (method) {
        if (methods[method]) {
            return methods[methods].apply(this, Array.protype.slise.call(arguments, 1));

        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Can't find method name " + method + " for jQuery.myPlugin")
        }
    }
})(jQuery);