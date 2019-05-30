"use strict";

//TODO сейчас высоту слайдов расчитывает по первому изображению в слайде. При использовании иходного изображения с разными размерами происходит их растяжка с нарушением пропорций. Попробовать исправить.
//TODO попробовать сделать оптимизацию вызовов функций
var SeoClickSlider = function SeoClickSlider(params) {

    var $ = jQuery;

    var slider = new SliderConstructor({
        id: params.id,
        viewed: params.viewed,
        spacerMinWidth: params.spacerMinWidth,
        imageWidth: params.imageWidth,
        imageHeight: params.imageHeight,
        slideWidth: params.slideWidth,
        arrowNav: params.arrowNav,
        dotNav: params.dotNav,
        arrowsMarkup: params.arrowsMarkup,
        desc_block: params.desc_block,
        infiniteMode: params.infiniteMode,
        autoScroll: params.autoScroll,
        animation_speed: params.animation_speed,
        lazy_load: params.lazy_load,
        responsiveData: params.responsiveData,
        phone: params.phone,
        debug: params.debug
    });

    function SliderConstructor(arg) {
        this.id = arg.id;
        this.state = null;
        this.container = null;
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
            viewed: +arg.viewed,
            imageWidth: parseInt(arg.imageWidth, 10),
            imageHeight: parseInt(arg.imageHeight, 10),
            imageRatio: null,
            maxWidth: parseInt(arg.slideWidth, 10),
            maxHeight: null
        };
        this.spacers = {
            count: null,
            width: null,
            min_width: parseInt(arg.spacerMinWidth, 10)
        };
        this.responsiveData = {
            desktop: arg.responsiveData.desktop,
            laptop: arg.responsiveData.laptop,
            tablet: arg.responsiveData.tablet,
            phone: arg.responsiveData.phone
        };
        this.options = {
            arrowNav: arg.arrowNav,
            dotNav: arg.dotNav,
            arrowsMarkup: arg.arrowsMarkup,
            desc_block: arg.desc_block,
            infiniteMode: arg.infiniteMode,
            autoScroll: {
                handle: null,
                counter: 0,
                active: arg.autoScroll.active,
                interval: parseInt(arg.autoScroll.interval, 10),
                animation_speed: parseInt(arg.autoScroll.animation_speed, 10)
            },
            lazy_load: arg.lazy_load,
            debug: arg.debug
        };
    }

    SliderConstructor.prototype.setSlidesData = function () {

        if (this.options.debug) console.log("Call setSlidesData");

        this.slides.object = $(this.id).find(".slide");
        //Кол. слайдов
        this.slides.count = this.slides.object.length;

        //Размер изображений
        if (this.slides.object.find('.image img').length && (!this.slides.imageWidth || !this.slides.imageHeight)) {

            if (this.options.debug) console.log("setSlidesData call getImagesSizes()");

            this.getImagesSizes();
            return 0;
        }

        this.slides.object.find('.image img').outerWidth(this.slides.imageWidth);
        this.slides.object.find('.image img').outerHeight(this.slides.imageHeight);

        if (this.slides.maxWidth === null) {
            this.slides.maxWidth = this.slides.object.outerWidth();
        }
        this.slides.object.css("height", '');
        this.slides.object.outerWidth(this.slides.maxWidth);

        this.slides.maxHeight = this.slides.object.outerHeight();

        if (this.options.debug) console.log("setSlidesData call calculateSlideHeight()");

        this.calculateSlideHeight();
    };
    SliderConstructor.prototype.setViewData = function () {

        if (this.options.debug) console.log("Call setViewData");

        var sliderView = $(this.id).find(".slider-view");

        sliderView.css("width", '');

        if (this.slides.viewed === 1) {
            this.viewWidth = this.slides.maxWidth;
        } else {
            this.viewWidth = sliderView.width();
        }

        this.viewHeight = this.slides.maxHeight;
        sliderView.width(this.viewWidth).outerHeight(this.viewHeight);
    };
    SliderConstructor.prototype.calculateSlidesSpacers = function () {

        if (this.options.debug) console.log("Call calculateSlidesSpacers");

        if (this.slides.viewed !== 1) {
            this.spacers.width = (this.viewWidth - this.slides.maxWidth * this.slides.viewed) / (this.slides.viewed - 1);
            this.spacers.count = this.slides.count - 1;
            if (this.spacers.width < this.spacers.min_width) {

                this.spacers.width = this.spacers.min_width;
                this.slides.maxWidth = this.slides.maxWidth - this.spacers.min_width / this.slides.viewed * (this.slides.viewed - 1);
                if (this.slides.imageWidth > this.slides.maxWidth) {
                    this.slides.imageWidth = this.slides.maxWidth;
                    this.slides.imageHeight = this.slides.imageWidth / this.slides.imageRatio;
                }

                if (this.options.debug) console.log("calculateSlidesSpacers call setSlidesData()");

                this.setSlidesData();
            }
        } else {
            this.spacers.width = 0;
            this.spacers.count = 0;
        }
    };
    SliderConstructor.prototype.setContainerData = function () {
        var _this = this;

        if (this.options.debug) console.log("Call setContainerData");

        this.containerWidth = this.slides.maxWidth * this.slides.count + this.spacers.count * this.spacers.width;
        this.container = $(this.id).find(".slides-container");
        this.container.width(this.containerWidth);
        $.each(this.slides.object, function (index, slide) {
            if (index !== _this.slides.count - 1) {
                $(slide).css("margin-right", _this.spacers.width);
            }
        });
    };
    SliderConstructor.prototype.setTranslateData = function () {

        if (this.options.debug) console.log("Call setTranslateData");

        this.translateData.min = 0;
        this.translateData.value = this.translateData.min;
        this.container.css("transform", "translateX(" + this.translateData.value + "px)");
        if (this.slides.viewed === 1) {
            this.translateData.step = this.viewWidth;
        } else {
            this.translateData.step = this.viewWidth + this.spacers.width;
        }
        this.translateData.max = (Math.ceil(this.slides.count / this.slides.viewed) - 1) * this.translateData.step;
    };
    SliderConstructor.prototype._initListeners = function () {
        var _this2 = this;

        if (this.options.debug) console.log("Call _initListeners");

        if (this.options.debug) console.log("_initListeners call addViewportListeners()");

        this.addViewportListeners();

        if (this.options.lazy_load && 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

            if (this.options.debug) console.log("_initListeners call addIntersectionObserver()");

            this.addIntersectionObserver();
        } else if (this.options.lazy_load) {
            var images = $(this.id).find('.slide img');

            $.each(images, function (index, image) {
                _this2.lazyloadImage(image);
            });
        }

        if (this.options.debug) console.log("_initListeners call sliderResizer()");

        this.sliderResizer();
        $(window).on('load resize', function () {

            if (_this2.options.debug) console.log("_initListeners window load or resize call sliderResizer()");
            _this2.sliderResizer();
        });
    };
    SliderConstructor.prototype.addNav = function () {
        var _this3 = this;

        if (this.options.debug) console.log("Call addNav");

        function moveSlidesLeft() {

            if (self.state !== null) return 0;

            if (self.options.debug) console.log("Call moveSlidesLeft()");

            self.state = 'animated';

            var x = self.translateData.value + self.translateData.step,
                dotnav_container = $(self.id).find(".dot-nav");

            if (x <= self.translateData.max) {
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

                            if (self.options.debug) console.log("moveSlidesLeft call activateSlideDesc(" + $(slide).data("number") + ")");

                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }

                if (self.options.debug) console.log("moveSlidesLeft call translate(" + x + ")");

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

                            if (self.options.debug) console.log("moveSlidesLeft call activateSlideDesc(" + $(slide).data("number") + ")");

                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }

                if (self.options.debug) console.log("moveSlidesLeft call translate(" + self.translateData.min + ")");

                self.translate = self.translateData.min;
            }
        }

        function moveSlidesRight() {

            if (self.state !== null) return 0;

            if (self.options.debug) console.log("Call moveSlidesRight");

            self.state = 'animated';

            var x = self.translateData.value - self.translateData.step,
                dotnav_container = $(self.id).find(".dot-nav");

            if (x >= self.translateData.min) {
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

                            if (self.options.debug) console.log("moveSlidesRight call activateSlideDesc(" + $(slide).data("number") + ")");

                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }

                if (self.options.debug) console.log("moveSlidesRight call translate(" + x + ")");

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

                            if (self.options.debug) console.log("moveSlidesRight call activateSlideDesc(" + $(slide).data("number") + ")");

                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }

                if (self.options.debug) console.log("moveSlidesRight call translate(" + self.translateData.max + ")");

                self.translate = self.translateData.max;
            }
        }

        function addArrowNav() {
            "use strict";

            if (self.options.debug) console.log("Call addArrowNav()");

            var extraClass = '',
                markup = void 0;

            if (!self.options.infiniteMode) extraClass = 'disabled';

            if (!self.options.arrowsMarkup) {
                markup = "<div class=\"arrow-nav\">\n                            <div class=\"slider-prev " + extraClass + "\">\n                                <i class=\"fa fa-angle-left fa-4x\" aria-hidden=\"true\"></i>\n                            </div>\n                            <div class=\"slider-next\">\n                                <i class=\"fa fa-angle-right fa-4x\" aria-hidden=\"true\"></i>\n                            </div>\n                          </div>";
            } else {
                markup = "<div class=\"arrow-nav\">\n                            <div class=\"slider-prev " + extraClass + "\">\n                                " + self.options.arrowsMarkup.left + "\n                            </div>\n                            <div class=\"slider-next\">\n                                " + self.options.arrowsMarkup.right + "\n                            </div>\n                          </div>";
            }

            $(self.id).append(markup);
            $(self.id).find(".arrow-nav > div").click(function () {

                if ($(this).hasClass("slider-next")) {

                    if (self.options.debug) console.log("arrowNav call moveSlidesLeft");

                    moveSlidesLeft();
                } else {

                    if (self.options.debug) console.log("arrowNav call moveSlidesRight");

                    moveSlidesRight();
                }
            });
        }

        function addDotNav() {
            "use strict";

            if (self.options.debug) console.log("Call addDotNav()");

            var translate_value = self.translateData.min;
            $(self.id).append(dotnav_container);

            $.each(self.slides.object, function (index) {

                if (translate_value > self.translateData.max) return 1;

                var dot_element = $("<span class='slideControl'></span>");

                if (index === 0) {
                    dot_element.addClass("active");
                }

                dot_element.data("translate_value", translate_value);
                if (self.options.desc_block) dot_element.data("desc_number", index);

                dot_element.click(function () {

                    if ($(this).hasClass("active")) return 0;

                    if (self.state !== null) return 0;
                    self.state = 'animated';

                    dotnav_container.find(".slideControl").removeClass("active");
                    $(this).addClass("active");

                    if (self.options.desc_block) activateSlideDesc($(this).data("desc_number"));

                    if (self.options.debug) console.log("dotNav call translate(" + $(this).data("translate_value") + ")");

                    self.translate = $(this).data("translate_value");
                });

                dotnav_container.append(dot_element);
                translate_value += self.translateData.step;
            });
        }

        function addSlidesDescData() {
            "use strict";

            if (self.options.debug) console.log("Call addSlidesDescData()");

            var translate_value = self.translateData.min;
            $.each(self.slides.object, function (index, slide) {

                $(slide).data("translate_value", translate_value);
                $(slide).data("number", index);

                translate_value += self.translateData.step;
            });
        }

        function activateSlideDesc(number) {
            "use strict";

            if (self.options.debug) console.log("Call activateSlideDesc(" + number + ")");

            var descClass = '.slide-' + number;
            $(self.id).find(".slide-description.active").removeClass("active");
            $(descClass).parent().css('min-height', $(descClass).outerHeight(true));
            window.setTimeout(function () {
                $(descClass).addClass('active');
            }, 250);
        }

        var id = this.id.slice(1),
            self = this,
            mc = new Hammer(document.getElementById(id)),
            dotnav_container = $("<div class='dot-nav'></div>");

        if (this.slides.count === this.slides.viewed) return 0;

        if (this.options.arrowNav) {
            if (this.options.debug) console.log("addNav call addArrowNav()");

            addArrowNav();
        }
        if (this.options.dotNav) {

            if (this.options.debug) console.log("addNav call addDotNav()");

            addDotNav();
        }
        if (this.options.desc_block) {

            if (this.options.debug) console.log("addNav call addSlidesDescData()");

            addSlidesDescData();
        }
        if (this.options.autoScroll.active) {

            if (this.options.autoScroll.handle) window.clearInterval(this.options.autoScroll.handle);

            var isPaused = false;

            this.options.autoScroll.handle = window.setInterval(function () {
                if (!isPaused) _this3.options.autoScroll.counter++;
                if (_this3.options.autoScroll.counter === _this3.options.autoScroll.interval) {

                    if (_this3.options.debug) console.log("addNav window.setInterval call moveSlidesLeft()");

                    moveSlidesLeft();
                    _this3.options.autoScroll.counter = null;
                }
            }, 1000);

            $(this.id).mouseenter(function () {
                return isPaused = true;
            });
            $(this.id).mouseleave(function () {
                return isPaused = false;
            });
        }

        mc.on("swipeleft", function () {

            if (_this3.options.debug) console.log("addNav swipeleft call moveSlidesLeft()");

            moveSlidesLeft();
        });
        mc.on("swiperight", function () {

            if (_this3.options.debug) console.log("addNav swiperight call moveSlidesRight()");

            moveSlidesRight();
        });
    };

    //Устанавливает параметр translate
    Object.defineProperty(SliderConstructor.prototype, "translate", {
        set: function set(value) {
            var _this4 = this;

            if (this.options.debug) console.log("Call translate(" + value + ")");

            var set_active_slide = function set_active_slide() {

                $(_this4.id).find(".slide.active").removeClass("active");

                $.each($(_this4.slides.object), function (index, slide) {

                    if (slide.getBoundingClientRect().x === 0) {
                        $(slide).addClass('active');

                        return false;
                    }
                });
            };

            this.translateData.value = value;

            anime({
                targets: this.id + " .slides-container",
                translateX: -value,
                easing: "easeInOutQuart",
                duration: this.options.autoScroll.animation_speed,
                complete: function complete() {
                    _this4.state = null;
                    set_active_slide();
                    _this4.options.autoScroll.counter = 0;
                }
            });
        }
    });

    //Полная инициализация слайдера
    SliderConstructor.prototype.initializeSlider = function () {

        if (this.options.debug) console.log("Call initializeSlider");

        //Данные слайдов
        if (this.options.debug) console.log("initializeSlider call setSlidesData()");
        this.setSlidesData();

        if (this.slides.object.find('.image img').length && (!this.slides.imageWidth || !this.slides.imageHeight)) return 0;

        this.slides.imageRatio = this.slides.imageWidth / this.slides.imageHeight;

        //Данные области отображения
        if (this.options.debug) console.log("initializeSlider call setViewData()");
        this.setViewData();
        //Расчитываем промежутки мехду слайдами
        if (this.options.debug) console.log("initializeSlider call calculateSlidesSpacers()");
        this.calculateSlidesSpacers();
        //Данные контейнера слайдов
        if (this.options.debug) console.log("initializeSlider call setContainerData()");
        this.setContainerData();
        //Данные смещение контейнера
        if (this.options.debug) console.log("initializeSlider call setTranslateData()");
        this.setTranslateData();

        if (!this.slides.maxWidth) {
            this.slides.maxWidth = this.calculateSlideWidth();
            this.slides.imageWidth = this.slides.maxWidth;
            this.slides.imageHeight = this.slides.imageWidth / this.slides.imageRatio;
        }
        $(this.id).data("viewed", this.slides.viewed);
        if (this.slides.maxWidth && this.slides.imageWidth > this.slides.maxWidth) this.slides.imageWidth = this.slides.maxWidth;
        $(this.id).data("initSlideWidth", this.slides.maxWidth);
        $(this.id).data("initImageWidth", this.slides.imageWidth);
        $(this.id).data("initImageHeight", this.slides.imageHeight);

        //Вешаем обработчики
        if (this.options.debug) console.log("initializeSlider call _initListeners()");
        this._initListeners();
        //Обновление навигации
        if (this.options.debug) console.log("initializeSlider call updateNav()");
        this.updateNav();
    };
    //Изменение количества отображаемых слайдов
    SliderConstructor.prototype.updateViewData = function (viewed) {

        if (this.options.debug) console.log("Call updateViewData(" + viewed + ")");

        this.slides.viewed = parseInt(viewed, 10);

        if (this.options.debug) console.log("updateViewData call setViewData()");
        this.setViewData();
        //Расчитываем промежутки мехду слайдами
        if (this.options.debug) console.log("updateViewData call calculateSlidesSpacers()");
        this.calculateSlidesSpacers();
        if (this.options.debug) console.log("updateViewData call setTranslateData()");
        this.setTranslateData();
    };
    //Изменение размера слайдов
    SliderConstructor.prototype.updateSlidesSize = function (maxSlideWidth, maxImageWidth, maxImageHeight) {

        if (this.options.debug) console.log("Call updateSlidesSize(" + maxSlideWidth + "," + maxImageWidth + "," + maxImageHeight + ")");

        this.slides.maxWidth = maxSlideWidth;
        this.slides.imageWidth = maxImageWidth;
        this.slides.imageHeight = maxImageHeight;

        //Данные слайдов
        if (this.options.debug) console.log("updateSlidesSize call setSlidesData()");
        this.setSlidesData();
        //Данные области отображения
        if (this.options.debug) console.log("updateSlidesSize call setViewData()");
        this.setViewData();
        //Расчитываем промежутки мехду слайдами
        if (this.options.debug) console.log("updateSlidesSize call calculateSlidesSpacers()");
        this.calculateSlidesSpacers();
        //Данные контейнера
        if (this.options.debug) console.log("updateSlidesSize call setContainerData()");
        this.setContainerData();
        //Данные смещение контейнера
        if (this.options.debug) console.log("updateSlidesSize call setTranslateData()");
        this.setTranslateData();
        //Обновление навигации
        if (this.options.debug) console.log("updateSlidesSize call updateNav()");
        this.updateNav();
    };
    //Обновление навигации
    SliderConstructor.prototype.updateNav = function () {

        if (this.options.debug) console.log("Call updateNav");

        if (this.options.arrowNav) $(this.id).find('.arrow-nav').remove();
        if (this.options.dotNav) $(this.id).find('.dot-nav').remove();

        if (this.options.debug) console.log("updateNav call addNav()");

        this.addNav();
    };
    //Получает размер изображений
    SliderConstructor.prototype.getImagesSizes = function () {

        if (this.options.debug) console.log("Call getImagesSizes");

        var slider = this;

        var img = new Image();
        img.addEventListener("load", function () {

            slider.slides.imageWidth = this.naturalWidth;
            slider.slides.imageHeight = this.naturalHeight;
            window.setTimeout(function () {
                return $(slider.slides.object[0]).addClass('active');
            }, 1000);

            if (slider.options.debug) console.log("getImagesSizes img.lod call initializeSlider()");

            slider.initializeSlider();
        });
        if (this.options.lazy_load) {
            img.src = this.slides.object.find('.image img').data('src');
        } else {
            img.src = this.slides.object.find('.image img').attr('src');
        }
    };
    //Вычисляем высоту слайдов
    SliderConstructor.prototype.calculateSlideHeight = function () {
        var _this5 = this;

        if (this.options.debug) console.log("Call calculateSlideHeight");

        $.each(this.slides.object, function (index, slide) {

            var height = $(slide).outerHeight(true);

            if (height > _this5.slides.maxHeight) _this5.slides.maxHeight = height;
        });
        this.slides.object.outerHeight(this.slides.maxHeight);
    };
    //Ресайзер слайдера
    SliderConstructor.prototype.sliderResizer = function () {

        if (this.options.debug) console.log("Call sliderResizer");

        var calcSlideWidth = void 0,
            calcImageWidth = void 0,
            calcImageHeight = void 0,
            initSlideWidth = $(this.id).data("initSlideWidth"),
            initImageWidth = $(this.id).data("initImageWidth"),
            initImageToSlideWidthRatio = initSlideWidth / initImageWidth;

        calcSlideWidth = this.calculateSlideWidth();
        if (initSlideWidth && calcSlideWidth > initSlideWidth) calcSlideWidth = initSlideWidth;

        var slidesWidthDifference = initSlideWidth - calcSlideWidth;

        if (slidesWidthDifference < this.spacers.width && slidesWidthDifference > 0 && this.spacers.width > this.spacers.min_width) {
            if (this.options.debug) console.log("sliderResizer call updateSlidesSize(" + this.slides.maxWidth + "," + this.slides.imageWidth + "," + this.slides.imageHeight + ")");
            this.updateSlidesSize(this.slides.maxWidth, this.slides.imageWidth, this.slides.imageHeight);
        } else {
            calcImageWidth = calcSlideWidth / initImageToSlideWidthRatio;
            calcImageHeight = calcImageWidth / this.slides.imageRatio;
            if (this.options.debug) console.log("sliderResizer call updateSlidesSize(" + calcSlideWidth + "," + calcImageWidth + "," + calcImageHeight + ")");
            this.updateSlidesSize(calcSlideWidth, calcImageWidth, calcImageHeight);
        }
    };
    //Изменение количества слайдов в строке в зависимости от ширины экрана
    SliderConstructor.prototype.addViewportListeners = function () {
        var _this6 = this;

        if (this.options.debug) console.log("Call addViewportListeners");

        var desktop = window.matchMedia("(min-width: " + this.responsiveData.desktop.width + "px)"),
            laptop = window.matchMedia("(max-width: " + this.responsiveData.laptop.width + "px) and (min-width: " + (this.responsiveData.tablet.width + 1) + "px)"),
            tablet = window.matchMedia("(max-width: " + this.responsiveData.tablet.width + "px) and (min-width: " + (this.responsiveData.phone.width + 1) + "px)"),
            phone = window.matchMedia("(max-width: " + this.responsiveData.phone.width + "px)"),
            checkDesktopQuery = function checkDesktopQuery(e) {

            if (e.matches) {

                if (_this6.options.debug) console.log("addViewportListeners: desktop");
                if (_this6.options.debug) console.log("addViewportListeners call updateViewData(" + $(_this6.id).data("viewed") + ")");

                _this6.updateViewData($(_this6.id).data("viewed"));
            }
        },
            checkLaptopQuery = function checkLaptopQuery(e) {

            if (e.matches && _this6.slides.viewed !== _this6.responsiveData.laptop.viewed) {

                if (_this6.options.debug) console.log("addViewportListeners: laptop");
                if (_this6.options.debug) console.log("addViewportListeners call updateViewData(" + _this6.responsiveData.laptop.viewed + ")");

                _this6.updateViewData(_this6.responsiveData.laptop.viewed);
            }
        },
            checkTabletQuery = function checkTabletQuery(e) {

            if (e.matches && _this6.slides.viewed !== _this6.responsiveData.tablet.viewed) {

                if (_this6.options.debug) console.log("addViewportListeners: tablet");
                if (_this6.options.debug) console.log("addViewportListeners call updateViewData(" + _this6.responsiveData.tablet.viewed + ")");

                _this6.updateViewData(_this6.responsiveData.tablet.viewed);
            }
        },
            checkPhoneQuery = function checkPhoneQuery(e) {

            if (e.matches && _this6.slides.viewed !== _this6.responsiveData.phone.viewed) {

                if (_this6.options.debug) console.log("addViewportListeners: phone");
                if (_this6.options.debug) console.log("addViewportListeners call updateViewData(" + _this6.responsiveData.phone.viewed + ")");

                _this6.updateViewData(_this6.responsiveData.phone.viewed);
            }
        };

        if (phone.matches && this.slides.viewed > this.responsiveData.phone.viewed) {

            if (this.options.debug) console.log("addViewportListeners: phone");
            if (this.options.debug) console.log("addViewportListeners call updateViewData(" + this.responsiveData.phone.viewed + ")");

            this.updateViewData(this.responsiveData.phone.viewed);
        } else if (tablet.matches && this.slides.viewed > this.responsiveData.tablet.viewed) {

            if (this.options.debug) console.log("addViewportListeners: tablet");
            if (this.options.debug) console.log("addViewportListeners call updateViewData(" + this.responsiveData.tablet.viewed + ")");

            this.updateViewData(this.responsiveData.tablet.viewed);
        } else if (laptop.matches && this.slides.viewed > this.responsiveData.laptop.viewed) {

            if (this.options.debug) console.log("addViewportListeners: laptop");
            if (this.options.debug) console.log("addViewportListeners call updateViewData(" + this.responsiveData.laptop.viewed + ")");

            this.updateViewData(this.responsiveData.laptop.viewed);
        } else if (desktop.matches) {

            if (this.options.debug) console.log("addViewportListeners: desktop");
            if (this.options.debug) console.log("addViewportListeners call updateViewData(" + $(this.id).data("viewed") + ")");

            this.updateViewData($(this.id).data("viewed"));
        }

        phone.addListener(checkPhoneQuery);
        tablet.addListener(checkTabletQuery);
        laptop.addListener(checkLaptopQuery);
        desktop.addListener(checkDesktopQuery);
    };
    //Добавление IntersectionObserver для ленивой загрузки
    SliderConstructor.prototype.addIntersectionObserver = function () {
        var _this7 = this;

        if (this.options.debug) console.log("Call addIntersectionObserver");

        var lazy_flag = true,
            image_observer_callback = function image_observer_callback(entries, observer) {

            entries.forEach(function (entry) {

                var isIntersecting = entry.isIntersecting;

                if (isIntersecting) {
                    _this7.lazyloadImage(entry.target);
                    if (lazy_flag) {
                        $(entry.target).load(function () {
                            _this7.slides.maxHeight = _this7.slides.object.find('img').outerHeight(true);
                            if (_this7.options.debug) console.log("addIntersectionObserver image_observer_callback call sliderResizer");
                            _this7.sliderResizer();
                        });
                        lazy_flag = false;
                    }
                    observer.disconnect();
                }
            });
        },
            slider_observer = new IntersectionObserver(function (entries, observer) {

            entries.forEach(function (entry) {

                var isIntersecting = entry.isIntersecting;
                if (isIntersecting) {
                    var images = $(_this7.id).find('.slide img');
                    $.each(images, function (index, image) {

                        var image_observer = new IntersectionObserver(image_observer_callback, {
                            root: $(_this7.id).get(0),
                            rootMargin: '200px'
                        });
                        image_observer.observe(image);
                    });
                    observer.disconnect();
                }
            });
        }, {
            rootMargin: '200px'
        });

        slider_observer.observe(document.getElementById(this.id.slice(1)));
    };
    //Ленивая загрузка изображения
    SliderConstructor.prototype.lazyloadImage = function (image) {

        $(image).attr('src', $(image).data('src'));
        $(image).attr('srcset', $(image).data('srcset'));
        $(image).attr('sizes', $(image).data('sizes'));
    };
    //Функция подсчета ширины слайда
    SliderConstructor.prototype.calculateSlideWidth = function () {

        var sliderWidth = $(this.id).width();

        return sliderWidth / this.slides.viewed - this.spacers.min_width / this.slides.viewed * (this.slides.viewed - 1);
    };
    /***************************Инициализация слайдера***************************************/
    slider.initializeSlider();
};
//# sourceMappingURL=seoclickSlider.js.map