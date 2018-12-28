let SeoClickSlider = function (params) {

    let $ = jQuery;

    let slider = new SliderConstructor({
        id: params.id,
        viewed: params.viewed,
        spacerWidth: params.spacerWidth,
        imageWidth: params.imageWidth,
        imageHeight: params.imageHeight,
        slideWidth: params.slideWidth,
        arrowNav: params.arrowNav,
        dotNav: params.dotNav,
        desc_block: params.desc_block,
        infiniteMode: params.infiniteMode,
        autoScroll: params.autoScroll,
        animation_speed: params.animation_speed,
        lazy_load: params.lazy_load
    });

    function SliderConstructor(arg) {
        this.id = arg.id;
        this.state = null;
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
            imageWidth: arg.imageWidth,
            imageHeight: arg.imageHeight,
            maxWidth: arg.slideWidth,
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
            infiniteMode: arg.infiniteMode,
            autoScroll: {
                handle: null,
                active: arg.autoScroll.active,
                interval: arg.autoScroll.interval,
                animation_speed: arg.autoScroll.animation_speed
            },
            lazy_load: arg.lazy_load
        };
    }

    SliderConstructor.prototype.setSlidesData = function () {

        this.slides.object = $(this.id).find(".slide");
        //Кол. слайдов
        this.slides.count = this.slides.object.length;

        //Размер слайда
        this.slides.object.find('img').outerWidth(this.slides.imageWidth);
        this.slides.object.find('img').outerHeight(this.slides.imageHeight);

        if (this.slides.maxWidth === null) {
            this.slides.maxWidth = this.slides.object.outerWidth();
        }
        this.slides.object.css("height", '');
        this.slides.maxHeight = this.slides.object.outerHeight();

        this.slides.object.outerWidth(this.slides.maxWidth);
        this.slides.object.outerHeight(this.slides.maxHeight);
    };
    SliderConstructor.prototype.setContainerData = function () {
        this.containerWidth =
            this.slides.maxWidth * this.slides.count +
            this.spacers.count * this.spacers.width;
        this.container = $(this.id).find(this.containerClass);
        this.container.width(this.containerWidth);
    };
    SliderConstructor.prototype.setViewData = function () {
        this.viewWidth = this.slides.maxWidth * this.slides.viewed + this.spacers.width * (this.slides.viewed + 1);
        this.viewHeight = this.container.outerHeight(true);
        $(this.id).find(".slider-view").outerWidth(this.viewWidth).outerHeight(this.viewHeight);
    };
    SliderConstructor.prototype.setTranslateData = function () {
        this.translateData.min = Math.ceil(
            -(
                this.slides.maxWidth * this.slides.viewed +
                this.spacers.width * (this.slides.viewed - 1)
            ) / 2
        );
        this.translateData.value = this.translateData.min;
        this.container.css(
            "transform",
            "translateX(" + this.translateData.value + "px)"
        );
        this.translateData.step = -(this.spacers.width + this.slides.maxWidth);
        this.translateData.max =
            this.translateData.step * this.spacers.count +
            this.translateData.min -
            this.translateData.step * (this.slides.viewed - 1);
        this.translateData.step *= this.slides.viewed;
    };
    SliderConstructor.prototype._initListeners = function () {
        let self = this,
            desktop = window.matchMedia(
                "(min-width: " + self.responsiveData.desktop + ")"
            ),
            laptop = window.matchMedia(
                "(max-width: " + self.responsiveData.laptop + ")"
            ),
            tablet = window.matchMedia(
                "(max-width: " + self.responsiveData.tablet + ")"
            ),
            phone = window.matchMedia(
                "(max-width: " + self.responsiveData.phone + ")"
            );

        let sliderResizer = function () {
                let sliderWidth = $(self.id).width(),
                    calcSlideWidth, calcImageWidth, calcImageHeight,
                    initSlideWidth = $(self.id).data("initSlideWidth"),
                    initImageWidth = $(self.id).data("initImageWidth"),
                    initImageHeight = $(self.id).data("initImageHeight");

                calcSlideWidth = Math.round((sliderWidth - self.spacers.width * (self.slides.viewed + 1)) / self.slides.viewed);

                let difference = initSlideWidth - calcSlideWidth,
                    ratio = initImageWidth / initImageHeight;

                calcImageWidth = initImageWidth - difference;
                calcImageHeight = initImageHeight - difference / ratio;

                if (sliderWidth < self.viewWidth || calcSlideWidth <= initSlideWidth) {
                    self.updateSlidesSize(calcSlideWidth, calcImageWidth, calcImageHeight);
                } else {
                    self.updateSlidesSize(initSlideWidth, initImageWidth, initImageHeight);
                }
            },
            checkDesktopQuery = function (e) {

                if (e.matches) {
                    self.updateViewData($(self.id).data("viewed"));
                }
            },
            checkLaptopQuery = function (e) {

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
            checkTabletQuery = function (e) {

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
            checkPhoneQuery = function (e) {

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

        if(self.options.lazy_load){
            let lazy_flag = true,
                image_observer_callback = function(entries, observer) {

                    entries.forEach(function(entry){

                        let isIntersecting = entry.isIntersecting;

                        if (isIntersecting) {
                            $(entry.target).attr('src', $(entry.target).attr('ref'));
                            if(lazy_flag){
                                $(entry.target).load(function(){
                                    self.slides.maxHeight = self.slides.object.find('img').outerHeight(true);
                                    sliderResizer();
                                });
                                lazy_flag = false;
                            }
                            observer.disconnect();
                        }
                    });
                },
                slider_observer = new IntersectionObserver(function(entries, observer){

                    entries.forEach(function(entry){

                        let isIntersecting = entry.isIntersecting;
                        if (isIntersecting) {
                            let images = $(self.id).find('.slide img');
                            $.each(images, function (index, image){

                                let image_observer = new IntersectionObserver(image_observer_callback, {
                                    root: $(self.id).get( 0 ),
                                    rootMargin: '200px'
                                });
                                image_observer.observe(image);
                            });
                            observer.disconnect();
                        }
                    });
                },{
                    rootMargin: '200px'
                });
            slider_observer.observe(document.getElementById(self.id.slice(1)));
        }else{
            sliderResizer();
        }
        $(window).resize(sliderResizer);
    };
    SliderConstructor.prototype.addNav = function () {

        function moveSlidesLeft() {

            if(self.state !== null) return 0;
            self.state = 'animated';

            let x = self.translateData.value + self.translateData.step,
                dotnav_container = $(self.id).find(".dot-nav");

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
                    let active_dot = dotnav_container.find(".active").removeClass("active");
                    active_dot.next().addClass("active");
                }
                if (self.options.desc_block) {
                    $.each(self.slides.object, function (index, slide) {
                        "use strict";
                        let translate = $(slide).data("translate_value");
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
                        let translate = $(slide).data("translate_value");
                        if (translate === self.translateData.min) {
                            activateSlideDesc($(slide).data("number"));
                            return false;
                        }
                    });
                }
                self.translate = self.translateData.min;
            }
        }
        function moveSlidesRight() {

            if(self.state !== null) return 0;
            self.state = 'animated';

            let x = self.translateData.value - self.translateData.step,
                dotnav_container = $(self.id).find(".dot-nav");

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
                    let active_dot = dotnav_container.find(".active").removeClass("active");
                    active_dot.prev().addClass("active");
                }
                if (self.options.desc_block) {
                    $.each(self.slides.object, function (index, slide) {
                        "use strict";
                        let translate = $(slide).data("translate_value");
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
                        let translate = $(slide).data("translate_value");
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
            let extraClass = '';
            if (!self.options.infiniteMode) extraClass = 'disabled';
            let markup = `<div class="arrow-nav">
                            <div class="slider-prev ${extraClass}">
                                <i class="fa fa-angle-left fa-4x" aria-hidden="true"></i>
                            </div>
                            <div class="slider-next">
                                <i class="fa fa-angle-right fa-4x" aria-hidden="true"></i>
                            </div>
                          </div>`;

            $(self.id).append(markup);
            $(self.id).find(".arrow-nav > div").click(function () {

                if ($(this).hasClass("slider-next")) {
                    moveSlidesLeft();
                } else {
                    moveSlidesRight();
                }
            });
        }
        function addDotNav() {
            "use strict";

            let translate_value = self.translateData.min;
            $(self.id).append(dotnav_container);

            $.each(self.slides.object, function (index) {

                if(translate_value < self.translateData.max) return 1;

                let dot_element = $("<span class='slideControl'></span>");

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
            let translate_value = self.translateData.min;
            $.each(self.slides.object, function (index, slide) {

                $(slide).data("translate_value", translate_value);
                $(slide).data("number", index);

                translate_value += self.translateData.step;
            });
        }
        function activateSlideDesc(number) {
            "use strict";
            let descClass = '.slide-' + number;
            $(self.id).find(".slide-description.active").removeClass("active");
            $(descClass).parent().css('min-height', $(descClass).outerHeight(true));
            window.setTimeout(function () {
                $(descClass).addClass('active');
            }, 250);
        }

        let self = this,
            id = this.id.slice(1),
            mc = new Hammer(document.getElementById(id)),
            dotnav_container = $("<div class='dot-nav'></div>");

        if (self.options.arrowNav) addArrowNav();
        if (self.options.dotNav) addDotNav();
        if (self.options.desc_block) addSlidesDescData();
        if (self.options.autoScroll.active) {
            let isPaused = false;

            self.options.autoScroll.handle = window.setInterval(() => {
                if (!isPaused) moveSlidesLeft();
            }, self.options.autoScroll.interval);

            $(self.id).mouseenter(() => isPaused = true);
            $(self.id).mouseleave(() => isPaused = false);
        }

        mc.on("swipeleft", function (){
            moveSlidesLeft();
        });
        mc.on("swiperight", function () {
            moveSlidesRight();
        });

    };

    Object.defineProperty(SliderConstructor.prototype, "translate", {
        set: function (value) {

            let self = this;

            self.translateData.value = value;
            anime({
                targets: this.id + " " + this.containerClass,
                translateX: value,
                easing: "easeInOutQuart",
                duration: this.options.autoScroll.animation_speed,
                complete: function(){
                    self.state = null;
                }
            });
        }
    });

    //Полная инициализация слайдера
    SliderConstructor.prototype.initializeSlider = function () {

        $(this.id).data("viewed", this.slides.viewed);

        //Данные слайдов
        this.setSlidesData();

        $(this.id).data("initSlideWidth", this.slides.maxWidth);
        $(this.id).data("initImageWidth", this.slides.imageWidth);
        $(this.id).data("initImageHeight", this.slides.imageHeight);

        //Кол. промежутков
        this.spacers.count = this.slides.count - 1;
        //Данные контейнера
        this.setContainerData();
        //Данные области отображения
        this.setViewData();
        //Данные смещение контейнера
        this.setTranslateData();
        //Вешаем обработчики
        this._initListeners();
        //Обновление навигации
        this.updateNav();
    };
    //Изменение количества отображаемых слайдов
    SliderConstructor.prototype.updateViewData = function (viewed) {
        this.slides.viewed = viewed;

        this.setViewData();
        this.setTranslateData();
    };
    //Изменение размера слайдов
    SliderConstructor.prototype.updateSlidesSize = function (maxSlideWidth, maxImageWidth, maxImageHeight) {

        this.slides.maxWidth = maxSlideWidth;
        this.slides.imageWidth = maxImageWidth;
        this.slides.imageHeight = maxImageHeight;

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
        //Обновление навигации
        this.updateNav();
    };
    SliderConstructor.prototype.updateNav = function(){

        window.clearInterval(this.options.autoScroll.handle);
        if(this.options.arrowNav) $(this.id).find('.arrow-nav').remove();
        if(this.options.dotNav) $(this.id).find('.dot-nav').remove();
        this.addNav();
    };

    slider.initializeSlider();
};