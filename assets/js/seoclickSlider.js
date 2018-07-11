"use strict";

var SeoClickSlider = function SeoClickSlider(params) {

    var $ = jQuery;

    var slider = new SliderConstructor({
        id: params.id,
        viewed: params.viewed,
        spacerWidth: params.spacerWidth,
        imageWidth: params.imageWidth,
        arrowNav: params.arrowNav,
        dotNav: params.dotNav,
        desc_block: params.desc_block,
        infiniteMode: params.infiniteMode
    });

    function SliderConstructor(arg) {
        this.id = arg.id;
        this.container = null;
        this.containerClass = ".slides-container";
        this.containerWidth = null;
        this.viewWidth = null;
        this.viewHeight = null;
        this.translateData = {
            value: null,
            min: null,
            max: null,
            step: null
        };
        this.slides = {
            object: null,
            count: null,
            viewed: arg.viewed,
            maxWidth: arg.imageWidth,
            maxHeight: null
        };
        this.spacers = {
            count: null,
            width: arg.spacerWidth
        };
        this.responsiveData = {
            desktop: "75rem",
            laptop: "74.938rem",
            tablet: "59.938rem",
            phone: "47.938rem"
        };
        this.options = {
            arrowNav: arg.arrowNav,
            dotNav: arg.dotNav,
            desc_block: arg.desc_block,
            infiniteMode: arg.infiniteMode
        };
    }

    SliderConstructor.prototype.setSlidesData = function () {
        this.slides.object = $(this.id).find(".slide");
        //Размер слайда
        this.slides.object.outerWidth(this.slides.maxWidth);
        this.slides.maxHeight = this.slides.object.outerHeight();
        //Кол. слайдов
        this.slides.count = this.slides.object.length;
    };
    SliderConstructor.prototype.setContainerData = function () {
        this.containerWidth = this.slides.maxWidth * this.slides.count + this.spacers.count * this.spacers.width;
        this.container = $(this.id).find(this.containerClass);
        this.container.width(this.containerWidth);
    };
    SliderConstructor.prototype.setViewData = function () {
        this.viewWidth = this.slides.maxWidth * this.slides.viewed + this.spacers.width * (this.slides.viewed + 1);

        this.viewHeight = this.slides.maxHeight;
        $(this.id).find(".slider-view").outerWidth(this.viewWidth).outerHeight(this.viewHeight);
    };
    SliderConstructor.prototype.setTranslateData = function () {
        this.translateData.min = Math.ceil(-(this.slides.maxWidth * this.slides.viewed + this.spacers.width * (this.slides.viewed - 1)) / 2);
        this.translateData.value = this.translateData.min;
        this.container.css("transform", "translateX(" + this.translateData.value + "px)");
        this.translateData.step = -(this.spacers.width + this.slides.maxWidth);
        this.translateData.max = this.translateData.step * this.spacers.count + this.translateData.min - this.translateData.step * (this.slides.viewed - 1);
    };
    SliderConstructor.prototype.addNav = function () {

        function slideRight() {

            var x = self.translateData.value + self.translateData.step;
            if (x >= self.translateData.max) {
                if (self.options.arrowNav && !self.options.infiniteMode) {
                    if (x === self.translateData.max) {
                        $(self.id).find('.slider-next').addClass("disabled");
                    } else {
                        $(self.id).find('.slider-next').removeClass("disabled");
                        $(self.id).find('.slider-prev').removeClass("disabled");
                    }
                }
                if (self.options.dotNav) {
                    var active_dot = dotnav_container.find(".active").removeClass("active");
                    active_dot.next().addClass("active");
                }
                if (self.options.desc_block) {
                    $.each(self.slides.object, function (index, slide) {
                        "use strict";

                        var translate = $(slide).data("translate_value");
                        if (translate === x) {
                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }
                self.translate = x;
            } else if (self.options.infiniteMode) {
                if (self.options.dotNav) {
                    dotnav_container.find(".active").removeClass("active");
                    dotnav_container.find("span:first-child").addClass("active");
                }
                if (self.options.desc_block) {
                    $.each(self.slides.object, function (index, slide) {
                        "use strict";

                        var translate = $(slide).data("translate_value");
                        if (translate === self.translateData.min) {
                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }
                self.translate = self.translateData.min;
            }
        }

        function slideLeft() {

            var x = self.translateData.value - self.translateData.step;
            if (x <= self.translateData.min) {
                if (self.options.arrowNav && !self.options.infiniteMode) {
                    if (x === self.translateData.min) {
                        $(self.id).find('.slider-prev').addClass("disabled");
                    } else {
                        $(self.id).find('.slider-next').removeClass("disabled");
                        $(self.id).find('.slider-prev').removeClass("disabled");
                    }
                }
                if (self.options.dotNav) {
                    var active_dot = dotnav_container.find(".active").removeClass("active");
                    active_dot.prev().addClass("active");
                }
                if (self.options.desc_block) {
                    $.each(self.slides.object, function (index, slide) {
                        "use strict";

                        var translate = $(slide).data("translate_value");
                        if (translate === x) {
                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }

                self.translate = x;
            } else if (self.options.infiniteMode) {
                if (self.options.dotNav) {
                    dotnav_container.find(".active").removeClass("active");
                    dotnav_container.find("span:last-child").addClass("active");
                }
                if (self.options.desc_block) {
                    $.each(self.slides.object, function (index, slide) {
                        "use strict";

                        var translate = $(slide).data("translate_value");
                        if (translate === self.translateData.max) {
                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }
                self.translate = self.translateData.max;
            }
        }

        function addArrowNav() {
            "use strict";

            var extraClass = '';
            if (!self.options.infiniteMode) extraClass = 'disabled';
            var markup = "<div class=\"arrow-nav\">\n                            <div class=\"slider-next\">\n                                <i class=\"fa fa-chevron-right fa-4x\" aria-hidden=\"true\"></i>\n                            </div>\n                            <div class=\"slider-prev " + extraClass + "\">\n                                <i class=\"fa fa-chevron-left fa-4x\" aria-hidden=\"true\"></i>\n                            </div>\n                          </div>";
            /*let markup = "<div class=\"arrow-nav\">\n" +
                "            <div class=\"slider-next\">\n" +
                "                <i class=\"fa fa-chevron-right fa-4x\" aria-hidden=\"true\"></i>\n" +
                "            </div>\n" +
                "            <div class=\"slider-prev\">\n" +
                "                <i class=\"fa fa-chevron-left fa-4x\" aria-hidden=\"true\"></i>\n" +
                "            </div>\n" +
                "        </div>";*/

            $(self.id).append(markup);
            $(self.id).find(".arrow-nav > div i").click(function () {

                if ($(this).parent().hasClass("slider-next")) {
                    slideRight();
                } else {
                    slideLeft();
                }
            });
        }

        function addDotNav() {
            "use strict";

            var translate_value = self.translateData.min;
            $(self.id).append(dotnav_container);

            $.each(self.slides.object, function (index) {

                "use strict";

                var dot_element = $("<span class='slideControl'></span>");

                if (index === 0) {
                    dot_element.addClass("active");
                }

                dot_element.data("translate_value", translate_value);
                if (self.options.desc_block) dot_element.data("desc_number", index);

                dot_element.click(function () {

                    if ($(this).hasClass("active")) return 0;
                    dotnav_container.find(".slideControl").removeClass("active");
                    $(this).addClass("active");

                    if (self.options.desc_block) activateSlideDesc($(this).data("desc_number"));

                    self.translate = $(this).data("translate_value");
                });

                dotnav_container.append(dot_element);
                translate_value += self.translateData.step;
            });
        }

        function addSlidesDescData() {
            "use strict";

            var translate_value = self.translateData.min;
            $.each(self.slides.object, function (index, slide) {

                $(slide).data("translate_value", translate_value);
                $(slide).data("number", index);

                translate_value += self.translateData.step;
            });
        }

        function activateSlideDesc(number) {
            "use strict";

            var descClass = '.slide-' + number;
            $(self.id).find(".slide-description.active").removeClass("active");
            $(descClass).parent().css('min-height', $(descClass).outerHeight(true));
            window.setTimeout(function () {
                $(descClass).addClass('active');
            }, 250);
        }

        var self = this,
            id = this.id.slice(1),
            mc = new Hammer(document.getElementById(id)),
            dotnav_container = $("<div class='dot-nav'></div>");

        if (self.options.arrowNav) addArrowNav();
        if (self.options.dotNav) addDotNav();
        if (self.options.desc_block) addSlidesDescData();

        mc.on("swipeleft", slideRight);
        mc.on("swiperight", slideLeft);
    };
    SliderConstructor.prototype._initListeners = function () {
        var self = this,
            desktop = window.matchMedia("(min-width: " + self.responsiveData.desktop + ")"),
            laptop = window.matchMedia("(max-width: " + self.responsiveData.laptop + ")"),
            tablet = window.matchMedia("(max-width: " + self.responsiveData.tablet + ")"),
            phone = window.matchMedia("(max-width: " + self.responsiveData.phone + ")");

        var sliderResizer = function sliderResizer() {
            var sliderWidth = $(self.id).width(),
                calcWidth = void 0,
                initWidth = $(self.id).data("initWidth");

            calcWidth = Math.round((sliderWidth - self.spacers.width * (self.slides.viewed + 1)) / self.slides.viewed);

            if (sliderWidth < self.viewWidth || calcWidth <= initWidth) {
                self.updateSlidesSize(calcWidth);
            } else if (self.slides.maxWidth !== initWidth) {
                self.updateSlidesSize(initWidth);
            }
        },
            checkDesktopQuery = function checkDesktopQuery(e) {
            if (e.matches) {
                console.log("desktop");
                self.updateViewData($(self.id).data("viewed"));
            }
        },
            checkLaptopQuery = function checkLaptopQuery(e) {
            console.log("laptop");
            if (e.matches) {
                if (self.slides.viewed > 3) {
                    self.updateViewData(3);
                }
            } else {
                if (self.slides.viewed < $(self.id).data("viewed")) {
                    self.updateViewData($(self.id).data("viewed"));
                }
            }
        },
            checkTabletQuery = function checkTabletQuery(e) {
            console.log("tablet");
            if (e.matches) {
                if (self.slides.viewed > 2) {
                    self.updateViewData(2);
                }
            } else {
                if (self.slides.viewed < $(self.id).data("viewed")) {
                    self.updateViewData(3);
                }
            }
        },
            checkPhoneQuery = function checkPhoneQuery(e) {
            console.log("phone");
            if (e.matches) {
                if (self.slides.viewed > 1) {
                    self.updateViewData(1);
                }
            } else {
                if (self.slides.viewed < $(self.id).data("viewed")) {
                    self.updateViewData(2);
                }
            }
        };

        if (phone.matches) {
            if (self.slides.viewed > 1) {
                self.updateViewData(1);
            }
        }
        if (tablet.matches) {
            if (self.slides.viewed > 2) {
                self.updateViewData(2);
            }
        }
        if (laptop.matches) {
            if (self.slides.viewed > 3) {
                self.updateViewData(3);
            }
        }
        if (desktop.matches) {
            self.updateViewData($(self.id).data("viewed"));
        }

        phone.addListener(checkPhoneQuery);
        tablet.addListener(checkTabletQuery);
        laptop.addListener(checkLaptopQuery);
        desktop.addListener(checkDesktopQuery);

        sliderResizer();
        $(window).resize(sliderResizer);
    };

    Object.defineProperty(SliderConstructor.prototype, "translate", {
        set: function set(value) {
            this.translateData.value = value;
            anime({
                targets: this.id + " " + this.containerClass,
                translateX: value,
                easing: "easeInOutQuart",
                duration: 500
            });
        }
    });

    //Полная инициализация слайдера
    SliderConstructor.prototype.initializeSlider = function () {

        $(this.id).data("viewed", this.slides.viewed);
        $(this.id).data("initWidth", this.slides.maxWidth);

        //Данные слайдов
        this.setSlidesData();
        //Кол. промежутков
        this.spacers.count = this.slides.count - 1;
        //Данные контейнера
        this.setContainerData();
        //Данные области отображения
        this.setViewData();
        //Данные смещение контейнера
        this.setTranslateData();
        //Навигация
        this.addNav();

        this._initListeners();
    };
    //Изменение количества отображаемых слайдов
    SliderConstructor.prototype.updateViewData = function (viewed) {
        this.slides.viewed = viewed;

        this.setViewData();
        this.setTranslateData();
    };
    //Изменение размера слайдов
    SliderConstructor.prototype.updateSlidesSize = function (width) {

        this.slides.maxWidth = width;

        //Данные слайдов
        this.setSlidesData();
        //Кол. промежутков
        this.spacers.count = this.slides.count - 1;
        //Данные контейнера
        this.setContainerData();
        //Данные области отображения
        this.setViewData();
        //Данные смещение контейнера
        this.setTranslateData();
    };

    slider.initializeSlider();
};
//# sourceMappingURL=seoclickSlider.js.map