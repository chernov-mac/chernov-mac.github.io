(function() {

    // Элементы
    var $mainData = $('#MainData');
    var helper = document.getElementById('helper'),
        $helper = $(helper);
    var $zoomPlaceholder = $('#ZoomPlaceholder');
    var dataCopy = document.getElementById('DataCopy'),
        $dataCopy = $(dataCopy);

    // Соотношение сторон схемы
    var ratio = $dataCopy.width() / $dataCopy.height();

    // Пропорция между #ZoomPlaceholder и #MainData
    var proportion = $zoomPlaceholder.width() / $mainData.width();

    // Позиция #DataCopy относительно $zoomPlaceholder в виде {top: int, left: int}
    var dataCopyPos = getDataCopyPos();

    // Позиция #helper относительно $MainData в виде {top: int, left: int}
    var helperPos = getHelperPos();

    // Запоминаем позиции и масштаб
    var helperLastPos = {
        x: helperPos.x,
        y: helperPos.y
    };
    var dataCopyLastPos = {
        x: helperPos.x,
        y: helperPos.y
    };
    var helperIsDragging = false;
    var dataCopyIsDragging = false;
    var scale = 1;
    var helperTranslate = 'translate3d(' + Math.round(helperLastPos.x) + 'px, ' + Math.round(helperLastPos.y) + 'px, 0)';
    var dataCopyTranslate = 'translate3d(' + Math.round(dataCopyLastPos.x) + 'px, ' + Math.round(dataCopyLastPos.y) + 'px, 0)';


    // ----------------------
    // Инициализация
    // ----------------------

    $helper.css({ position: 'absolute', top: 0, left: 0 });
    $dataCopy.css({ position: 'relative', top: 0, left: 0 });
    setMainDataSize();
    setHelperSize();
    setHelperPos();
    addControls();

    // Ограничения на перемещения
    var maxHelperPos = getHelperMaxPos();
    var maxDataCopyPos = getDataCopyMaxPos();

    // Коэффициент отношения видимой части схемы ко всей схеме в виде {x: float, y: float}
    var vision = getVision();


    // ----------------------
    // Инициализация событий
    // ----------------------

    // #helper handlers

    var helperManager = new Hammer.Manager(helper, {
		transform_always_block: true,
		transform_min_scale: 1,
		drag_block_horizontal: true,
		drag_block_vertical: true,
		drag_min_distance: 0
	});
    helperManager.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    }));
    helperManager.on('pan', handleHelperDrag);

    // #DataCopy handlers

    var dataCopyManager = new Hammer.Manager(dataCopy, {
		transform_always_block: true,
		transform_min_scale: 1,
		drag_block_horizontal: true,
		drag_block_vertical: true,
		drag_min_distance: 0
	});
    dataCopyManager.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 5
    }));
    dataCopyManager.on('pan', handleDataCopyDrag);
    $zoomPlaceholder.find('.control-scale__btn--minus').on('click', function(){
        changeScale(-0.25);
    });
    $zoomPlaceholder.find('.control-scale__btn--plus').on('click', function(){
        changeScale(0.25);
    });


    // ----------------------
    // Функции
    // ----------------------

    function getVision() {
        return {
            x: $zoomPlaceholder.width() / $dataCopy.width(),
            y: $zoomPlaceholder.height() / $dataCopy.height()
        };
    }

    function getHelperMaxPos() {
        var deltaSize = {
            x: ($mainData.outerWidth() - $mainData.width()) / 2,
            y: ($mainData.outerHeight() - $mainData.height()) / 2
        };
        return {
            x: {
                // min: 0,
                // max: $mainData.width() - $helper.width() - (deltaSize.x * 2)
                min: ($helper.width() * (1 / scale) - $helper.width()) / 2,
                max: $mainData.width() - ($helper.width() * (1 / scale)) + (($helper.width() * (1 / scale) - $helper.width()) / 2) - (deltaSize.x * 2)
            },
            y: {
                // min: 0,
                // max: $mainData.height() - $helper.height() - (deltaSize.y * 2)
                min: ($helper.height() * (1 / scale) - $helper.height()) / 2,
                max: $mainData.height() - ($helper.height() * (1 / scale)) + (($helper.height() * (1 / scale) - $helper.height()) / 2) - (deltaSize.y * 2)
            }
        };
    }

    function getDataCopyMaxPos() {
        return {
            x: {
                min: - ($dataCopy.width() - $zoomPlaceholder.width()),
                max: 0
            },
            y: {
                min: - ($dataCopy.height() - $zoomPlaceholder.height()),
                max: 0
            }
        };
    }

    function getDataCopyPos() {
        var deltaSize = {
            x: ($zoomPlaceholder.outerWidth() - $zoomPlaceholder.width()) / 2,
            y: ($zoomPlaceholder.outerHeight() - $zoomPlaceholder.height()) / 2
        };
        return {
            x: $dataCopy.offset().left - $zoomPlaceholder.offset().left - deltaSize.x,
            y: $dataCopy.offset().top - $zoomPlaceholder.offset().top - deltaSize.y
        };
    }

    function getHelperPos() {
        // return {
        //     x: $helper.offset().left - $mainData.offset().left,
        //     y: $helper.offset().top - $mainData.offset().top
        // };
        return {
            x: $helper.offset().left - $mainData.offset().left + (($helper.width() * (1 / scale) - $helper.width()) / 2),
            y: $helper.offset().top - $mainData.offset().top + (($helper.width() * (1 / scale) - $helper.width()) / 2)
        };
    }

    function setMainDataSize() {
        $mainData.css({
            height: ($mainData.width() / ratio) + 'px'
        });
    }

    function setHelperSize() {
        vision = getVision();
        $helper.css({
            width: ($mainData.width() * vision.x) + 'px',
            height: ($mainData.height() * vision.y) + 'px'
        });
    }

    function setHelperPos(actualPos) {
        if (!actualPos) {
            vision = getVision();
            dataCopyPos = getDataCopyPos();

            actualPos = {
                x: dataCopyPos.x * vision.x,
                y: dataCopyPos.y * vision.y
            };
        }
        // console.log(actualPos);
        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        maxHelperPos = getHelperMaxPos();
        if (actualPos.x < maxHelperPos.x.min) actualPos.x = maxHelperPos.x.min;
        if (actualPos.y < maxHelperPos.y.min) actualPos.y = maxHelperPos.y.min;
        if (actualPos.x > maxHelperPos.x.max) actualPos.x = maxHelperPos.x.max;
        if (actualPos.y > maxHelperPos.y.max) actualPos.y = maxHelperPos.y.max;
        // console.log(actualPos);

        // Двигаем элемент до нужной позиции
        helperTranslate = 'translate3d(' + Math.round(actualPos.x) + 'px, ' + Math.round(actualPos.y) + 'px, 0)';
        applyHelperTransform();
    }

    function setDataCopyPos(actualPos) {
        if (!actualPos) {
            actualPos = {
                x: 0,
                y: 0
            };
        }

        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        maxDataCopyPos = getDataCopyMaxPos();
        if (actualPos.x < maxDataCopyPos.x.min) actualPos.x = maxDataCopyPos.x.min;
        if (actualPos.y < maxDataCopyPos.y.min) actualPos.y = maxDataCopyPos.y.min;
        if (actualPos.x > maxDataCopyPos.x.max) actualPos.x = maxDataCopyPos.x.max;
        if (actualPos.y > maxDataCopyPos.y.max) actualPos.y = maxDataCopyPos.y.max;

        // Двигаем элемент до нужной позиции
        dataCopyTranslate = 'translate3d(' + Math.round(actualPos.x) + 'px, ' + Math.round(actualPos.y) + 'px, 0)';
        applyDataCopyTransform();
    }

    function applyHelperTransform() {
        $helper.css({
            transform: helperTranslate + ' scale(' + 1 / scale + ')'
        });
        // console.log(getHelperPos());
    }

    function applyDataCopyTransform() {
        $dataCopy.css({
            transform: dataCopyTranslate + ' scale(' + scale + ')'
        });
    }

    function addControls() {
        var $schemeControls = $('<div class="scheme-controls"></div>');

        var $scaleMinus = $('<button class="control-scale__btn control-scale__btn--minus">-</button>');
        var $scalePlus = $('<button class="control-scale__btn control-scale__btn--plus">+</button>');
        var $scaleStatus = $('<div class="control-scale__status">100%</div>');

        var $controlScale = $('<div class="control-scale"></div>')
            .append($scaleStatus)
            .append($scaleMinus)
            .append($scalePlus);

        $schemeControls.append($controlScale);
        $zoomPlaceholder.append($schemeControls);
    }

    // ----------------------
    // Функции обработчиков
    // ----------------------

    function handleHelperDrag(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!helperIsDragging) {
            helperIsDragging = true;
            helperPos = getHelperPos();
            helperLastPos = {
                x: helperPos.x,
                y: helperPos.y,
            };
            $helper.addClass('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        var curHelperPos = {
            x: ev.deltaX + helperLastPos.x,
            y: ev.deltaY + helperLastPos.y
        };
        var curDataCopyPos = {
            x: - curHelperPos.x * proportion,
            y: - curHelperPos.y * proportion
        };

        setHelperPos(curHelperPos);
        setDataCopyPos(curDataCopyPos);

        // DRAG ENDED
        if (ev.isFinal) {
            helperIsDragging = false;
            $helper.removeClass('dragging');
        }
    }

    function handleDataCopyDrag(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!dataCopyIsDragging) {
            dataCopyIsDragging = true;
            dataCopyPos = getDataCopyPos();
            dataCopyLastPos = {
                x: dataCopyPos.x,
                y: dataCopyPos.y,
            };
            $dataCopy.addClass('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        var curDataCopyPos = {
            x: ev.deltaX + dataCopyLastPos.x,
            y: ev.deltaY + dataCopyLastPos.y
        };
        var curHelperPos = {
            x: - curDataCopyPos.x / proportion,
            y: - curDataCopyPos.y / proportion
        };

        setDataCopyPos(curDataCopyPos);
        setHelperPos(curHelperPos);

        // DRAG ENDED
        if (ev.isFinal) {
            dataCopyIsDragging = false;
            $dataCopy.removeClass('dragging');
        }
    }

    function changeScale(diff) {
        scale += diff;
        $zoomPlaceholder.find('.control-scale__status').html((scale * 100) + '%');
        applyDataCopyTransform();
        applyHelperTransform();
    }

})(jQuery, $);
