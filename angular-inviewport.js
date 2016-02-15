var foo = angular.module('angular-inviewport', []).directive('inViewport', [function () {

    return {
        restrict: 'A',
        require: '?^inViewportContainer',
        transclude: true,
        link: function ($scope, $element, attributes, controller, $transclude) {

            var bound = false;
            var wasVisible = false;
            var parentElement = controller ? controller.getElement() : null;

            var checkVisible = function () {
                var isVisible = isInsideContainer();
                if(isVisible !== wasVisible){
                    setVisible(isVisible);
                }
            };

            var bindEvents = function () {
                if (!bound) {
                    bound = true;
                    if (parentElement) {
                        parentElement.bind('scroll resize refreshIsDisplayed', checkVisible);
                    }
                    angular.element(window).bind('scroll ready resize refreshIsDisplayed', checkVisible);
                }
            };

            var unbindEvents = function () {
                if (bound) {
                    bound = false;
                    if(parentElement) {
                        parentElement.unbind('scroll resize refreshIsDisplayed', checkVisible);
                    }
                    angular.element(window).unbind('scroll ready resize refreshIsDisplayed', checkVisible);
                }
            };

            function isInsideContainer() {
                var elementRect = $element[0].getBoundingClientRect();
                var viewPortRect = parentElement ? parentElement[0].getBoundingClientRect() : {
                    top: 0,
                    bottom: document.documentElement.clientHeight,
                    left: 0,
                    right: document.documentElement.clientWidth
                }
                return !(elementRect.right < viewPortRect.left || elementRect.left > viewPortRect.right || elementRect.bottom < viewPortRect.top || elementRect.top > viewPortRect.bottom);
            };

            function setVisible(show) {
                if (show) {
                    $transclude(function(clone) {
                        $element.empty();
                        $element.append(clone);
                        wasVisible = true;
                    });
                } else {
                    $element.empty();
                    wasVisible = false;
                }
            };
            $scope.$watch(isInsideContainer, setVisible);
            bindEvents();
            $scope.$on('$destroy', function () {
                unbindEvents();
            });
        }
    }
}]).directive('inViewportContainer', function () {
    return {
        restrict: 'A',
        controller: ['$element', function ($element) {
            this.getElement = function () {
                return $element;
            };
        }]
    };
});
module.exports = foo;