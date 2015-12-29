!function psudoQuerySelector () {
    if (doc.querySelectorAll) return;
    var head = doc.documentElement.firstChild;
    function createStyleTag () {
        return head.appendChild(doc.createElement('STYLE'));
    }
    function removeStyleTag (styleTag) {
        window.scrollBy(0, 0);
        setTimeout(function () {
            head.removeChild(styleTag);
        },0);
    }
    doc.querySelectorAll = function(selector) {
        var styleTag = createStyleTag();
        doc.__qsaels = [];

        styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
        
        removeStyleTag(styleTag);
        return doc.__qsaels;
    }

    doc.querySelector = function(selector) {
        var styleTag = createStyleTag();
        doc.__qsael = null;
        styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsael = document.__qsael || this )}";
        removeStyleTag(styleTag);
        
        return doc.__qsael;
    }
    
}(document);
