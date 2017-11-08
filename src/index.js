window.jQuery = require("jquery");

const myButton = jQuery("button")[0];
myButton.addEventListener("click", function () {
    jQuery("ul").myPlugin();
    // jQuery("ul").myPlugin({cities: ["Ivanovo", "Moscow"]});
    // jQuery("ul").myPlugin({direction: "down"});
});


(function ($) {
    const getDefaultParams = () => ({
        cities: ["Ivanovo", "Moscow", "Los Angeles", "London", "Brooklyn", "Amsterdam", "Narnia"],
        direction: "up"
    });

    let params = getDefaultParams();
    let iniUl;

    const methods = {
        init: function (options) {
            methods.destroy.call(this);

            iniUl = this.html();
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
                        list[obj.li_id].innerHTML += " " + Math.round(response.main.temp) + "&#176;";
                    });

                function send(aTown, aQuery, aParams, callback) {
                    $.get("http://api.openweathermap.org/data/2.5/" + aQuery + "?q=" + encodeURIComponent(aTown) + "&units=metric" + aParams + appId)
                        .done(function (data) {
                            callback(data)
                        })
                        .fail(function (err) {
                            console.log(err.status + ": " + err.statusText);
                            switch (err.status) {
                                case 404:
                                    console.log("The city is not found");
                                    break;
                                case 401:
                                    console.log("The function is paid and therefore temporarily unavailable");
                                    break;
                                default:
                                    console.log("Temporary problems, please try again later");
                            }
                        })
                }
            }

            function initAnimation() {
                const contList = this;
                $(document).ready(function () {
                    if (params.direction === "up") {
                        let animationIsEnd = true;
                        list.on("click", function () {
                            if (animationIsEnd) {
                                animationIsEnd = false;
                                const list = contList.children();
                                const el = $(this);
                                const i = $.inArray(el[0], list);
                                const marg = Math.min(parseInt(el.css("marginBottom")), parseInt(el.css("marginTop")));
                                const dur = 500;

                                list.css("position", "relative");
                                el.animate({"margin-left": "-=" + el.width() / 2 + "px"}, dur, function () {
                                    const delay = dur / i;
                                    for (let k = i - 1, pause = 0; k >= 0; k--, pause += delay) {
                                        $(list[k]).delay(pause).animate({"top": "+=" + (el.outerHeight(true) - marg) + "px"}, delay);
                                    }
                                });
                                el.animate({"top": "-=" + ((el.outerHeight(true) - marg) * i) + "px"}, dur);
                                el.animate({"margin-left": "+=" + el.width() / 2 + "px"}, dur, function () {
                                    list.css({"position": "", "margin-left": "", "top": ""});
                                    el.insertBefore(list[0]);
                                    animationIsEnd = true;
                                });
                            }
                        })

                    }
                    else {
                        let animationIsEnd = true;
                        list.on("click", function () {
                            if (animationIsEnd) {
                                animationIsEnd = false;
                                const el = $(this);
                                const list = contList.children();

                                el.slideUp(function () {
                                    el.insertAfter(list[list.length - 1]).slideDown(function () {
                                        animationIsEnd = true;
                                    });
                                });
                            }
                        });
                    }
                })
            }
        },
        destroy: function () {
            params = getDefaultParams();
            if (iniUl) {
                this.html(iniUl);
            }
        }
    };

    $.fn.myPlugin = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Can't find method name " + method + " for jQuery.myPlugin")
        }
    }
})(jQuery);