//TODO протестировать параметр минимального расстояния между слайдами при размерах сладой меньше контейнера
//TODO При нескольких слайдах в строку с заданной шириной слайда(больше, чем может поместиться), слайды не отображаются
//TODO Сделать динамическое изменение параметра height изображений (из-за этого получаются вытянутые изображения во время маштабирования изображения)
//TODO скрывать навигацию если всего одна страница слайдов
let SeoClickSlider = function (params) {

    let $ = jQuery;

    let slider = new SliderConstructor({
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
        phone: params.phone
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
            lazy_load: arg.lazy_load
        };
    }

    SliderConstructor.prototype.setSlidesData = function () {

        this.slides.object = $(this.id).find(".slide");
        //Кол. слайдов
        this.slides.count = this.slides.object.length;

        //Размер слайда
        if (this.slides.object.find('.image img').length && (!this.slides.imageWidth || !this.slides.imageHeight)) {

            let self = this;

            let img = new Image();
            img.addEventListener("load", function () {

                self.slides.imageWidth = this.naturalWidth;
                self.slides.imageHeight = this.naturalHeight;
                window.setTimeout(()=>$(self.slides.object[0]).addClass('active'), 1000);

                self.initializeSlider();
            });
            if (this.options.lazy_load){
                img.src = this.slides.object.find('.image img').attr('ref');
            }else{
                img.src = this.slides.object.find('.image img').attr('src');
            }

            return 0
        }

        this.slides.object.find('.image img').outerWidth(this.slides.imageWidth);
        this.slides.object.find('.image img').outerHeight(this.slides.imageHeight);

        if (this.slides.maxWidth === null) {
            this.slides.maxWidth = this.slides.object.outerWidth();
        }
        this.slides.object.css("height", '');
        this.slides.object.outerWidth(this.slides.maxWidth);

        this.slides.maxHeight = this.slides.object.outerHeight();
        this.calculateSlideHeight();
    };
    SliderConstructor.prototype.setViewData = function () {
        this.viewWidth = $(this.id).find(".slider-view").width();
        this.viewHeight = this.slides.maxHeight;
        $(this.id).find(".slider-view").outerHeight(this.viewHeight);
    };
    SliderConstructor.prototype.calculateSlidesSpacers = function () {
        if (this.slides.viewed !== 1) {
            this.spacers.width = (this.viewWidth - this.slides.maxWidth * this.slides.viewed) / (this.slides.viewed - 1);
            this.spacers.count = this.slides.count - 1;
            if (this.spacers.width < 0) this.spacers.width = this.spacers.min_width;
        } else {
            this.spacers.width = 0;
            this.spacers.count = 0;
        }
    };
    SliderConstructor.prototype.setContainerData = function () {
        this.containerWidth = this.slides.maxWidth * this.slides.count + this.spacers.count * this.spacers.width;
        this.container = $(this.id).find(".slides-container");
        this.container.width(this.containerWidth);
        $.each(this.slides.object, (index, slide) => {
            if (index !== this.slides.count - 1) {
                $(slide).css("margin-right", this.spacers.width);
            }
        });
    };
    SliderConstructor.prototype.setTranslateData = function () {
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
        let self = this,
            desktop = window.matchMedia(
                "(min-width: " + self.responsiveData.desktop.width + "px)"
            ),
            laptop = window.matchMedia(
                `(max-width: ${self.responsiveData.laptop.width}px) and (min-width: ${self.responsiveData.tablet.width + 1}px)`
            ),
            tablet = window.matchMedia(
                `(max-width: ${self.responsiveData.tablet.width}px) and (min-width: ${self.responsiveData.phone.width + 1}px)`
            ),
            phone = window.matchMedia(
                `(max-width: ${self.responsiveData.phone.width}px)`
            );

        let sliderResizer = function () {

                let sliderWidth = $(self.id).width(),
                    calcSlideWidth, calcImageWidth, calcImageHeight,
                    initSlideWidth = $(self.id).data("initSlideWidth"),
                    initImageWidth = $(self.id).data("initImageWidth"),
                    initImageHeight = $(self.id).data("initImageHeight");

                calcSlideWidth = sliderWidth / self.slides.viewed;

                if(calcSlideWidth > initSlideWidth) calcSlideWidth = initSlideWidth;

                let difference = initSlideWidth - calcSlideWidth,
                    ratio = initImageWidth / initImageHeight;

                if (difference < self.spacers.width && difference > 0 && self.spacers.width > self.spacers.min_width) {
                    self.updateSlidesSize(self.slides.maxWidth, self.slides.imageWidth, self.slides.imageHeight);
                } else {
                    calcImageWidth = initImageWidth - difference;
                    calcImageHeight = initImageHeight - difference / ratio;
                    calcSlideWidth = self.slides.viewed > 1 ? calcSlideWidth - self.spacers.min_width : calcSlideWidth;
                    self.updateSlidesSize(calcSlideWidth, calcImageWidth, calcImageHeight);
                }
            },
            checkDesktopQuery = function (e) {

                if (e.matches) {
                    self.updateViewData($(self.id).data("viewed"));
                }
            },
            checkLaptopQuery = function (e) {

                if (e.matches && (self.slides.viewed !== self.responsiveData.laptop.viewed)) {
                    self.updateViewData(self.responsiveData.laptop.viewed);
                }
            },
            checkTabletQuery = function (e) {

                if (e.matches && (self.slides.viewed !== self.responsiveData.tablet.viewed)) {
                    self.updateViewData(self.responsiveData.tablet.viewed);
                }
            },
            checkPhoneQuery = function (e) {

                if (e.matches && (self.slides.viewed !== self.responsiveData.phone.viewed)) {
                    self.updateViewData(self.responsiveData.phone.viewed);
                }
            };

        if (phone.matches && self.slides.viewed > self.responsiveData.phone.viewed) {
            self.updateViewData(self.responsiveData.phone.viewed);
        } else if (tablet.matches && self.slides.viewed > self.responsiveData.tablet.viewed) {
            self.updateViewData(self.responsiveData.tablet.viewed);
        } else if (laptop.matches && self.slides.viewed > self.responsiveData.laptop.viewed) {
            self.updateViewData(self.responsiveData.laptop.viewed);
        } else if (desktop.matches) {
            self.updateViewData($(self.id).data("viewed"));
        }

        phone.addListener(checkPhoneQuery);
        tablet.addListener(checkTabletQuery);
        laptop.addListener(checkLaptopQuery);
        desktop.addListener(checkDesktopQuery);

        if (self.options.lazy_load && 'IntersectionObserver' in window &&
            'IntersectionObserverEntry' in window &&
            'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
            let lazy_flag = true,
                image_observer_callback = function (entries, observer) {

                    entries.forEach(function (entry) {

                        let isIntersecting = entry.isIntersecting;

                        if (isIntersecting) {
                            $(entry.target).attr('src', $(entry.target).attr('ref'));
                            if (lazy_flag) {
                                $(entry.target).load(function () {
                                    self.slides.maxHeight = self.slides.object.find('img').outerHeight(true);
                                    sliderResizer();
                                });
                                lazy_flag = false;
                            }
                            observer.disconnect();
                        }
                    });
                },
                slider_observer = new IntersectionObserver(function (entries, observer) {

                    entries.forEach(function (entry) {

                        let isIntersecting = entry.isIntersecting;
                        if (isIntersecting) {
                            let images = $(self.id).find('.slide img');
                            $.each(images, function (index, image) {

                                let image_observer = new IntersectionObserver(image_observer_callback, {
                                    root: $(self.id).get(0),
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
            slider_observer.observe(document.getElementById(self.id.slice(1)));
        } else if (self.options.lazy_load) {
            let images = $(self.id).find('.slide img');

            $.each(images, function (index, image) {
                $(image).attr('src', $(image).attr('ref'));
            });
        }
        sliderResizer();
        $(window).load(function(){

            sliderResizer();
        });
        $(window).resize(sliderResizer);
    };
    SliderConstructor.prototype.addNav = function () {

        function moveSlidesLeft() {

            if (self.state !== null) return 0;
            self.state = 'animated';

            let x = self.translateData.value + self.translateData.step,
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

            if (self.state !== null) return 0;
            self.state = 'animated';

            let x = self.translateData.value - self.translateData.step,
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
            let extraClass = '', markup;

            if (!self.options.infiniteMode) extraClass = 'disabled';

            if (!self.options.arrowsMarkup) {
                markup = `<div class="arrow-nav">
                            <div class="slider-prev ${extraClass}">
                                <i class="fa fa-angle-left fa-4x" aria-hidden="true"></i>
                            </div>
                            <div class="slider-next">
                                <i class="fa fa-angle-right fa-4x" aria-hidden="true"></i>
                            </div>
                          </div>`;
            } else {
                markup = `<div class="arrow-nav">
                            <div class="slider-prev ${extraClass}">
                                ${self.options.arrowsMarkup.left}
                            </div>
                            <div class="slider-next">
                                ${self.options.arrowsMarkup.right}
                            </div>
                          </div>`;
            }


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

                if (translate_value > self.translateData.max) return 1;

                let dot_element = $("<span class='slideControl'></span>");

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

            if(self.options.autoScroll.handle) window.clearInterval(self.options.autoScroll.handle);

            let isPaused = false;

            self.options.autoScroll.handle = window.setInterval(() => {
                if(!isPaused) self.options.autoScroll.counter++;
                if (self.options.autoScroll.counter === self.options.autoScroll.interval){
                    moveSlidesLeft();
                    self.options.autoScroll.counter = null;
                }
            }, 1000);

            $(self.id).mouseenter(() => isPaused = true);
            $(self.id).mouseleave(() => isPaused = false);
        }

        mc.on("swipeleft", function () {
            moveSlidesLeft();
        });
        mc.on("swiperight", function () {
            moveSlidesRight();
        });

    };

    Object.defineProperty(SliderConstructor.prototype, "translate", {
        set: function (value) {

            let set_active_slide = ()=>{

                $(this.id).find(".slide.active").removeClass("active");

                $.each($(this.slides.object), function(index, slide){

                    if(slide.getBoundingClientRect().x === 0){
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
                complete: ()=> {
                    this.state = null;
                    set_active_slide();
                    this.options.autoScroll.counter = 0;
                }
            });
        }
    });

    //Полная инициализация слайдера
    SliderConstructor.prototype.initializeSlider = function () {
        $(this.id).data("viewed", this.slides.viewed);

        //Данные слайдов
        this.setSlidesData();

        if (this.slides.object.find('.image img').length && (!this.slides.imageWidth || !this.slides.imageHeight)) return 0;

        $(this.id).data("initSlideWidth", this.slides.maxWidth);
        $(this.id).data("initImageWidth", this.slides.imageWidth);
        $(this.id).data("initImageHeight", this.slides.imageHeight);

        //Данные области отображения
        this.setViewData();
        //Расчитываем промежутки мехду слайдами
        this.calculateSlidesSpacers();
        //Данные контейнера слайдов
        this.setContainerData();
        //Данные смещение контейнера
        this.setTranslateData();
        //Вешаем обработчики
        this._initListeners();
        //Обновление навигации
        this.updateNav();
    };
    //Изменение количества отображаемых слайдов
    SliderConstructor.prototype.updateViewData = function (viewed) {
        this.slides.viewed = parseInt(viewed, 10);

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
        //Данные области отображения
        this.setViewData();
        //Расчитываем промежутки мехду слайдами
        this.calculateSlidesSpacers();
        //Данные контейнера
        this.setContainerData();
        //Данные смещение контейнера
        this.setTranslateData();
        //Обновление навигации
        this.updateNav();
    };
    SliderConstructor.prototype.updateNav = function () {

        if (this.options.arrowNav) $(this.id).find('.arrow-nav').remove();
        if (this.options.dotNav) $(this.id).find('.dot-nav').remove();
        this.addNav();
    };
    //Вычисляем высоту слайдов
    SliderConstructor.prototype.calculateSlideHeight = function () {

        $.each(this.slides.object, (index, slide) => {

            let height = $(slide).outerHeight(true);

            if (height > this.slides.maxHeight) this.slides.maxHeight = height;
        });
        this.slides.object.outerHeight(this.slides.maxHeight);
    };

    slider.initializeSlider();
};