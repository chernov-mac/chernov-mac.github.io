(function() {

    var
        mainData        = document.getElementById('MainData'),
        helper          = document.getElementById('helper'),
        zoomPlaceholder = document.getElementById('ZoomPlaceholder'),
        dataCopy        = document.getElementById('DataCopy');

    var
        helperSize      = {}, // {x, y}
        helperPos       = {}, // {x, y}
        helperLastPos   = {}, // {x, y}
        helperMaxPos    = {}, // {x, y}
        dataCopyPos     = {}, // {x, y}
        dataCopyLastPos = {}, // {x, y}
        dataCopyMaxPos  = {}, // {x, y}
        dataCopySizeOut = {}, // {x, y}
        vision          = {}; // {x, y}


    var ratio = dataCopy.clientWidth / dataCopy.clientHeight;
    var proportion = dataCopy.clientWidth / mainData.clientWidth;
    var lastScale = 1,
        scale = 1;

    var helperIsDragging = false;
    var dataCopyIsDragging = false;

    var helperTranslate = 'translate3d(' + Math.round(helperLastPos.x) + 'px, ' + Math.round(helperLastPos.y) + 'px, 0)';
    var dataCopyTranslate = 'translate3d(' + Math.round(dataCopyLastPos.x) + 'px, ' + Math.round(dataCopyLastPos.y) + 'px, 0)';


    // ----------------------
    // Инициализация переменных
    // ----------------------

    helper.style.position = 'absolute';
    helper.style.top = 0;
    helper.style.left = 0;
    dataCopy.style.position = 'relative';
    dataCopy.style.top = 0;
    dataCopy.style.left = 0;

    setMainDataSize();
    setHelperSize();
    setHelperPos();
    addControls();
    changeScale(scale);

    // TODO: remove this
    var zoomPlaceholderCenter = document.createElement('div');
    zoomPlaceholderCenter.id = 'zoomPlaceholderCenter';
    zoomPlaceholderCenter.style.position = 'absolute';
    zoomPlaceholderCenter.style.zIndex = 2;
    zoomPlaceholderCenter.style.top = '50%';
    zoomPlaceholderCenter.style.left = '50%';
    zoomPlaceholderCenter.style.display = 'block';
    zoomPlaceholderCenter.style.width = '10px';
    zoomPlaceholderCenter.style.height = '10px';
    zoomPlaceholderCenter.style.transform = 'translate3d(-50%, -50%, 0) rotate(45deg)';
    zoomPlaceholderCenter.style.background = '#ffc800';
    zoomPlaceholderCenter.style.boxShadow = '0px 2px 20px 5px rgba(0, 0, 0, 0.4)';
    zoomPlaceholder.insertBefore(zoomPlaceholderCenter, dataCopy);

    // ----------------------
    // Инициалзация Hammer
    // ----------------------

    var helperManager = new Hammer.Manager(helper, {});
    helperManager.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    }));

    var dataCopyManager = new Hammer.Manager(dataCopy, {});
    dataCopyManager.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    }));
    dataCopyManager.add(new Hammer.Pinch({
        enable: true,
        threshold: 0
    })).recognizeWith([dataCopyManager.get('pan')]);
    dataCopyManager.get('pinch').set({ enable: true });


    // ----------------------
    // Инициализация событий
    // ----------------------

    window.addEventListener('resize', function(){
        setHelperSize();
        setHelperPos();
    });

    // #helper handlers
    helperManager.on('pan', handleHelperPan);

    // #DataCopy handlers
    dataCopyManager.on('pan', handleDataCopyPan);
    dataCopyManager.on('pinch', function(ev){
        var pinched = Math.round(ev.scale * 100) / 100;

        var curScale = lastScale * pinched;
        changeScale(curScale);
    });
    dataCopyManager.on('pinchend', function(ev){
        lastScale = scale;
    });

    // #ZoomPlaceholder handlers
    zoomPlaceholder.querySelector('.control-scale__btn--minus').addEventListener('click', function(){
        changeScale(scale - 0.25);
    });
    zoomPlaceholder.querySelector('.control-scale__btn--plus').addEventListener('click', function(){
        changeScale(scale + 0.25);
    });


    // ----------------------
    // Функции
    // ----------------------

    function getVision() {
        return {
            x: zoomPlaceholder.clientWidth / dataCopy.clientWidth,
            y: zoomPlaceholder.clientHeight / dataCopy.clientHeight
        };
    }

    function getDeltaSize(elem) {
        return {
            x: (elem.offsetWidth - elem.clientWidth),
            y: (elem.offsetHeight - elem.clientHeight)
        };
    }

    function getSizeOut(elem) {
        return {
            x: (elem.clientWidth * scale - elem.clientWidth),
            y: (elem.clientHeight * scale - elem.clientHeight)
        };
    }

    function getHelperMaxPos() {
        var deltaMainData = getDeltaSize(mainData);
        return {
            x: {
                min: 0,
                max: mainData.clientWidth - helper.clientWidth - deltaMainData.x
            },
            y: {
                min: 0,
                max: mainData.clientHeight - helper.clientHeight - deltaMainData.y
            }
        };
    }

    function getDataCopyMaxPos() {
        dataCopyPos = getDataCopyPos();
        dataCopySizeOut = getSizeOut(dataCopy);
        return {
            x: {
                min: - (dataCopy.clientWidth - zoomPlaceholder.clientWidth + dataCopySizeOut.x / 2),
                max: dataCopySizeOut.x / 2
            },
            y: {
                min: - (dataCopy.clientHeight - zoomPlaceholder.clientHeight + dataCopySizeOut.y / 2),
                max: dataCopySizeOut.y / 2
            }
        };
    }

    function getDataCopyPos() {
        var deltaZoomPlaceholder = getDeltaSize(zoomPlaceholder);
        var zoomPlaceholderRect = zoomPlaceholder.getBoundingClientRect();
        var dataCopyRect = dataCopy.getBoundingClientRect();
        return {
            x: zoomPlaceholderRect.left - dataCopyRect.left - deltaZoomPlaceholder.x,
            y: zoomPlaceholderRect.top - dataCopyRect.top - deltaZoomPlaceholder.y
        };
    }

    function getHelperPos() {
        return {
            x: helper.offsetLeft,
            y: helper.offsetTop
        };
    }

    function getHelperSize() {
        vision = getVision();
        return {
            width: mainData.clientWidth * (vision.x < 1 ? vision.x : 1),
            height: mainData.clientHeight * (vision.y < 1 ? vision.y : 1)
        };
    }

    function setMainDataSize() {
        var deltaSizeMainData = getDeltaSize(mainData);
        mainData.style.height = Math.round(mainData.clientWidth / ratio) + deltaSizeMainData.y + 'px';
    }

    function setHelperSize() {
        helperSize = getHelperSize();

        helperSize.width *= 1 / scale;
        if (helperSize.width > mainData.clientWidth) helperSize.width = mainData.clientWidth;
        helper.style.width = helperSize.width + 'px';

        helperSize.height *= 1 / scale;
        if (helperSize.height > mainData.clientHeight) helperSize.height = mainData.clientHeight;
        helper.style.height = helperSize.height + 'px';
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

        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        helperMaxPos = getHelperMaxPos();
        if (actualPos.x < helperMaxPos.x.min) actualPos.x = helperMaxPos.x.min;
        if (actualPos.y < helperMaxPos.y.min) actualPos.y = helperMaxPos.y.min;
        if (actualPos.x > helperMaxPos.x.max) actualPos.x = helperMaxPos.x.max;
        if (actualPos.y > helperMaxPos.y.max) actualPos.y = helperMaxPos.y.max;

        // Двигаем элемент до нужной позиции
        helper.style.top = actualPos.y + 'px';
        helper.style.left = actualPos.x + 'px';
    }

    function setDataCopyPos(actualPos) {
        if (!actualPos) {
            actualPos = {
                x: 0,
                y: 0
            };
        }

        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        dataCopyMaxPos = getDataCopyMaxPos();
        if (actualPos.x < dataCopyMaxPos.x.min) actualPos.x = dataCopyMaxPos.x.min;
        if (actualPos.y < dataCopyMaxPos.y.min) actualPos.y = dataCopyMaxPos.y.min;
        if (actualPos.x > dataCopyMaxPos.x.max) actualPos.x = dataCopyMaxPos.x.max;
        if (actualPos.y > dataCopyMaxPos.y.max) actualPos.y = dataCopyMaxPos.y.max;

        // Двигаем элемент до нужной позиции
        // TODO: check whis place
        dataCopyTranslate = 'translate3d(' + Math.round(actualPos.x) + 'px, ' + Math.round(actualPos.y) + 'px, 0)';
        applyDataCopyTransform();
    }

    function applyDataCopyTransform() {
        dataCopy.style.transform = dataCopyTranslate + ' scale(' + scale + ')';
    }

    function addControls() {
        var schemeControls = document.createElement('div');
        schemeControls.className = 'scheme-controls';

        var scaleMinusBtn = document.createElement('button');
        var scaleMinusBtnText = document.createTextNode('-');
        scaleMinusBtn.appendChild(scaleMinusBtnText);
        scaleMinusBtn.className = 'control-scale__btn control-scale__btn--minus';

        var scalePlusBtn = document.createElement('button');
        var scalePlusBtnText = document.createTextNode('+');
        scalePlusBtn.appendChild(scalePlusBtnText);
        scalePlusBtn.className = 'control-scale__btn control-scale__btn--plus';

        var scaleStatus = document.createElement('div');
        scaleStatus.className = 'control-scale__status';

        var controlScale = document.createElement('div');
        controlScale.className = 'control-scale';
        controlScale.appendChild(scaleStatus);
        controlScale.appendChild(scaleMinusBtn);
        controlScale.appendChild(scalePlusBtn);

        schemeControls.appendChild(controlScale);
        zoomPlaceholder.appendChild(schemeControls);
    }

    // ----------------------
    // Функции обработчиков
    // ----------------------

    function handleHelperPan(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!helperIsDragging) {
            helperIsDragging = true;
            helperLastPos = getHelperPos();
            helper.classList.add('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        var curHelperPos = {
            x: ev.deltaX + helperLastPos.x,
            y: ev.deltaY + helperLastPos.y
        };

        dataCopySizeOut = getSizeOut(dataCopy);
        var curDataCopyPos = {
            x: - Math.round((ev.deltaX + helperLastPos.x) * proportion * scale) + dataCopySizeOut.x / 2,
            y: - Math.round((ev.deltaY + helperLastPos.y) * proportion * scale) + dataCopySizeOut.y / 2
        };

        setHelperPos(curHelperPos);
        setDataCopyPos(curDataCopyPos);

        // DRAG ENDED
        if (ev.isFinal) {
            helperIsDragging = false;
            helper.classList.remove('dragging');
        }
    }

    function handleDataCopyPan(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!dataCopyIsDragging) {
            dataCopyIsDragging = true;
            dataCopyLastPos = getDataCopyPos();
            console.log(dataCopyLastPos);
            dataCopy.classList.add('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        dataCopySizeOut = getSizeOut(dataCopy);
        var curDataCopyPos = {
            x: ev.deltaX + dataCopyLastPos.x + dataCopySizeOut.x / 2,
            y: ev.deltaY + dataCopyLastPos.y + dataCopySizeOut.y / 2
        };
        var curHelperPos = {
            x: - Math.round((ev.deltaX + dataCopyLastPos.x) / proportion / scale),
            y: - Math.round((ev.deltaY + dataCopyLastPos.y) / proportion / scale)
        };

        setDataCopyPos(curDataCopyPos);
        setHelperPos(curHelperPos);

        // DRAG ENDED
        if (ev.isFinal) {
            dataCopyIsDragging = false;
            dataCopy.classList.remove('dragging');
        }
    }

    function changeScale(actualScale) {
        scale = actualScale > 0.25 ? actualScale : 0.25;

        setDataCopyPos();
        dataCopyPos = getDataCopyPos();

        var curHelperPos = {
            x: - Math.round(dataCopyPos.x / proportion / scale),
            y: - Math.round(dataCopyPos.y / proportion / scale)
        };
        setHelperSize();
        setHelperPos(curHelperPos);

        zoomPlaceholder.querySelector('.control-scale__status').innerHTML = Math.round(scale * 100) + '%';
    }

})(jQuery, $);
