/**
 * Created by Administrator on 2016/5/10.
 */
(function($) {
    var lightBox = function() {
        var self = this;
        // 创建遮罩和弹出层
        this.mask = $("<div id='mask'>");
        this.popUp = $("<div class='photo_border'>");

        this.bodyNode = $("body");

        this.groupName = null;
        this.groupData = [];

        this.index = 0;
        this.flag = true;

        //渲染DOM，并且插入到body
        this.renderDOM();

        this.picViewArea = this.popUp.find("div.photo");

        this.popPic = this.popUp.find("img.photo_image");

        this.preBtn = this.popUp.find("span.photo_pre_btn");
        this.nextBtn = this.popUp.find("span.photo_next_btn");

        this.captionArea = this.popUp.find("div.caption");
        this.captionText = this.popUp.find("p.title");
        this.curIndex = this.popUp.find("p.index");
        this.closeBtn = this.popUp.find("span.caption_close_btn");


        // 准备事件委托，获取组数据
        this.bodyNode.on("click", ".js-lightBox,*[data-role=lightbox]", function(event) {
            event.stopPropagation();
            var curName = $(this).attr("data-group");
            if (curName != self.groupName) {
                self.groupName = curName;
                self.getGroup();
            }

            self.popUpInit($(this));

        });
        this.bodyNode.on("click", "#mask,.caption_close_btn", function(event) {
            event.stopPropagation();

            self.mask.fadeOut();
            self.popUp.fadeOut();
            self.popPic.fadeOut();
            self.captionArea.fadeOut();
        });
        this.nextBtn.on("mouseover", function(event) {
            event.stopPropagation();
            if (!$(this).hasClass("disabled"))
                $(this).addClass("photo_next_btn_show")
        })
        this.preBtn.on("mouseover", function(event) {
            event.stopPropagation();
            if (!$(this).hasClass("disabled"))
                $(this).addClass("photo_pre_btn_show")
        })
        this.nextBtn.on("mouseout", function(event) {
            event.stopPropagation();
            if (!$(this).hasClass("disabled"))
                $(this).removeClass("photo_next_btn_show")
        })
        this.preBtn.on("mouseout", function(event) {
            event.stopPropagation();
            if (!$(this).hasClass("disabled"))
                $(this).removeClass("photo_pre_btn_show")
        })
        this.picViewArea.on("click", ".photo_pre_btn,.photo_next_btn", function(event) {
            event.stopPropagation();
            if (!$(this).hasClass("disabled") && $(this).hasClass("photo_pre_btn") && self.flag) {
                self.flag = false;
                self._goTo("pre");
            } else if (!$(this).hasClass("disabled") && $(this).hasClass("photo_next_btn") && self.flag) {
                self._goTo("next");
                self.flag = false;

            }
        })


    };
    lightBox.prototype = {
        constructor:lightBox,
        renderDOM: function() {
            var stringDom = '<div class="photo">' +
                '<img class="photo_image" src="">' +
                '<span class="photo_btn photo_pre_btn"></span>' +
                '<span class="photo_btn photo_next_btn"></span>' +
                '</div>' +
                '<div class="caption">' +
                '<div class="caption_left">' +
                '<p class="title">好山好水</p>' +
                '<p class="index">当前索引:0/0</p>' +
                '</div>' +
                '<span class="caption_close_btn"></span>' +
                '</div>';
            this.popUp.html(stringDom);

            //把遮罩和弹出层插入到文档中

            this.bodyNode.append(this.mask, this.popUp);
        },
        getGroup: function() {
            var self = this;

            /*根据当前组别获取同一组别的对象*/

            var groupList = this.bodyNode.find("*[data-group=" + this.groupName + "]");
            this.groupData.length = 0; //清空数组
            groupList.each(function() {
                self.groupData.push({
                    src: $(this).attr("data-source"),
                    id: $(this).attr("data-id"),
                    caption: $(this).attr("data-caption")
                })
            })

        },
        popUpInit: function(curObj) {
            var sourceSrc = curObj.attr("data-source");
            var curId = curObj.attr("data-id");
            this.showMaskandpopUP(sourceSrc, curId);
        },
        showMaskandpopUP: function(sourceSrc, curId) {
            var self = this;
            var winWidth = $(window).width(),
                winHeight = $(window).height();

            this.mask.fadeIn(); //显示遮罩
            this.popUp.css({
                "display": "block"
            }); //显示图片区域

            this.captionArea.hide(); //隐藏评论区域

            this.picViewArea.css({
                width: winWidth / 2,
                height: winHeight / 2,
            })


            this.popUp.css({
                width: winWidth / 2 + 10,
                height: winHeight / 2 + 10,
                marginLeft: -(winWidth / 2 + 10) / 2,
                top: -(winHeight / 2 + 10)
            }).animate({
                top: (winHeight / 2 - 10) / 2
            }, function() {
                self._loadPicSize(sourceSrc);
            });

            this.index = this._getIndexof(curId);
            this._addDisabled();

        },
        _getIndexof: function(curId) {
            var index = 0;
            $.each(this.groupData, function(i, value) {

                index = i;
                if (value.id == curId)
                    return false;
            })
            return index;
        },
        _addDisabled: function() {
            if (this.index === 0 && this.index !== this.groupData.length - 1) {
                this.preBtn.addClass("disabled").removeClass("photo_pre_btn_show");
                this.nextBtn.removeClass("disabled");
            }
            if (this.index !== 0 && this.index === this.groupData.length - 1) {
                this.preBtn.removeClass("disabled");
                this.nextBtn.addClass("disabled").removeClass("photo_next_btn_show");
            }
            if (this.index === 0 && this.index === this.groupData.length - 1) {
                this.preBtn.addClass("disabled").removeClass("photo_pre_btn_show");
                this.nextBtn.addClass("disabled").removeClass("photo_next_btn_show");
            }
            if (this.index !== 0 && this.index !== this.groupData.length - 1) {
                this.preBtn.removeClass("disabled");
                this.nextBtn.removeClass("disabled");
            }

        },
        _loadPicSize: function(sourceSrc) {
            var self = this;
            self.popPic.css({
                width: "auto",
                height: "auto",
                display: "none"
            })
            this._preLoadImg(sourceSrc, function() {

                self.popPic.attr({
                    "src": sourceSrc
                });
                self._changePicSize(self.popPic.width(), self.popPic.height())
            })

        },
        _preLoadImg: function(src, callback) {
            var img = new Image();
            if (!!window.ActiveXObject) {
                img.onreadystatechange = function() {
                    if (this.readyState == "complete") {
                        callback();
                    }
                }
            } else {
                img.onload = function() {
                    callback();
                }
            };
            img.src = src;
        },
        _changePicSize: function(width, height) {
            var self = this;
            var winHeight = $(window).height(),
                winWidth = $(window).width();
            //如果图片原始宽高比大于视口的宽高比
            var scale = Math.min(winWidth / (width + 10), winHeight / (height + 10), 1)

            width = scale * width;
            height = scale * height;


            this.picViewArea.animate({
                width: width - 10,
                height: height - 10
            });

            this.popUp.animate({
                width: width,
                height: height,
                marginLeft: -width / 2,
                top: (winHeight - height) / 2
            }, function() {
                self.popPic.css({
                    width: width - 10,
                    height: height - 10
                }).fadeIn();
                self.captionArea.fadeIn();
                self.flag = true;
            })
            //设置描述文字和索引
            this.captionText.text(this.groupData[this.index].caption);
            this.curIndex.text("当前索引: " + (this.index + 1) + "/" + this.groupData.length);

        },
        _goTo: function(dire) {
            if (dire == "pre") {
                this.index--;
                this._addDisabled();
                this._loadPicSize(this.groupData[this.index].src);


            } else {
                this.index++;
                this._addDisabled();
                this._loadPicSize(this.groupData[this.index].src);
            }

        }
    };
    window["lightBox"] = lightBox;
}(jQuery));