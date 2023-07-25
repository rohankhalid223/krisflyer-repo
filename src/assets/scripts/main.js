var isRTL = ($('html').attr('dir') == "rtl") ? true : false,
    winWidth = $(window).width(),
    winHeight = $(window).height();

$(function() {
    browserDetect();
    dataTrim();
});

$(window).on('load', function() {
    // Do after Page ready
    ChangeToSvg();
});

$(window).on('resize orientationchange', function() {
    // Do on resize
    winWidth = $(window).width(),
    winHeight = $(window).height();
});

$(window).on('scroll', function() {
    //Do on Scroll
});

$(document).keyup(function(e) {
    if (e.keyCode == 27) {
        //Do on ESC press
    }
});

function browserDetect() {
    navigator.sayswho = (function() {
        var ua = navigator.userAgent,
            tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join('').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();
    $('body').addClass(navigator.sayswho);
}

function ChangeToSvg() {
    $('img.js-tosvg').each(function () {
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
        $.get(imgURL, function (data) {
            var $svg = $(data).find('svg');
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' insvg');
            }
            $svg = $svg.removeAttr('xmlns:a');
            if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }
            $img.replaceWith($svg);
        }, 'xml');
    });
}

function dataTrim() {
    var ellipsis = "...";
    $('[data-trim]').each(function () {
        var text = $(this).html();
        var charLimit = parseInt($(this).attr('data-trim'));
        $(this).html(TrimLength(text, charLimit));
        $(this).addClass('is--trimmed');
    });

    function TrimLength(text, maxLength) {
        text = $.trim(text);
        if (text.length > maxLength) {
            text = text.substring(0, maxLength - ellipsis.length);
            return text.substring(0, text.lastIndexOf(" ")) + ellipsis;
        } else return text;
    }
}

