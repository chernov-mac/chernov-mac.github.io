(function($) {

    // Options

    var options = {
        devmode: false,
        controls: {
            scale: {
                enable: true,
                label: 'Масштаб'
            }
        }
    };

    // Elements

    var
        $window = $(window),
        scheme = document.getElementById('DataCopy'),
        $scheme = $(scheme),
        $placeholder = $('#ZoomPlaceholder'),
        $helper = $('#helper'),
        $schemeWrap, $helperWrap,
        $scaleControl, $scaleStatus, $scaleMinus, $scalePlus;


    // Global variables

    var
        schemeSize,
        placeholderSize,
        ratio,
        proportion,
        originalSizeOut,
        vision,
        scaleRange,
        helperIsDesabled;

    var lastTransition;


    // Dev

    if (options.devmode) {
        var $zoomCenterElem = $('<div class="zoomCenterElem"><i class="icon-times"></i></div>');
        $zoomCenterElem.css({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate3d(-50%, -50%, 0) rotate(45deg)',
            display: 'block',
            width: '40px',
            height: '40px',
            lineHeight: '40px',
            fontSize: '16px',
            textAlign: 'center',
            color: '#ffc800',
            textShadow: '0 3px 18px rgba(0,0,0,0.74)'
        });
        $placeholder.append($zoomCenterElem);
    }


    // Init

    $schemeWrap = $placeholder.wrap('<div class="scheme-wrapper"></div>').closest('.scheme-wrapper');
    $helperWrap = $helper.parent().wrap('<div class="helper-wrapper"></div>').closest('.helper-wrapper');

    setGlobals();

    var schemeManager = new Hammer(scheme);
    schemeManager.get('pan').set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    });

    var lastTransform = 'translate3d(-' + (originalSizeOut.x / 2) + 'px, -' + (originalSizeOut.y / 2) + 'px, 0) scale(1)';
    setSchemePanzoom();
    var schemeIsDragging = false;
    var schemeLastPos = getPos($scheme);
    var lastScale = getScale();
    var lastPosRange = getSchemePosRange(lastScale);

    if ($scaleStatus) {
        placeScaleControl();
        updateScaleStatus();
    }

    setHelperParentSize();
    setTimeout(function(){
        setHelperSize(scaleRange.min);
        // Move helper
        var curPos = getPos($scheme);
        var curScale = getScale();
        var schemeDistance = getSchemeDistance(curPos, curScale);
        setHelperDistance(schemeDistance, getScale());
    }, 100);

    $helper.css({
        display: 'block',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }).addClass('panzoom').panzoom({
        startTransform: 'translate3d(' + (getSizeOut().x / 2 / getScale() / proportion) + 'px, 0, 0)',
        disableZoom: true
    });

    if (options.controls.scale.enable) {
        addScaleControls();
    }


    // Events

    $window.on('resize', function(){
        setGlobals();
        placeScaleControl();
    });

    $placeholder.on('mousewheel.focal', function(e) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        $scheme.panzoom('zoom', zoomOut, {
            increment: 0.1,
            animate: false,
            focal: e
        });

        $(".popover").popover('update');
    });

    $scheme.on('panzoomzoom', function(e, panzoom, scale, opts){
        // Correct scale
        var isOutOfRange = isOutOfScaleRange(scale, scaleRange);

        if (isOutOfRange && isOutOfRange == 'min') { scale = scaleRange.min; }
        if (isOutOfRange && isOutOfRange == 'max') { scale = scaleRange.max; }
        if (isOutOfRange) {
            $scheme.panzoom('zoom', scale);
            return;
        }

        lastScale = scale;
        lastPosRange = getSchemePosRange(scale);

        if ($scaleStatus) { updateScaleStatus(); }

        // Correct position
        var curPos = getPos($scheme);
        var curPosRange = getSchemePosRange(scale);
        correctSchemePos(curPos, curPosRange);

        // Move helper
        curPos = getPos($scheme);
        var schemeDistance = getSchemeDistance(curPos, scale);
        setHelperDistance(schemeDistance, scale);
    });
    // $scheme.on('panzoompan', function(e, panzoom, x, y) {
    //     // Correct position
    //     var curPosRange = getSchemePosRange(panzoom.scale);
    //     correctSchemePos({x: x, y: y}, curPosRange);
    //
    //     // Move helper
    //     var curPos = getPos($scheme);
    //     var schemeDistance = getSchemeDistance(curPos, panzoom.scale);
    //     setHelperDistance(schemeDistance, panzoom.scale);
    //
    //     $(".popover").popover('update');
    // });
    schemeManager.on('pan', handleSchemePan);

    $scheme.find('div').on('mousedown touchstart', function(e) {
        e.stopImmediatePropagation();
        if ($(this).hasClass('place') && !$(this).hasClass('empty_label')) { $(this).popover('show'); }
    });
    $scheme.on('mousedown touchstart', function(e) {
        e.stopImmediatePropagation();
        if (!e.target.closest(".place")) { $(".place").popover('hide'); }
    });

    $helper.on('panzoompan', function(e, panzoom, x, y){
        // Correct position
        var curPosRange = getHelperPosRange();
        correctHelperPos({x: x, y: y}, curPosRange);

        // Move scheme
        var curPos = getPos($helper);
        var helperDistance = getHelperDistance(curPos);
        setSchemeDistance(helperDistance);
    });

    if ($scaleStatus) {
        $scaleMinus.on('click', function(e){ changeScale(-0.1); });
        $scalePlus.on('click', function(e){ changeScale(0.1); });
    }


    // Functions

    // Common
    function setGlobals() {
        schemeSize = {
            width: $scheme.width(),
            height: $scheme.height()
        };
        placeholderSize = {
            width: $placeholder.width(),
            height: $placeholder.height()
        };
        ratio = schemeSize.width / schemeSize.height;
        proportion = schemeSize.width / $helper.parent().width();
        originalSizeOut = getSizeOut(1);
        vision = {
            x: placeholderSize.width / schemeSize.width,
            y: placeholderSize.height / schemeSize.height
        };
        scaleRange = {
            min: placeholderSize.width / schemeSize.width,
            max: 5
        };
        helperIsDesabled = $(window).width() < 992 ? true : false;

        if (ratio < 1) {
            scaleRange.min = placeholderSize.height / schemeSize.height;
        }
    }
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function isOutOfPosRange(curPos, curPosRange) {
        var isOut = {
            x: false,
            y: false
        };

        // Check X
        if (curPos.x < curPosRange.x.min) { isOut.x = curPosRange.x.min; }
        if (curPos.x > curPosRange.x.max) { isOut.x = curPosRange.x.max; }
        // console.log(curPosRange.x);
        // console.log(curPos.x);

        // Check Y
        if (curPos.y < curPosRange.y.min) { isOut.y = curPosRange.y.min; }
        if (curPos.y > curPosRange.y.max) { isOut.y = curPosRange.y.max; }

        return isOut;
    }
    function isOutOfScaleRange(scale, range) {
        if (scale < range.min) {
            return 'min';
        }
        if (scale > range.max) {
            return 'min';
        }
        return false;
    }
    function getScale() {
        var matrix = $scheme.panzoom('getMatrix');
        return matrix[0];
    }
    function getPos(elem) {
        var matrix = elem.panzoom('getMatrix');
        return {
            x: parseFloat(matrix[4]),
            y: parseFloat(matrix[5])
        };
    }
    function addScaleControls() {
        var $controlLabel = $('<div class="scheme-control__label">' + options.controls.scale.label + ': </div>');
        $scaleControl = $('<div class="scheme-control scale-control"></div>');
        $scaleStatus = $('<div class="scale-control__status"></div>');
        $scaleMinus = $('<div class="scale-control__btn scale-control__btn--minus">-</div>');
        $scalePlus = $('<div class="scale-control__btn scale-control__btn--plus">+</div>');

        $scaleControl
            .append($controlLabel)
            .append($scaleMinus)
            .append($scaleStatus)
            .append($scalePlus);

        placeScaleControl();
        updateScaleStatus();
    }
    function updateScaleStatus() {
        lastScale = getScale();
        $scaleStatus.html(Math.round(lastScale * 100) + '%');
    }
    function placeScaleControl() {
        if ($(window).width() < 992) {
            $schemeWrap.prepend($scaleControl.detach());
        } else {
            $helperWrap.append($scaleControl.detach());
        }
    }
    function changeScale(diff) {
        diff = parseFloat(diff);
        lastScale = parseFloat(lastScale);

        if (lastScale >= 2) {
            diff *= 5;
        }

        var panzoom = $scheme.panzoom('instance');
        panzoom.zoom(lastScale + diff);
        updateScaleStatus();
    }

    // Scheme
    function setSchemePanzoom() {
        $scheme.addClass('panzoom').panzoom({
            startTransform: lastTransform,
            increment: 0.1,
            minScale: scaleRange.min,
            maxScale: scaleRange.max,
            // disablePan: true
        });
    }
    function getSizeOut(scale) {
        return {
            x: schemeSize.width * scale - placeholderSize.width,
            y: schemeSize.height * scale - placeholderSize.height
        };
    }
    function getSchemePosRange(scale) {
        var sizeOut = getSizeOut(scale);
        var posRange = {
            x: {
                min: - sizeOut.x / 2 - originalSizeOut.x / 2,
                max: sizeOut.x / 2 - originalSizeOut.x / 2
            },
            y: {
                min: - sizeOut.y / 2 - originalSizeOut.y / 2,
                max: sizeOut.y / 2 - originalSizeOut.y / 2
            }
        };

        var delta;
        if (ratio < 1 && scale < (placeholderSize.width / schemeSize.width)) {
            delta = placeholderSize.width - schemeSize.width * scale;
            posRange.x.min -= delta;
            posRange.x.max += delta;
        }
        if (ratio > 1 && scale < (placeholderSize.height / schemeSize.height)) {
            delta = placeholderSize.height - schemeSize.height * scale;
            posRange.y.min -= delta;
            posRange.y.max += delta;
        }

        return posRange;
    }
    function getSchemeDistance(pos, scale) {
        var range = getSchemePosRange(scale);
        var maxDistance = {
            x: range.x.max - range.x.min,
            y: range.y.max - range.y.min
        };
        var curDistance = {
            x: Math.round((pos.x - range.x.min) / maxDistance.x * 1000) / 1000,
            y: Math.round((pos.y - range.y.min) / maxDistance.y * 1000) / 1000
        };
        if (maxDistance.x === 0) { curDistance.x = 0; }
        if (maxDistance.y === 0) { curDistance.y = 0; }
        return curDistance;
    }
    function correctSchemePos(pos, curPosRange) {
        var schemeOutOfPosRange = isOutOfPosRange(pos, curPosRange);

        if (isNumeric(schemeOutOfPosRange.x) || isNumeric(schemeOutOfPosRange.y)) {
            if (isNumeric(schemeOutOfPosRange.x)) { pos.x = schemeOutOfPosRange.x; }
            if (isNumeric(schemeOutOfPosRange.y)) { pos.y = schemeOutOfPosRange.y; }
            setSchemePos(pos);
        }
    }
    function setSchemePos(pos) {
        // $scheme.panzoom('setMatrix', [scale, 0, 0, scale, pos.x, pos.y]);
        // $scheme.panzoom('setTransform', 'translate3d(' + pos.x + 'px, ' + pos.y + 'px, 0) scale(' + scale + ')');
        var panzoom = $scheme.panzoom('instance');
        if (panzoom) {
            panzoom.setMatrix([panzoom.scale, 0, 0, panzoom.scale, pos.x, pos.y], {
                silent: true
            });
        }
        $scheme.css({
            transform: 'translate3d(' + pos.x + 'px, ' + pos.y + 'px, 0) scale(' + lastScale + ')'
        });
    }
    function setSchemeDistance(helperDistance) {
        // var curScale = getScale();
        var curScale = lastScale;
        var range = getSchemePosRange(curScale);
        var pos = {
            x: range.x.min + Math.round((range.x.max - range.x.min) * (1 - helperDistance.x) * 100) / 100,
            y: range.y.min + Math.round((range.y.max - range.y.min) * (1 - helperDistance.y) * 100) / 100
        };

        if (ratio < 1 && curScale < (placeholderSize.width / schemeSize.width)) {
            // pos.x = getPos($scheme).x;
            pos.x = schemeLastPos.x;
        }
        if (ratio > 1 && curScale < (placeholderSize.height / schemeSize.height)) {
            // pos.y = getPos($scheme).y;
            pos.y = schemeLastPos.y;
        }

        setSchemePos(pos);
        correctSchemePos(pos, range);
    }

    function handleSchemePan(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!schemeIsDragging) {
            schemeIsDragging = true;
            schemeLastPos = getPos($scheme);
            lastScale = getScale();
            lastTransform = $scheme.panzoom('getTransform');

            $scheme.panzoom('destroy');

            $scheme.addClass('dragging');
        }

        var curPos = {
            x: schemeLastPos.x + ev.deltaX,
            y: schemeLastPos.y + ev.deltaY
        };
        setSchemePos(curPos);
        correctSchemePos(curPos, lastPosRange);

        // Move helper
        if (!helperIsDesabled) {
            var schemeDistance = getSchemeDistance(curPos, lastScale);
            setHelperDistance(schemeDistance, lastScale);
        }

        $(".popover").popover('update');

        // DRAG ENDED
        if (ev.isFinal) {
            lastTransform = 'translate3d(' + curPos.x + 'px, ' + curPos.y + 'px, 0) scale(' + lastScale + ')';
            setSchemePanzoom();
            schemeIsDragging = false;
            schemeLastPos = getPos($scheme);
            lastScale = getScale();

            $scheme.removeClass('dragging');
        }
    }

    // Helper
    function getHelperPosRange() {
        return {
            x: {
                min: 0,
                max: Math.floor($helper.parent().width() - $helper.outerWidth())
            },
            y: {
                min: 0,
                max: Math.floor($helper.parent().height() - $helper.outerHeight())
            }
        };
    }
    function getHelperDistance(pos) {
        var range = getHelperPosRange();
        var curDistance = {
            x: Math.round(pos.x / range.x.max * 1000) / 1000,
            y: Math.round(pos.y / range.y.max * 1000) / 1000
        };
        if (range.x.max === 0) { curDistance.x = 0; }
        if (range.y.max === 0) { curDistance.y = 0; }
        return curDistance;
    }
    function setHelperParentSize() {
        var deltaSizeY = ($helper.parent().outerHeight() - $helper.parent().height());
        $helper.parent().css({
            position: 'relative',
            display: 'block',
            width: '100%',
            height: Math.round($helper.parent().width() / ratio) + deltaSizeY + 'px'
        });
    }
    function setHelperSize(scale) {
        if (!scale) scale = curOpts.scale;
        var helperSize = {
            width: $helper.parent().width() * (vision.x < 1 ? vision.x : 1),
            height: $helper.parent().height() * (vision.y < 1 ? vision.y : 1)
        };

        helperSize.width *= 1 / scale;
        if (helperSize.width > $helper.parent().width()) helperSize.width = $helper.parent().width();

        helperSize.height *= 1 / scale;
        if (helperSize.height > $helper.parent().height()) helperSize.height = $helper.parent().height();

        $helper.css({
            width: helperSize.width + 'px',
            height: helperSize.height + 'px'
        });
    }
    function setHelperDistance(schemeDistance, scale) {
        setHelperSize(scale);

        var range = getHelperPosRange();
        var pos = {
            x: Math.round(range.x.max * (1 - schemeDistance.x) * 100) / 100,
            y: Math.round(range.y.max * (1 - schemeDistance.y) * 100) / 100
        };
        setHelperPos(pos);
        correctHelperPos(pos, range);
    }
    function setHelperPos(pos) {
        $helper.panzoom('setMatrix', [1, 0, 0, 1, pos.x, pos.y]);
    }
    function correctHelperPos(pos, curPosRange) {
        var helperOutOfPosRange = isOutOfPosRange(pos, curPosRange);

        if (isNumeric(helperOutOfPosRange.x) || isNumeric(helperOutOfPosRange.y)) {
            if (isNumeric(helperOutOfPosRange.x)) { pos.x = helperOutOfPosRange.x; }
            if (isNumeric(helperOutOfPosRange.y)) { pos.y = helperOutOfPosRange.y; }
            setHelperPos(pos);
        }
    }


})(jQuery);
