"use strict";

//TODO сейчас высоту слайдов расчитывает по первому изображению в слайде. При использовании иходного изображения с разными размерами происходит их растяжка с нарушением пропорций. Попробовать исправить.
//TODO попробовать сделать оптимизацию вызовов функций
var SeoClickSlider = function SeoClickSlider(params) {

    var $ = jQuery;

    var slider = new SliderConstructor({
        sliderSelector: params.sliderSelector,
        sliderItemSelector: params.sliderItemSelector,
        viewed: parseInt(params.viewed, 10),
        spacerMinWidth: parseInt(params.spacerMinWidth, 10),
        imageContainerWidth: parseInt(params.imageWidth, 10),
        imageContainerHeight: parseInt(params.imageHeight, 10),
        slideWidth: parseInt(params.slideWidth, 10),
        arrowNav: params.arrowNav,
        dotNav: params.dotNav,
        arrowsMarkup: params.arrowsMarkup,
        desc_block: params.desc_block,
        infiniteMode: params.infiniteMode,
        autoScroll: params.autoScroll,
        lazy_load: params.lazy_load,
        responsiveData: params.responsiveData,
        debug: params.debug
    });

    function SliderConstructor(arg) {
        this.sliderSelector = arg.sliderSelector;
        this.sliderItemSelector = arg.sliderItemSelector;
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
            viewed: arg.viewed,
            imageContainerWidth: arg.imageContainerWidth,
            imageContainerHeight: arg.imageContainerHeight,
            imageRatio: null,
            maxWidth: arg.slideWidth,
            maxHeight: null
        };
        this.spacers = {
            count: null,
            width: null,
            min_width: arg.spacerMinWidth
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

    SliderConstructor.prototype.addSliderMarkup = function () {

        var slider = $(this.sliderSelector);

        if (slider.children().first().hasClass('slides-wrap')) return true;

        if (!slider.hasClass("seoclick-slider")) slider.addClass("seoclick-slider");
        slider.append("<div class='slides-wrap'><div class='slider-view'><div class='slides-container'></div></div></div>");
        slider.find(this.sliderItemSelector).appendTo(slider.find(".slides-container"));

        var slideImage = slider.find(this.sliderItemSelector + " img");

        if (!slideImage.parent().hasClass('image')) {
            slideImage.wrap("<div class='image'></div>");
        }
    };
    SliderConstructor.prototype.setSlidesData = function () {

        if (this.options.debug) console.log("Call setSlidesData");

        //Размер изображений
        if (this.slides.object.find('.image img').length) {

            if (!this.slides.imageContainerWidth || !this.slides.imageContainerHeight) {
                if (this.options.debug) console.log("setSlidesData call setImageContainerData()");

                this.setImageContainerData();
            } else {
                this.slides.imageRatio = this.slides.imageContainerWidth / this.slides.imageContainerHeight;
            }
        }

        this.slides.object.find('.image').outerWidth(this.slides.imageContainerWidth);
        this.slides.object.find('.image').outerHeight(this.slides.imageContainerHeight);

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

        var sliderView = $(this.sliderSelector).find(".slider-view");

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
            this.spacers.width = Math.round((this.viewWidth - this.slides.maxWidth * this.slides.viewed) / (this.slides.viewed - 1));
            this.spacers.count = this.slides.count - 1;
            if (this.spacers.width < this.spacers.min_width) {

                this.spacers.width = this.spacers.min_width;
                this.slides.maxWidth = Math.round(this.slides.maxWidth - this.spacers.min_width / this.slides.viewed * (this.slides.viewed - 1));
                if (this.slides.imageContainerWidth > this.slides.maxWidth) {
                    this.slides.imageContainerWidth = this.slides.maxWidth;
                    this.slides.imageContainerHeight = Math.round(this.slides.imageContainerWidth / this.slides.imageRatio);
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
        this.container.width(this.containerWidth);
        $.each(this.slides.object, function (index, slide) {
            if (index !== _this.slides.count - 1) {
                $(slide).css({
                    marginLeft: 0,
                    marginRight: _this.spacers.width
                });
            }
        });
    };
    SliderConstructor.prototype.setTranslateData = function () {

        if (this.options.debug) console.log("Call setTranslateData");

        this.translateData.min = 0;
        this.translateData.value = this.translateData.min;
        this.container.css("transform", "translateX(" + this.translateData.value + "px)");
        if (this.slides.viewed === 1) {
            this.translateData.step = Math.round(this.viewWidth);
        } else {
            this.translateData.step = Math.round(this.viewWidth + this.spacers.width);
        }
        this.translateData.max = Math.round((Math.ceil(this.slides.count / this.slides.viewed) - 1) * this.translateData.step);
    };
    SliderConstructor.prototype._initListeners = function () {
        var _this2 = this;

        if (this.options.debug) console.log("Call _initListeners");

        if (this.options.lazy_load && 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

            if (this.options.debug) console.log("_initListeners call addIntersectionObserver()");

            this.addIntersectionObserver();
        } else if (this.options.lazy_load) {
            var images = $(this.sliderSelector).find('.slide img');

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
                dotnav_container = $(self.sliderSelector).find(".dot-nav");

            if (x <= self.translateData.max) {
                if (self.options.arrowNav && !self.options.infiniteMode) {
                    if (x === self.translateData.max) {
                        $(self.sliderSelector).find('.slider-next').addClass("disabled");
                    } else {
                        $(self.sliderSelector).find('.slider-next').removeClass("disabled");
                        $(self.sliderSelector).find('.slider-prev').removeClass("disabled");
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
            } else {
                self.state = null;
            }
        }

        function moveSlidesRight() {

            if (self.state !== null) return 0;

            if (self.options.debug) console.log("Call moveSlidesRight");

            self.state = 'animated';

            var x = self.translateData.value - self.translateData.step,
                dotnav_container = $(self.sliderSelector).find(".dot-nav");

            if (x >= self.translateData.min) {
                if (self.options.arrowNav && !self.options.infiniteMode) {
                    if (x === self.translateData.min) {
                        $(self.sliderSelector).find('.slider-prev').addClass("disabled");
                    } else {
                        $(self.sliderSelector).find('.slider-next').removeClass("disabled");
                        $(self.sliderSelector).find('.slider-prev').removeClass("disabled");
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
            } else {
                self.state = null;
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

            $(self.sliderSelector).append(markup);
            $(self.sliderSelector).find(".arrow-nav > div").click(function () {

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
            $(self.sliderSelector).append(dotnav_container);

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
            $(self.sliderSelector).find(".slide-description.active").removeClass("active");
            $(descClass).parent().css('min-height', $(descClass).outerHeight(true));
            window.setTimeout(function () {
                $(descClass).addClass('active');
            }, 250);
        }

        var self = this,
            mc = new Hammer(document.querySelector(this.sliderSelector)),
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

            $(this.sliderSelector).mouseenter(function () {
                return isPaused = true;
            });
            $(this.sliderSelector).mouseleave(function () {
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

                $(_this4.sliderSelector).find(".slide.active").removeClass("active");

                $.each($(_this4.slides.object), function (index, slide) {

                    if (slide.getBoundingClientRect().x === 0) {
                        $(slide).addClass('active');

                        return false;
                    }
                });
            };

            this.translateData.value = value;

            anime({
                targets: this.sliderSelector + " .slides-container",
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

        this.addSliderMarkup();
        this.slides.object = $(this.sliderSelector).find(this.sliderItemSelector);
        this.container = $(this.sliderSelector).find(".slides-container");
        //Кол. слайдов
        this.slides.count = this.slides.object.length;

        //Данные слайдов
        if (this.options.debug) console.log("initializeSlider call setSlidesData()");
        this.setSlidesData();

        if (this.options.debug) console.log("initializeSlider call addViewportListeners()");
        //Определяет количество отображаемых слайдов
        this.addViewportListeners();

        //Если не задана ширина слайда
        if (!this.slides.maxWidth) {
            this.slides.maxWidth = this.calculateSlideWidth();
            this.slides.imageContainerWidth = this.slides.maxWidth;
            this.slides.imageContainerHeight = this.slides.imageContainerWidth / this.slides.imageRatio;
            this.setSlidesData();
        }
        if (this.slides.maxWidth && this.slides.imageContainerWidth > this.slides.maxWidth) this.slides.imageContainerWidth = this.slides.maxWidth;

        $(this.sliderSelector).data("initSlideWidth", this.slides.maxWidth);
        $(this.sliderSelector).data("initImageContainerWidth", this.slides.imageContainerWidth);

        //Данные контейнера слайдов
        if (this.options.debug) console.log("initializeSlider call setContainerData()");
        this.setContainerData();

        //Вешаем обработчики
        if (this.options.debug) console.log("initializeSlider call _initListeners()");
        this._initListeners();
    };
    //Изменение количества отображаемых слайдов
    SliderConstructor.prototype.updateViewData = function (viewed) {

        if (this.options.debug) console.log("Call updateViewData(" + viewed + ")");

        this.slides.viewed = parseInt(viewed, 10);

        if (this.options.debug) console.log("updateViewData call setViewData()");
        //Данные области отображения
        this.setViewData();
        if (this.options.debug) console.log("updateViewData call calculateSlidesSpacers()");
        //Расчитываем промежутки мехду слайдами
        this.calculateSlidesSpacers();
        if (this.options.debug) console.log("updateViewData call setTranslateData()");
        //Данные смещение контейнера
        this.setTranslateData();
    };
    //Изменение размера слайдов
    SliderConstructor.prototype.updateSlidesSize = function (maxSlideWidth, maxImageConatinerWidth, maxImageContainerHeight) {

        if (this.options.debug) console.log("Call updateSlidesSize(" + maxSlideWidth + "," + maxImageConatinerWidth + "," + maxImageContainerHeight + ")");

        this.slides.maxWidth = maxSlideWidth;
        this.slides.imageContainerWidth = maxImageConatinerWidth;
        this.slides.imageContainerHeight = maxImageContainerHeight;

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

        if (this.options.arrowNav) $(this.sliderSelector).find('.arrow-nav').remove();
        if (this.options.dotNav) $(this.sliderSelector).find('.dot-nav').remove();

        if (this.options.debug) console.log("updateNav call addNav()");

        this.addNav();
    };
    //Получает размер изображений
    SliderConstructor.prototype.setImageContainerData = function () {
        var _this5 = this;

        if (this.options.debug) console.log("Call setImageContainerData");

        var maxWidth = 0,
            maxHeight = 0,
            minRatio = 9999;

        $.each(this.slides.object, function (index, slide) {

            var slide_image = $(slide).find('.image img'),
                image_width = slide_image.attr('width'),
                image_height = slide_image.attr('height'),
                image_ratio = image_width / image_height;

            if (image_width > maxWidth) maxWidth = image_width;
            if (image_height > maxHeight) maxHeight = image_height;
            if (minRatio > image_ratio) minRatio = image_ratio;
        });
        this.slides.imageContainerWidth = maxWidth;
        this.slides.imageContainerHeight = maxHeight;
        this.slides.imageRatio = minRatio;

        window.setTimeout(function () {
            return $(_this5.slides.object[0]).addClass('active');
        }, 1000);
    };
    //Вычисляем высоту слайдов
    SliderConstructor.prototype.calculateSlideHeight = function () {
        var _this6 = this;

        if (this.options.debug) console.log("Call calculateSlideHeight");

        $.each(this.slides.object, function (index, slide) {

            var height = $(slide).outerHeight(true);

            if (height > _this6.slides.maxHeight) _this6.slides.maxHeight = height;
        });
        this.slides.object.outerHeight(this.slides.maxHeight);
    };
    //Ресайзер слайдера
    SliderConstructor.prototype.sliderResizer = function () {

        if (this.options.debug) console.log("Call sliderResizer");

        var calcSlideWidth = void 0,
            calcImageContainerWidth = void 0,
            calcImageContainerHeight = void 0,
            initSlideWidth = $(this.sliderSelector).data("initSlideWidth"),
            initImageContainerWidth = $(this.sliderSelector).data("initImageContainerWidth"),
            initImageToSlideWidthRatio = initSlideWidth / initImageContainerWidth;

        calcSlideWidth = this.calculateSlideWidth();
        if (initSlideWidth && calcSlideWidth > initSlideWidth) calcSlideWidth = initSlideWidth;

        var slidesWidthDifference = initSlideWidth - calcSlideWidth;

        if (slidesWidthDifference < this.spacers.width && slidesWidthDifference > 0 && this.spacers.width > this.spacers.min_width) {
            if (this.options.debug) console.log("sliderResizer call updateSlidesSize(" + this.slides.maxWidth + "," + this.slides.imageContainerWidth + "," + this.slides.imageContainerHeight + ")");
            this.updateSlidesSize(this.slides.maxWidth, this.slides.imageContainerWidth, this.slides.imageContainerHeight);
        } else {
            calcImageContainerWidth = Math.round(calcSlideWidth / initImageToSlideWidthRatio);
            calcImageContainerHeight = Math.round(calcImageContainerWidth / this.slides.imageRatio);
            if (this.options.debug) console.log("sliderResizer call updateSlidesSize(" + calcSlideWidth + "," + calcImageContainerWidth + "," + calcImageContainerHeight + ")");
            this.updateSlidesSize(calcSlideWidth, calcImageContainerWidth, calcImageContainerHeight);
        }
    };
    //Изменение количества слайдов в строке в зависимости от ширины экрана
    SliderConstructor.prototype.addViewportListeners = function () {
        var _this7 = this;

        if (this.options.debug) console.log("Call addViewportListeners");

        this.responsiveData.desktop.width = parseInt(this.responsiveData.desktop.width, 10);
        this.responsiveData.laptop.width = parseInt(this.responsiveData.laptop.width, 10);
        this.responsiveData.tablet.width = parseInt(this.responsiveData.tablet.width, 10);
        this.responsiveData.phone.width = parseInt(this.responsiveData.phone.width, 10);

        this.responsiveData.desktop.viewed = parseInt(this.responsiveData.desktop.viewed, 10);
        this.responsiveData.laptop.viewed = parseInt(this.responsiveData.laptop.viewed, 10);
        this.responsiveData.tablet.viewed = parseInt(this.responsiveData.tablet.viewed, 10);
        this.responsiveData.phone.viewed = parseInt(this.responsiveData.phone.viewed, 10);

        var desktop = window.matchMedia("(min-width: " + this.responsiveData.desktop.width + "px)"),
            laptop = window.matchMedia("(max-width: " + this.responsiveData.laptop.width + "px) and (min-width: " + (this.responsiveData.tablet.width + 1) + "px)"),
            tablet = window.matchMedia("(max-width: " + this.responsiveData.tablet.width + "px) and (min-width: " + (this.responsiveData.phone.width + 1) + "px)"),
            phone = window.matchMedia("(max-width: " + this.responsiveData.phone.width + "px)"),
            checkDesktopQuery = function checkDesktopQuery(e) {

            if (e.matches) {

                if (_this7.options.debug) console.log("addViewportListeners: desktop");
                if (_this7.options.debug) console.log("addViewportListeners call updateViewData(" + _this7.responsiveData.desktop.viewed + ")");

                _this7.updateViewData(_this7.responsiveData.desktop.viewed);
            }
        },
            checkLaptopQuery = function checkLaptopQuery(e) {

            if (e.matches && _this7.slides.viewed !== _this7.responsiveData.laptop.viewed) {

                if (_this7.options.debug) console.log("addViewportListeners: laptop");
                if (_this7.options.debug) console.log("addViewportListeners call updateViewData(" + _this7.responsiveData.laptop.viewed + ")");

                _this7.updateViewData(_this7.responsiveData.laptop.viewed);
            }
        },
            checkTabletQuery = function checkTabletQuery(e) {

            if (e.matches && _this7.slides.viewed !== _this7.responsiveData.tablet.viewed) {

                if (_this7.options.debug) console.log("addViewportListeners: tablet");
                if (_this7.options.debug) console.log("addViewportListeners call updateViewData(" + _this7.responsiveData.tablet.viewed + ")");

                _this7.updateViewData(_this7.responsiveData.tablet.viewed);
            }
        },
            checkPhoneQuery = function checkPhoneQuery(e) {

            if (e.matches && _this7.slides.viewed !== _this7.responsiveData.phone.viewed) {

                if (_this7.options.debug) console.log("addViewportListeners: phone");
                if (_this7.options.debug) console.log("addViewportListeners call updateViewData(" + _this7.responsiveData.phone.viewed + ")");

                _this7.updateViewData(_this7.responsiveData.phone.viewed);
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
            if (this.options.debug) console.log("addViewportListeners call updateViewData(" + this.responsiveData.desktop.viewed + ")");

            this.updateViewData(this.responsiveData.desktop.viewed);
        }

        phone.addListener(checkPhoneQuery);
        tablet.addListener(checkTabletQuery);
        laptop.addListener(checkLaptopQuery);
        desktop.addListener(checkDesktopQuery);
    };
    //Добавление IntersectionObserver для ленивой загрузки
    SliderConstructor.prototype.addIntersectionObserver = function () {
        var _this8 = this;

        if (this.options.debug) console.log("Call addIntersectionObserver");

        var lazy_flag = true,
            image_observer_callback = function image_observer_callback(entries, observer) {

            entries.forEach(function (entry) {

                var isIntersecting = entry.isIntersecting;

                if (isIntersecting) {
                    _this8.lazyloadImage(entry.target);
                    if (lazy_flag) {
                        $(entry.target).load(function () {
                            _this8.slides.maxHeight = _this8.slides.object.find('img').outerHeight(true);
                            if (_this8.options.debug) console.log("addIntersectionObserver image_observer_callback call sliderResizer");
                            _this8.sliderResizer();
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
                    var images = $(_this8.sliderSelector).find('.slide img');
                    $.each(images, function (index, image) {

                        var image_observer = new IntersectionObserver(image_observer_callback, {
                            root: $(_this8.sliderSelector).get(0),
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

        slider_observer.observe(document.querySelector(this.sliderSelector));
    };
    //Ленивая загрузка изображения
    SliderConstructor.prototype.lazyloadImage = function (image) {

        $(image).attr('src', $(image).data('src'));
        $(image).attr('srcset', $(image).data('srcset'));
        $(image).attr('sizes', $(image).data('sizes'));
    };
    //Функция подсчета ширины слайда
    SliderConstructor.prototype.calculateSlideWidth = function () {

        var sliderWidth = $(this.sliderSelector).width();

        return Math.round(sliderWidth / this.slides.viewed - this.spacers.min_width / this.slides.viewed * (this.slides.viewed - 1));
    };
    /***************************Инициализация слайдера***************************************/
    slider.initializeSlider();

    return {
        resize: function resize() {
            console.log('SeoClick slider resize call');
            slider.sliderResizer();
        },
        setViewItems: function setViewItems(viewed) {
            console.log('SeoClick slider setViewItems call');
            slider.updateViewData(viewed);
            slider.sliderResizer();
        }
    };
};
//# sourceMappingURL=seoclickSlider.js.map